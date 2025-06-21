import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseFeed } from "https://deno.land/x/rss/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Clean HTML content utility
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
    .replace(/<img[^>]*>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .trim();
  
  cleaned = decodeHtmlEntities(cleaned);
  
  cleaned = cleaned
    .replace(/src="[^"]*$/gi, '')
    .replace(/href="[^"]*$/gi, '')
    .replace(/<[^>]*$/g, '')
    .replace(/^[^<]*>/g, '')
    .trim();
  
  return cleaned;
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

// Check if description is valid
const isValidDescription = (description: string): boolean => {
  if (!description) return false;
  
  const cleaned = cleanHtmlContent(description);
  
  if (cleaned.length < 20) return false;
  
  const htmlArtifacts = /src=|href=|<[^>]*|img\s|style=|class=/gi;
  const artifactMatches = cleaned.match(htmlArtifacts);
  
  if (artifactMatches && artifactMatches.length > cleaned.length * 0.2) return false;
  
  return true;
};

// Generate AI description with rate limiting
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Error generating AI description:', error);
    return '';
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
    const useStaging = body.staging || false;

    console.log(`Fetching active news sources... (Staging mode: ${useStaging})`);

    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError);
      throw sourcesError;
    }

    console.log(`Found ${sources?.length || 0} active sources`);

    let totalNewArticles = 0;
    const targetTable = useStaging ? 'news_articles_staging' : 'news_articles';

    for (const source of sources || []) {
      try {
        console.log(`Processing source: ${source.name} (${source.url})`);
        
        const response = await fetch(source.url);
        if (!response.ok) {
          console.error(`Failed to fetch ${source.url}: ${response.statusText}`);
          continue;
        }
        const xmlText = await response.text();
        const feed = await parseFeed(xmlText);
        
        const items = feed.entries || [];
        
        console.log(`Found ${items.length} items in RSS feed`);

        for (const item of items) {
          try {
            const title = item.title?.value || '';
            let description = item.description?.value || '';
            const link = item.links?.[0]?.href || item.id || '';
            const pubDate = item.published || item.updated || '';

            if (!title) continue;

            // title = cleanHtmlContent(title); // Title is usually plain text
            description = cleanHtmlContent(description || '');

            // Check for existing article in the target table
            const { data: existingArticle } = await supabase
              .from(targetTable)
              .select('id')
              .eq('title', title)
              .eq('source', source.name)
              .single();

            if (existingArticle) {
              continue;
            }

            let publishedAt = new Date().toISOString();
            if (pubDate) {
              try {
                publishedAt = new Date(pubDate).toISOString();
              } catch (e) {
                console.log('Failed to parse date:', pubDate);
              }
            }

            // For staging, we don't generate AI descriptions immediately
            if (useStaging) {
              const { data: newArticle, error: insertError } = await supabase
                .from('news_articles_staging')
                .insert({
                  title,
                  description: description || '',
                  source: source.name,
                  url: link,
                  category: source.category,
                  published_at: publishedAt,
                })
                .select('id')
                .single();

              if (insertError) {
                console.error('Error inserting article to staging:', insertError);
                continue;
              }

              totalNewArticles++;
              console.log(`Inserted article to staging: ${title}`);
            } else {
              // Original logic for direct insertion
              if (!isValidDescription(description)) {
                console.log(`Generating AI description for: ${title}`);
                const aiDescription = await generateDescription(title, link, source.name);
                if (aiDescription) {
                  description = aiDescription;
                  console.log('AI description generated successfully');
                } else {
                  description = `This cybersecurity article from ${source.name} discusses important security developments. Click to read the full article for detailed information.`;
                }
              }

              if (!description || description.length < 20) {
                console.log(`Skipping article with insufficient description: ${title}`);
                continue;
              }

              const { data: newArticle, error: insertError } = await supabase
                .from('news_articles')
                .insert({
                  title,
                  description,
                  source: source.name,
                  url: link,
                  category: source.category,
                  published_at: publishedAt,
                })
                .select('id')
                .single();

              if (insertError) {
                console.error('Error inserting article:', insertError);
                continue;
              }

              // Cache the article content
              const cachedContentUrl = await cacheArticleContent(supabase, newArticle.id, title, description);
              
              if (cachedContentUrl) {
                await supabase
                  .from('news_articles')
                  .update({
                    cached_content_url: cachedContentUrl,
                    cache_updated_at: new Date().toISOString()
                  })
                  .eq('id', newArticle.id);
                
                console.log(`Article cached successfully: ${title}`);
              }

              totalNewArticles++;
              console.log(`Inserted new article: ${title}`);
            }

          } catch (itemError) {
            console.error('Error processing item:', itemError);
          }
        }

      } catch (sourceError) {
        console.error(`Error processing source ${source.name}:`, sourceError);
      }
    }

    const mode = useStaging ? 'staging' : 'production';
    console.log(`Successfully processed news sources in ${mode} mode. Added ${totalNewArticles} new articles.`);

    console.log(`Finished processing all sources. Total new articles: ${totalNewArticles}`);

    return new Response(JSON.stringify({ message: "News fetched successfully", totalNewArticles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in fetch-news function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch news',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
