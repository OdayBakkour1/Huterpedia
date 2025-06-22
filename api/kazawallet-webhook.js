import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Received webhook request");
    const payload = req.body;
    console.log("Webhook payload:", payload);
    
    const { amount, order_id, ref, status, signature } = payload;
    
    if (!amount || !order_id || !ref || !status || !signature) {
      console.error("Missing required fields in webhook payload");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get environment variables
    const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
    const KAZAWALLET_API_SECRET = process.env.KAZAWALLET_API_SECRET;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!KAZAWALLET_API_KEY || !KAZAWALLET_API_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify signature
    console.log("Verifying signature");
    const secretString = `${amount}:::${order_id}:::${KAZAWALLET_API_KEY}`;
    console.log("Secret string:", secretString);
    
    const hashDigest = crypto.createHash("sha256").update(secretString).digest();
    const hmacDigest = crypto.createHmac("sha512", KAZAWALLET_API_SECRET).update(hashDigest).digest("base64");
    
    console.log("Calculated signature:", hmacDigest);
    console.log("Received signature:", signature);
    
    if (signature !== hmacDigest) {
      console.error("Invalid signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Update payment status in Supabase
    let newStatus = status === "fulfilled" ? "fulfilled" : (status === "timed_out" ? "timed_out" : "unknown");
    console.log(`Updating payment status to ${newStatus} for ref ${ref}`);
    
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({ status: newStatus, order_id })
      .eq("ref", ref)
      .select("user_id")
      .single();

    if (paymentError) {
      console.error("Error updating payment:", paymentError);
      return res.status(500).json({ error: "Database error", details: paymentError.message });
    }

    // If payment was successful, update user's subscription
    if (newStatus === "fulfilled" && payment?.user_id) {
      console.log(`Payment fulfilled for user ${payment.user_id}, updating subscription`);
      
      // Get premium plan ID
      const { data: premiumPlan, error: planError } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", "Premium")
        .single();

      if (planError) {
        console.error("Error fetching premium plan:", planError);
        return res.status(500).json({ error: "Error fetching premium plan", details: planError.message });
      }

      // Get user's current subscription
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", payment.user_id)
        .single();

      if (subError && subError.code !== "PGRST116") { // PGRST116 = not found
        console.error("Error fetching subscription:", subError);
        return res.status(500).json({ error: "Error fetching subscription", details: subError.message });
      }

      // Calculate subscription dates
      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      if (subscription) {
        console.log("Updating existing subscription");
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
          return res.status(500).json({ error: "Error updating subscription", details: updateError.message });
        }
      } else {
        console.log("Creating new subscription");
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
          return res.status(500).json({ error: "Error creating subscription", details: insertError.message });
        }
      }

      console.log(`Successfully updated subscription for user ${payment.user_id}`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Unexpected error", details: error.message, stack: error.stack });
  }
}