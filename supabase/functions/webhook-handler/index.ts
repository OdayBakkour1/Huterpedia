import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { addMonths } from "https://esm.sh/date-fns@2.30.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get webhook payload
    const payload = await req.json();
    
    // Verify webhook signature
    const signature = req.headers.get("X-Kazawallet-Signature");
    const webhookSecret = Deno.env.get("KAZAWALLET_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // In a real implementation, verify the signature here
    // For this example, we'll skip the verification
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Process the webhook event
    const { type, data } = payload;
    
    if (type === "payment.succeeded") {
      const { reference, amount, customer } = data;
      
      // Update payment status in database
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("reference", reference)
        .select("user_id, product_info")
        .single();
      
      if (paymentError) {
        console.error("Error updating payment:", paymentError);
        return new Response(
          JSON.stringify({ error: "Failed to update payment" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // If this is a subscription payment, update the user's subscription
      if (payment && payment.product_info.includes("Subscription")) {
        try {
          // Get the premium plan ID
          const { data: premiumPlan, error: planError } = await supabase
            .from("subscription_plans")
            .select("id")
            .eq("name", "premium")
            .single();
          
          if (planError) throw planError;
          
          // Calculate subscription dates
          const now = new Date();
          const subscriptionEnd = addMonths(now, 1); // 1 month subscription
          
          // Update or create subscription record
          const { error: subscriptionError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: payment.user_id,
              plan_id: premiumPlan.id,
              status: "active",
              subscription_start_date: now.toISOString(),
              subscription_end_date: subscriptionEnd.toISOString(),
            }, {
              onConflict: "user_id"
            });
          
          if (subscriptionError) throw subscriptionError;
          
          // Update user profile
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ subscription: "premium" })
            .eq("id", payment.user_id);
          
          if (profileError) throw profileError;
          
          console.log(`Subscription activated for user ${payment.user_id}`);
        } catch (error) {
          console.error("Error updating subscription:", error);
        }
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (type === "payment.failed") {
      const { reference } = data;
      
      // Update payment status in database
      const { error: paymentError } = await supabase
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("reference", reference);
      
      if (paymentError) {
        console.error("Error updating payment:", paymentError);
        return new Response(
          JSON.stringify({ error: "Failed to update payment" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Unhandled event type
    return new Response(
      JSON.stringify({ success: true, message: "Unhandled event type" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});