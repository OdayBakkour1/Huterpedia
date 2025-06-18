
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    console.log('Checking usage limits for user:', user.id);

    // Get user's AI credits limit from profile - use the service role key to bypass RLS
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_credits')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // If profile doesn't exist or error, default to 15
      console.log('Using default limit of 15 due to profile error');
    }

    console.log('Raw profile data from database:', profile);
    
    // Get the user's credit limit - default to 15 if profile is null or ai_credits is null
    const userLimit = profile?.ai_credits ?? 15;
    console.log('Final calculated user AI credits limit:', userLimit);

    // Get current month's usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    console.log('Checking usage for month:', currentMonth);
    
    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('usage_count')
      .eq('user_id', user.id)
      .eq('feature_type', 'ai_summarize')
      .eq('month_year', currentMonth)
      .maybeSingle();
    
    if (usageError) {
      console.error('Error checking current usage:', usageError);
      throw new Error('Failed to check usage limits');
    }

    const currentUsage = usageData?.usage_count || 0;
    console.log('Current usage this month:', currentUsage);
    console.log('User limit:', userLimit);
    console.log('Can use AI?', currentUsage < userLimit);

    // Check if user has reached their personal limit
    if (currentUsage >= userLimit) {
      console.log('User has reached limit. Returning 429 error.');
      return new Response(JSON.stringify({ 
        error: 'Monthly limit reached',
        message: `You have reached your monthly limit of ${userLimit} AI summaries. Limit resets next month.`,
        debug: {
          currentUsage,
          userLimit,
          profileAiCredits: profile?.ai_credits,
          monthChecked: currentMonth
        }
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('API key not configured');
    }

    const prompt = `Please provide a concise summary of this cybersecurity article in 2-3 sentences:

Title: ${title}
Description: ${description}
${url ? `URL: ${url}` : ''}

Focus on the key security implications and main points.`;

    console.log('Making request to Gemini API...');
    
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
          maxOutputTokens: 200,
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

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data, null, 2));
    
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';

    // Increment usage count after successful API call
    if (usageData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('ai_usage_tracking')
        .update({ 
          usage_count: currentUsage + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('feature_type', 'ai_summarize')
        .eq('month_year', currentMonth);
      
      if (updateError) {
        console.error('Error updating usage:', updateError);
        throw new Error('Failed to update usage');
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('ai_usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: 'ai_summarize',
          usage_count: 1,
          month_year: currentMonth
        });
      
      if (insertError) {
        console.error('Error creating usage record:', insertError);
        throw new Error('Failed to create usage record');
      }
    }

    // Return updated usage info
    const newCurrentUsage = currentUsage + 1;
    const remainingCredits = Math.max(0, userLimit - newCurrentUsage);

    console.log('Successfully processed AI summary. New usage:', newCurrentUsage, 'Remaining:', remainingCredits);

    return new Response(JSON.stringify({ 
      summary,
      usage: {
        current: newCurrentUsage,
        limit: userLimit,
        remaining: remainingCredits
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in summarize-article function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate summary',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
