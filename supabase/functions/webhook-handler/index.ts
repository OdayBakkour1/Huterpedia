import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.hunterpedia.site",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const { amount, order_id, ref, status, signature } = await req.json();
  if (!amount || !order_id || !ref || !status || !signature) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
  }

  const KAZAWALLET_API_KEY = Deno.env.get("KAZAWALLET_API_KEY")!;
  const KAZAWALLET_API_SECRET = Deno.env.get("KAZAWALLET_API_SECRET")!;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Verify signature
  const secretString = `${amount}:::${order_id}:::${KAZAWALLET_API_KEY}`;
  const hashDigest = crypto.createHash("sha256").update(secretString).digest();
  const hmacDigest = crypto.createHmac("sha512", KAZAWALLET_API_SECRET).update(hashDigest).digest("base64");
  if (signature !== hmacDigest) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401, headers: corsHeaders });
  }

  try {
    // Update payment status in Supabase
    let newStatus = status === "fulfilled" ? "fulfilled" : (status === "timed_out" ? "timed_out" : "unknown");
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({ status: newStatus, order_id })
      .eq("ref", ref)
      .select("user_id")
      .single();

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
      return new Response(JSON.stringify({ error: "Database error", details: paymentError.message }), { status: 500, headers: corsHeaders });
    }

    // If payment was successful, update user's subscription
    if (newStatus === "fulfilled" && payment?.user_id) {
      // Get premium plan ID
      const { data: premiumPlan, error: planError } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", "Premium")
        .single();

      if (planError) {
        console.error("Error fetching premium plan:", planError);
        return new Response(JSON.stringify({ error: "Error fetching premium plan", details: planError.message }), { status: 500, headers: corsHeaders });
      }

      // Get user's current subscription
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", payment.user_id)
        .single();

      if (subError && subError.code !== "PGRST116") { // PGRST116 = not found
        console.error("Error fetching subscription:", subError);
        return new Response(JSON.stringify({ error: "Error fetching subscription", details: subError.message }), { status: 500, headers: corsHeaders });
      }

      // Calculate subscription dates
      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      if (subscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan_id: premiumPlan.id,
            subscription_start_date: now.toISOString(),
            subscription_end_date: oneMonthLater.toISOString(),
            updated_at: now.toISOString()
          })
          .eq("user_id", payment.user_id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          return new Response(JSON.stringify({ error: "Error updating subscription", details: updateError.message }), { status: 500, headers: corsHeaders });
        }
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            user_id: payment.user_id,
            plan_id: premiumPlan.id,
            status: "active",
            subscription_start_date: now.toISOString(),
            subscription_end_date: oneMonthLater.toISOString()
          });

        if (insertError) {
          console.error("Error creating subscription:", insertError);
          return new Response(JSON.stringify({ error: "Error creating subscription", details: insertError.message }), { status: 500, headers: corsHeaders });
        }
      }

      console.log(`Successfully updated subscription for user ${payment.user_id}`);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Unexpected error", details: error.message }), { status: 500, headers: corsHeaders });
  }
});