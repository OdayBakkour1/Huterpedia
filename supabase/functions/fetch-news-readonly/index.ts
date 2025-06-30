import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid authentication token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const access = await checkAccess(supabase, user);
  if (!access.allowed) {
    return new Response(JSON.stringify({ error: 'Subscription or trial expired' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  // --- Only fetch articles from today ---
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const startOfDay = new Date(today);
  const endOfDay = new Date(today);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // Query for all articles from today (no pagination)
  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, description, source, author, published_at, category, url, image_url, cached_content_url, cached_image_url, cache_updated_at, created_at, updated_at')
    .gte('published_at', startOfDay.toISOString())
    .lte('published_at', endOfDay.toISOString())
    .order('published_at', { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  // Master category list
  const MASTER_CATEGORIES = [
    "Analysis",
    "APT",
    "Updates",
    "Threats",
    "Ransomware",
    "Vulnerabilities",
    "Phishing",
    "Malware",
    "Zero Day",
    "Social Engineering",
    "Breaches",
    "Tools",
    "CVE"
  ];
  // Count articles per category
  const categoryCounts = {};
  for (const cat of MASTER_CATEGORIES) {
    categoryCounts[cat] = (data || []).filter(a => a.category === cat).length;
  }
  // Add 'All' as the total count
  const totalCount = data ? data.length : 0;
  categoryCounts["All"] = totalCount;
  return new Response(JSON.stringify({ articles: data, totalCount, categories: MASTER_CATEGORIES, categoryCounts, showMeta: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}); 