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
    // Require JWT auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Check access
    const access = await checkAccess(supabase, user);
    if (!access.allowed) {
      return new Response(JSON.stringify({ error: 'Subscription or trial expired' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json().catch(() => ({}));
    const useStaging = body.staging || false;
    const maxArticlesPerSource = 5; // Limit to 5 articles per source
    const maxSources = 10; // Limit to 10 sources per request

    console.log(`Starting news fetch process... (Staging mode: ${useStaging}, Max articles per source: ${maxArticlesPerSource}, Max sources: ${maxSources})`);

    // Fetch active news sources with better error handling
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    // Limit the number of sources processed per request
    const limitedSources = sources ? sources.slice(0, maxSources) : [];

    let totalNewArticles = 0;
    let totalProcessedSources = 0;
    let totalErrors = 0;
    const targetTable = useStaging ? 'news_articles_staging' : 'news_articles';
    const sourceResults: any[] = [];

    for (const source of limitedSources) {
      const sourceResult = {
        name: source.name,
        url: source.url,
        category: source.category,
        articlesFound: 0,
        articlesAdded: 0,
        errors: [] as string[]
      };

      try {
        console.log(`Processing source: ${source.name} (${source.url})`);
        
        // Defensive: Check content type before parsing
        const feedResponse = await fetch(source.url);
        const contentType = feedResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('xml')) {
          console.warn(`Skipping source ${source.name}: Not an XML feed`);
          sourceResult.errors.push('Not an XML feed');
          totalErrors++;
          continue;
        }
        const feedText = await feedResponse.text();
        let feed;
        try {
          feed = await parseFeed(feedText);
        } catch (err) {
          console.error(`Error parsing feed for ${source.name}:`, err);
          sourceResult.errors.push('Feed parsing error');
          totalErrors++;
          continue;
        }
        
        const items = feed.entries || [];
        
        sourceResult.articlesFound = items.length;
        console.log(`Found ${items.length} items in RSS feed for ${source.name}`);

        // Process items with limit
        const itemsToProcess = items.slice(0, maxArticlesPerSource);
        
        for (const item of itemsToProcess) {
          try {
            const title = cleanHtmlContent(item.title?.value || '');
            let description = cleanHtmlContent(item.description?.value || '');
            const link = item.links?.[0]?.href || item.id || '';
            const pubDate = item.published || item.updated || item.pubDate || '';

            if (!title || title.length < 10) {
              console.log(`Skipping item with insufficient title: "${title}"`);
              continue;
            }

            // Enhanced duplicate checking
            const isDuplicateArticle = await isDuplicate(supabase, title, source.name, link, targetTable);
            if (isDuplicateArticle) {
              console.log(`Duplicate article found, skipping: ${title}`);
              continue;
            }

            // Enhanced date parsing
            const { date: publishedAt, isFallback: dateIsFallback } = parsePublishDate(pubDate);

            // Enhanced category detection
            const detectedCategory = detectCategory(title, description, source.name, source.category);

            // For both staging and production modes, always insert into news_articles_staging only
            const { data: newArticle, error: insertError } = await supabase
              .from('news_articles_staging')
              .insert({
                title,
                description: description || '',
                source: source.name,
                url: link || null,
                category: detectedCategory,
                published_at: publishedAt,
                has_valid_description: isValidDescription(description),
                is_processed: false
              })
              .select('id')
              .single();
            if (insertError) {
              console.error('Error inserting article to staging:', insertError);
              sourceResult.errors.push(`Insert error: ${insertError.message}`);
              continue;
            }
            sourceResult.articlesAdded++;
            totalNewArticles++;
            console.log(`Inserted article to staging: ${title}`);

          } catch (itemError) {
            console.error('Error processing item:', itemError);
            sourceResult.errors.push(`Item processing error: ${itemError.message}`);
          }
        }

        totalProcessedSources++;

      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
        sourceResult.errors.push(`Source error: ${sourceError.message}`);
        totalErrors++;
      }

      sourceResults.push(sourceResult);
    }

    // Update analytics
    try {
      const { error: analyticsError } = await supabase
        .from('analytics')
        .upsert({
          metric_name: 'news_fetch_run',
          metric_value: totalNewArticles,
          date_recorded: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'metric_name,date_recorded'
        });

      if (analyticsError) {
        console.error('Error updating analytics:', analyticsError);
      }
    } catch (analyticsError) {
      console.error('Error in analytics update:', analyticsError);
    }

    const mode = useStaging ? 'staging' : 'production';
    const summary = {
      mode,
      totalSources: sources?.length || 0,
      processedSources: totalProcessedSources,
      totalNewArticles,
      totalErrors,
      sourceResults: sourceResults.filter(r => r.errors.length > 0 || r.articlesAdded > 0)
    };

    console.log(`Finished processing all sources. Summary:`, summary);

    // After processing sources, fetch the latest articles for the user
    const { data: articles, error: articlesError } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(200);

    if (articlesError) {
      return new Response(JSON.stringify({ error: articlesError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      message: `News fetched successfully in ${mode} mode`,
      summary,
      articles
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch news',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});