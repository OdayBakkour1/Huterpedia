import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseFeed } from "https://deno.land/x/rss/mod.ts";

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
      '&hellip;': '…',
      '&apos;': "'",
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™'
    };
    
    return str.replace(/&[#\w]+;/g, (entity) => {
      return entityMap[entity] || entity;
    });
  };
  
  let cleaned = text
    // Remove script and style tags completely
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove img tags completely (including incomplete ones)
    .replace(/<img[^>]*>/gi, '')
    .replace(/<img[^>]*$/gi, '')
    // Remove all other HTML tags including incomplete ones
    .replace(/<[^>]*>/g, ' ')
    .replace(/<[^>]*$/g, '')
    .replace(/^[^<]*>/g, '')
    // Remove incomplete HTML attributes
    .replace(/\s+src="[^"]*"?/gi, '')
    .replace(/\s+href="[^"]*"?/gi, '')
    .replace(/\s+class="[^"]*"?/gi, '')
    .replace(/\s+style="[^"]*"?/gi, '')
    // Remove broken image URLs and incomplete attributes
    .replace(/https?:\/\/[^\s<>"]*-\s*$/gi, '')
    .replace(/src="[^"]*$/gi, '')
    .replace(/href="[^"]*$/gi, '')
    // Remove multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove line breaks and tabs
    .replace(/[\n\r\t]/g, ' ')
    .trim();
  
  // Decode HTML entities
  cleaned = decodeHtmlEntities(cleaned);
  
  // Final cleanup for any remaining artifacts
  cleaned = cleaned
    // Remove any remaining incomplete tags or attributes
    .replace(/[<>]/g, '')
    // Remove standalone attribute patterns
    .replace(/\b(src|href|class|style|id)=["'][^"']*["']?/gi, '')
    .replace(/\b(src|href|class|style|id)=[^\s]*/gi, '')
    // Clean up multiple spaces again
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
};

// Enhanced category detection
const detectCategory = (title: string, description: string, source: string, defaultCategory: string): string => {
  const text = `${title} ${description}`.toLowerCase();
  
  // Threat-related keywords
  if (text.match(/\b(apt|advanced persistent threat|nation.?state|state.?sponsored|cyber.?attack|hack|breach|compromise|infiltrat|exploit|zero.?day|0.?day)\b/)) {
    return 'Threats';
  }
  
  // Vulnerability keywords
  if (text.match(/\b(cve|vulnerability|vuln|patch|security.?update|security.?fix|buffer.?overflow|sql.?injection|xss|rce|remote.?code.?execution)\b/)) {
    return 'Vulnerabilities';
  }
  
  // Breach keywords
  if (text.match(/\b(data.?breach|data.?leak|exposed|stolen|theft|ransomware|extortion|leak)\b/)) {
    return 'Breaches';
  }
  
  // Malware keywords
  if (text.match(/\b(malware|trojan|virus|worm|backdoor|rootkit|spyware|adware|botnet)\b/)) {
    return 'Threats';
  }
  
  // Phishing keywords
  if (text.match(/\b(phishing|spear.?phishing|social.?engineering|scam|fraud|impersonat)\b/)) {
    return 'Threats';
  }
  
  // Analysis keywords
  if (text.match(/\b(analysis|research|report|study|investigation|forensic|incident.?response)\b/)) {
    return 'Analysis';
  }
  
  // Updates keywords
  if (text.match(/\b(update|release|announcement|advisory|alert|warning|guidance)\b/)) {
    return 'Updates';
  }
  
  return defaultCategory;
};

// Cache article content in storage
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

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('article-cache')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in cacheArticleContent:', error);
    return null;
  }
};

// Enhanced description validation
const isValidDescription = (description: string): boolean => {
  if (!description) return false;
  
  const cleaned = cleanHtmlContent(description);
  
  // Must be at least 30 characters for meaningful content
  if (cleaned.length < 30) return false;
  
  // Check if description contains mostly HTML artifacts
  const htmlArtifacts = /src=|href=|<[^>]*|img\s|style=|class=|https?:\/\/[^\s]*-\s*$/gi;
  const artifactMatches = cleaned.match(htmlArtifacts);
  
  // If more than 15% of the content is HTML artifacts, consider it invalid
  if (artifactMatches && artifactMatches.length > cleaned.length * 0.15) return false;
  
  // Check for common invalid patterns
  const invalidPatterns = [
    /^(read more|continue reading|click here)/i,
    /^(the post|this article|this story)/i,
    /^\s*\.{3,}\s*$/,
    /^\s*-+\s*$/
  ];
  
  if (invalidPatterns.some(pattern => pattern.test(cleaned))) return false;
  
  return true;
};

// Enhanced AI description generation with better error handling
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
- Include relevant technical details if mentioned in the title

Do not include HTML tags, special formatting, or promotional language.`;

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
    
    // Clean the generated text
    return cleanHtmlContent(generatedText);
  } catch (error) {
    console.error('Error generating AI description:', error);
    return '';
  }
};

// Enhanced duplicate detection
const isDuplicate = async (supabase: any, title: string, source: string, url: string, targetTable: string): Promise<boolean> => {
  try {
    // Check for exact title and source match
    const { data: exactMatch } = await supabase
      .from(targetTable)
      .select('id')
      .eq('title', title)
      .eq('source', source)
      .single();

    if (exactMatch) return true;

    // Check for URL match if URL exists
    if (url) {
      const { data: urlMatch } = await supabase
        .from(targetTable)
        .select('id')
        .eq('url', url)
        .single();

      if (urlMatch) return true;
    }

    // Check for similar titles (fuzzy matching)
    const { data: similarTitles } = await supabase
      .from(targetTable)
      .select('title')
      .eq('source', source)
      .limit(50);

    if (similarTitles) {
      const normalizedTitle = title.toLowerCase().replace(/[^\w\s]/g, '').trim();
      for (const article of similarTitles) {
        const normalizedExisting = article.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Calculate similarity (simple word overlap)
        const titleWords = normalizedTitle.split(/\s+/);
        const existingWords = normalizedExisting.split(/\s+/);
        const commonWords = titleWords.filter(word => 
          word.length > 3 && existingWords.includes(word)
        );
        
        // If more than 70% of words match, consider it a duplicate
        if (commonWords.length / Math.max(titleWords.length, existingWords.length) > 0.7) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return false;
  }
};

// Enhanced date parsing
const parsePublishDate = (pubDate: string): { date: string; isFallback: boolean } => {
  if (!pubDate) {
    return { date: new Date().toISOString(), isFallback: true };
  }

  try {
    // Try parsing the date
    const parsed = Date.parse(pubDate);
    if (!isNaN(parsed)) {
      const date = new Date(parsed);
      
      // Check if date is reasonable (not too far in future or past)
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (date >= oneYearAgo && date <= oneWeekFromNow) {
        return { date: date.toISOString(), isFallback: false };
      }
    }
  } catch (error) {
    console.error('Error parsing date:', pubDate, error);
  }

  return { date: new Date().toISOString(), isFallback: true };
};

// Utility to check subscription/trial status and admin
async function checkAccess(supabase, user) {
  // Admin bypass by email (case-insensitive)
  if (user.email && user.email.toLowerCase() === 'odaybakour2@gmail.com') return { isAdmin: true, allowed: true };
  // Or by role
  const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  if (roleData?.role === 'admin') return { isAdmin: true, allowed: true };
  // Check subscription
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

  try {
    console.log('Starting news fetch process...');
    
    // For backend operations, use service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Clear staging table first
    console.log('Clearing staging table...');
    const { error: deleteError } = await supabase
      .from('news_articles_staging')
      .delete()
      .neq('id', null);
    if (deleteError) {
      console.error('Error clearing staging table:', deleteError);
      return new Response(JSON.stringify({ error: 'Failed to clear staging table', details: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch active news sources
    console.log('Fetching active news sources...');
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch news sources', details: sourcesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    // Limit the number of sources processed per request
    const limitedSources = sources?.slice(0, 10) || [];
    const maxArticlesPerSource = 5;
    const articlesBatch = [];
    let totalArticles = 0;

    for (const source of limitedSources) {
      try {
        console.log(`Processing source: ${source.name} (${source.url})`);
        
        // Fetch and parse RSS feed
        const feedResponse = await fetch(source.url);
        const contentType = feedResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('xml')) {
          console.warn(`Skipping source ${source.name}: Not an XML feed`);
          continue;
        }
        
        const feedText = await feedResponse.text();
        const feed = await parseFeed(feedText);
        const items = feed.entries || [];
        
        console.log(`Found ${items.length} items in RSS feed for ${source.name}`);
        
        // Process items with limit
        const itemsToProcess = items.slice(0, maxArticlesPerSource);
        
        for (const item of itemsToProcess) {
          try {
            const title = cleanHtmlContent(item.title?.value || '');
            let description = cleanHtmlContent(item.description?.value || '');
            const link = item.links?.[0]?.href || item.id || '';
            const { date: pubDate } = parsePublishDate(item.published || item.updated || item.pubDate || '');

            if (!title || title.length < 10) {
              console.log(`Skipping item with insufficient title: "${title}"`);
              continue;
            }

            // Check if article already exists
            const { data: existing } = await supabase
              .from('news_articles')
              .select('id')
              .eq('url', link)
              .single();

            if (existing) {
              console.log(`Skipping duplicate article: ${title}`);
              continue;
            }

            // Add to batch
            const article = {
              title,
              description,
              source: source.name,
              url: link,
              category: detectCategory(title, description, source.name, source.category || 'General'),
              published_at: pubDate,
              has_valid_description: isValidDescription(description),
              is_processed: false
            };
            
            articlesBatch.push(article);
            totalArticles++;

            // Bulk insert when batch reaches 100 items
            if (articlesBatch.length >= 100) {
              console.log(`Inserting batch of ${articlesBatch.length} articles...`);
              const { error: insertError } = await supabase
                .from('news_articles_staging')
                .insert(articlesBatch);
              
              if (insertError) {
                console.error('Error inserting batch:', insertError);
                continue;
              }
              
              articlesBatch.length = 0;
            }
          } catch (error) {
            console.error(`Error processing article from ${source.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
      }
    }

    // Insert any remaining articles
    if (articlesBatch.length > 0) {
      console.log(`Inserting remaining ${articlesBatch.length} articles...`);
      const { error: finalInsertError } = await supabase
        .from('news_articles_staging')
        .insert(articlesBatch);
      
      if (finalInsertError) {
        console.error('Error inserting final batch:', finalInsertError);
      }
    }

    console.log(`Total articles processed: ${totalArticles}`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'News articles processed successfully',
      stats: {
        totalSources: sources?.length || 0,
        processedSources: limitedSources.length,
        totalArticles
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in main handler:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});