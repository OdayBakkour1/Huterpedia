// supabase/functions/process-rss-batch/index.ts (Final Version with NEW Categories)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';
import { parseFeed } from 'https://deno.land/x/rss/mod.ts';
// --- UTILITY FUNCTIONS ---
function cleanContent(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc) return '';
  doc.querySelectorAll('script, style, img').forEach((el)=>el.remove());
  const textContent = doc.body.textContent ?? '';
  return textContent.replace(/\s\s+/g, ' ').trim();
}
/**
 * Detects the category of an article with a more granular filter.
 * @param title The article title.
 * @param description The article description.
 * @param defaultCategory The default category from the news source.
 * @returns The detected category.
 */ function detectCategory(title, description, defaultCategory) {
  const text = `${title} ${description}`.toLowerCase();
  // Most specific categories first
  if (/\b(apt|advanced persistent threat|nation.?state|state.?sponsored)\b/.test(text)) return 'APT';
  if (/\b(zero.?day|0.?day|unpatched)\b/.test(text)) return 'Zero Day';
  if (/\b(cve|cve-[0-9]{4}-[0-9]{4,})\b/.test(text)) return 'CVE';
  if (/\b(ransomware|extortion|double.?extortion)\b/.test(text)) return 'Ransomware';
  if (/\b(phishing|spear.?phishing|whaling|credential.?harvesting)\b/.test(text)) return 'Phishing';
  if (/\b(social.?engineering|pretexting|baiting|vishing|smishing)\b/.test(text)) return 'Social Engineering';
  if (/\b(malware|trojan|virus|worm|backdoor|rootkit|spyware|adware|botnet|keylogger|infostealer)\b/.test(text)) return 'Malware';
  if (/\b(vulnerability|vuln|flaw|rce|remote.?code.?execution|sql.?injection|xss|buffer.?overflow)\b/.test(text)) return 'Vulnerabilities';
  if (/\b(data.?breach|data.?leak|exposed|stolen|compromise)\b/.test(text)) return 'Breaches';
  if (/\b(tool|toolkit|framework|open.?source|github|powershell|mimikatz|cobalt.?strike|metasploit)\b/.test(text)) return 'Tools';
  // General catch-all for threats
  if (/\b(threat|cyber.?attack|hack|infiltrat|campaign)\b/.test(text)) return 'Threats';
  return defaultCategory; // Fallback to the source's default category
}
Deno.serve(async (req)=>{
  try {
    const { batch } = await req.json();
    if (!batch || batch.length === 0) {
      return new Response(JSON.stringify({
        message: 'No sources provided in batch.'
      }), {
        status: 400
      });
    }
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const allProcessedArticles = [];
    console.log(`Worker starting: processing a batch of ${batch.length} sources. Filtering articles since ${threeDaysAgo.toISOString()}`);
    for (const source of batch){
      try {
        const response = await fetch(source.url);
        if (!response.ok) {
          console.error(`[${source.name}] ERROR: Failed to fetch. Skipping.`);
          continue;
        }
        const feed = await parseFeed(await response.text());
        const recentEntries = feed.entries.filter((entry)=>{
          if (!entry.published) return false;
          return new Date(entry.published) >= threeDaysAgo;
        });
        console.log(`[${source.name}] Parsed ${feed.entries.length} entries, processing ${recentEntries.length} from the last 3 days.`);
        for (const entry of recentEntries){
          const title = cleanContent(entry.title?.value);
          if (!title) continue;
          let description = cleanContent(entry.description?.value);
          const url = entry.links[0]?.href ?? null;
          if (url && (!description || description.length < 50)) {
            try {
              const { data, error } = await supabaseAdmin.functions.invoke('generate-description', {
                body: {
                  url
                }
              });
              if (error) throw error;
              if (data?.description) description = data.description;
            } catch (invokeError) {
              console.error(`[${source.name}] Failed to generate description for ${url}: ${invokeError.message}`);
            }
          }
          const category = detectCategory(title, description, source.category);
          const published_at = entry.published ? entry.published.toISOString() : new Date().toISOString();
          allProcessedArticles.push({
            title,
            description,
            source: source.name,
            url,
            category,
            published_at,
            has_valid_description: !!description && description.length >= 50
          });
        }
      } catch (error) {
        console.error(`[${source.name}] CRITICAL ERROR in processing source: ${error.message}`);
        continue;
      }
    }
    if (allProcessedArticles.length > 0) {
      const { error: insertError } = await supabaseAdmin.from('news_articles_staging').insert(allProcessedArticles);
      if (insertError) {
        throw new Error(`Failed to insert articles for batch: ${insertError.message}`);
      }
    }
    console.log(`Worker finished: Inserted ${allProcessedArticles.length} articles.`);
    return new Response(JSON.stringify({
      message: "Batch processed successfully."
    }), {
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
}); 