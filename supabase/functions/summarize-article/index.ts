import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
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
  try {
    const { title, description, url } = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Check access
    const access = await checkAccess(supabase, user);
    if (!access.allowed) {
      return new Response(JSON.stringify({ error: 'Subscription or trial expired' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user's AI credits limit from profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_credits')
      .eq('id', user.id)
      .single();
    const userLimit = profile?.ai_credits ?? 15;

    // Get current month's usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('feature_type', 'ai_summarize')
      .eq('month_year', currentMonth)
      .maybeSingle();
    if (usageError) {
      throw new Error('Failed to check usage limits');
    }
    const currentUsage = usageData?.usage_count || 0;
    if (currentUsage >= userLimit) {
      return new Response(JSON.stringify({
        error: 'Monthly limit reached',
        message: `You have reached your monthly limit of ${userLimit} AI summaries. Limit resets next month.`,
        debug: { currentUsage, userLimit, profileAiCredits: profile?.ai_credits, monthChecked: currentMonth }
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the DeepSeek API key from environment
    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    // Prepare prompt and call DeepSeek API
    const prompt = `Please provide a concise summary of this cybersecurity article in 2-3 sentences:\n\nTitle: ${title}\nDescription: ${description}\n${url ? `URL: ${url}` : ''}\n\nFocus on the key security implications and main points.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes cybersecurity articles in 2-3 sentences.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
        top_p: 0.95,
        top_k: 40,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'Unable to generate summary';

    // Increment usage count after successful API call
    if (usageData) {
      // Update existing record
      const { error: updateError } = await supabase.from('ai_usage_tracking').update({
        usage_count: currentUsage + 1,
        updated_at: new Date().toISOString()
      }).eq('user_id', user.id).eq('feature_type', 'ai_summarize').eq('month_year', currentMonth);
      if (updateError) {
        throw new Error('Failed to update usage');
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase.from('ai_usage_tracking').insert({
        user_id: user.id,
        feature_type: 'ai_summarize',
        usage_count: 1,
        month_year: currentMonth
      });
      if (insertError) {
        throw new Error('Failed to create usage record');
      }
    }

    // Return updated usage info
    const newCurrentUsage = currentUsage + 1;
    const remainingCredits = Math.max(0, userLimit - newCurrentUsage);
    return new Response(JSON.stringify({
      summary,
      usage: {
        current: newCurrentUsage,
        limit: userLimit,
        remaining: remainingCredits
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate summary',
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
