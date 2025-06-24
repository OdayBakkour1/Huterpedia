import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced HTML content cleaning utility
const cleanHtmlContent = (text: string): string => {
  if (!text) return '';
  
  const decodeHtmlEntities = (str: string) => {
    const entityMap: { [key: string]: string } = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
      '&ldquo;': '"',
      '&rdquo;': '"',
      '&lsquo;': "'",
      '&rsquo;': "'",
      '&mdash;': '—',
      '&ndash;': '–',
      '&hellip;': '…'
    };
    
    return str.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  };
  
  let cleaned = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
  
  cleaned = decodeHtmlEntities(cleaned);
  
  return cleaned
    .replace(/[<>]/g, '')
    .replace(/\b(src|href|class|style|id)=["'][^"']*["']?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Enhanced description validation
const isValidDescription = (description: string): boolean => {
  if (!description) return false;
  
  const cleaned = cleanHtmlContent(description);
  if (cleaned.length < 30) return false;
  
  const htmlArtifacts = /src=|href=|<[^>]*|img\s|style=|class=/gi;
  const artifactMatches = cleaned.match(htmlArtifacts);
  
  if (artifactMatches && artifactMatches.length > cleaned.length * 0.15) return false;
  
  const invalidPatterns = [
    /^(read more|continue reading|click here)/i,
    /^(the post|this article|this story)/i,
    /^\s*\.{3,}\s*$/,
    /^\s*-+\s*$/
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(cleaned));
};

// Generate AI description
const generateDescription = async (title: string, url: string, source: string): Promise<string> => {
  try {
    const internalSecret = Deno.env.get('INTERNAL_EDGE_SECRET');
    if (!internalSecret) {
      console.error('INTERNAL_EDGE_SECRET not set');
      return '';
    }
    const response = await fetch('https://gzpayeckolpfflgvkqvh.functions.supabase.co/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Call': internalSecret
      },
      body: JSON.stringify({ title, url, source })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('generate-description Edge Function error:', errorText);
      return '';
    }
    const data = await response.json();
    return data.description || '';
  } catch (error) {
    console.error('Error calling generate-description Edge Function:', error);
    return '';
  }
};

// Cache article content
const cacheArticleContent = async (supabase: any, articleId: string, title: string, description: string): Promise<string | null> => {
  try {
    const contentData = {
      id: articleId,
      title,
      description,
      cached_at: new Date().toISOString()
    };
    
    const contentBlob = new Blob([JSON.stringify(contentData)], { type: 'application/json' });
    const fileName = `${articleId}.json`;
    
    const { data, error } = await supabase.storage
      .from('article-cache')
      .upload(fileName, contentBlob, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error caching article content:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('article-cache')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in cacheArticleContent:', error);
    return null;
  }
};

// Utility to check subscription/trial status and admin
async function checkAccess(supabase, user) {
  if (user.email && user.email.toLowerCase() === 'odaybakour2@gmail.com') return { isAdmin: true, allowed: true };
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (roleData?.role === 'admin') return { isAdmin: true, allowed: true };
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, trial_end_date, subscription_end_date')
    .eq('user_id', user.id)
    .maybeSingle();
  const now = new Date();
  if (subscription) {
    if (subscription.status === 'active' && subscription.subscription_end_date && new Date(subscription.subscription_end_date) > now) return { isAdmin: false, allowed: true };
    if (subscription.status === 'trial' && subscription.trial_end_date && new Date(subscription.trial_end_date) > now) return { isAdmin: false, allowed: true };
  }
  return { isAdmin: false, allowed: false };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  // Require JWT or Service Role auth
  const authHeader = req.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  // Allow Service Role key for backend automation
  if (authHeader === `Bearer ${supabaseServiceKey}`) {
    // Backend automation: allow full access, skip user checks
    // ... proceed with function logic as backend
    // (You may set a flag like isBackend = true if needed)
  } else {
    // User JWT: validate and check access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const access = await checkAccess(supabase, user);
    if (!access.allowed) {
      return new Response(JSON.stringify({ error: 'Subscription or trial expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = body.batchSize || 50;

    console.log(`Starting staging articles processing... (Batch size: ${batchSize})`);

    // Get unprocessed staging articles
    const { data: stagingArticles, error: fetchError } = await supabase
      .from('news_articles_staging')
      .select('*')
      .eq('is_processed', false)
      .order('created_at', { ascending: true })
      .limit(batchSize);

    if (fetchError) {
      console.error('Error fetching staging articles:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${stagingArticles?.length || 0} unprocessed staging articles`);

    if (!stagingArticles || stagingArticles.length === 0) {
      return new Response(JSON.stringify({
        message: 'No staging articles to process',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let processedCount = 0;
    let movedCount = 0;
    let duplicatesRemoved = 0;
    const errors: string[] = [];

    for (const article of stagingArticles) {
      try {
        // Check for duplicates in production table
        const { data: existingArticle } = await supabase
          .from('news_articles')
          .select('id')
          .or(`title.eq.${article.title},url.eq.${article.url}`)
          .eq('source', article.source)
          .single();

        if (existingArticle) {
          // Mark as processed and skip
          await supabase
            .from('news_articles_staging')
            .update({ is_processed: true })
            .eq('id', article.id);
          
          duplicatesRemoved++;
          processedCount++;
          console.log(`Duplicate found, skipping: ${article.title}`);
          continue;
        }

        let description = article.description || '';

        // Generate AI description if needed
        if (!isValidDescription(description)) {
          console.log(`Generating AI description for: ${article.title}`);
          const aiDescription = await generateDescription(article.title, article.url, article.source);
          if (aiDescription && aiDescription.length > 30) {
            description = aiDescription;
            console.log('AI description generated successfully');
          } else {
            description = `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`;
          }
        }

        // Insert into production table
        const { data: newArticle, error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: article.title,
            description,
            source: article.source,
            url: article.url,
            category: article.category,
            published_at: article.published_at,
            image_url: article.image_url,
            cached_content_url: article.cached_content_url,
            cached_image_url: article.cached_image_url,
            cache_updated_at: article.cache_updated_at
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting article to production:', insertError);
          errors.push(`Insert error for "${article.title}": ${insertError.message}`);
          continue;
        }

        // Cache the article content if not already cached
        if (!article.cached_content_url) {
          const cachedContentUrl = await cacheArticleContent(supabase, newArticle.id, article.title, description);
          
          if (cachedContentUrl) {
            await supabase
              .from('news_articles')
              .update({
                cached_content_url: cachedContentUrl,
                cache_updated_at: new Date().toISOString()
              })
              .eq('id', newArticle.id);
          }
        }

        // Mark staging article as processed
        await supabase
          .from('news_articles_staging')
          .update({ is_processed: true })
          .eq('id', article.id);

        movedCount++;
        processedCount++;
        console.log(`Moved article to production: ${article.title}`);

      } catch (error) {
        console.error(`Error processing article "${article.title}":`, error);
        errors.push(`Processing error for "${article.title}": ${error.message}`);
      }
    }

    // Clean up old processed staging articles (older than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { error: cleanupError } = await supabase
      .from('news_articles_staging')
      .delete()
      .eq('is_processed', true)
      .lt('created_at', sevenDaysAgo.toISOString());

    if (cleanupError) {
      console.error('Error cleaning up old staging articles:', cleanupError);
    }

    const summary = {
      totalStaged: stagingArticles.length,
      processed: processedCount,
      movedToProduction: movedCount,
      duplicatesRemoved,
      errors: errors.length,
      errorDetails: errors.slice(0, 10) // Limit error details
    };

    console.log('Processing complete:', summary);

    return new Response(JSON.stringify({
      message: 'Staging articles processed successfully',
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-staging-articles function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process staging articles',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});