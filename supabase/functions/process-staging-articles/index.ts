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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.log('No GEMINI_API_KEY found, skipping AI description generation');
      return '';
    }

    const prompt = `Generate a concise, professional description (2-3 sentences, max 200 words) for this cybersecurity news article:

Title: ${title}
Source: ${source}
${url ? `URL: ${url}` : ''}

The description should:
- Summarize the key cybersecurity implications
- Be factual and informative
- Focus on the main threat, vulnerability, or security development
- Be suitable for a cybersecurity news aggregator

Do not include HTML tags or special formatting.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to generate AI description: ${response.status}`, errorText);
      return '';
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return cleanHtmlContent(generatedText);
  } catch (error) {
    console.error('Error generating AI description:', error);
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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