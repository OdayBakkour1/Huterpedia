import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

  const { amount, currency = "USD", email, userId, productInfo } = await req.json();
  if (!amount || !email || !userId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
  }

  const ref = crypto.randomUUID();
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const KAZAWALLET_API_KEY = Deno.env.get("KAZAWALLET_API_KEY")!;
  const SITE_URL = Deno.env.get("SITE_URL")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const redirectUrl = `${SITE_URL}/payment-success?ref=${ref}`;

  // Store payment intent in Supabase
  const { error: dbError } = await supabase.from("payments").insert([{
    ref, amount, currency, user_email: email, user_id: userId, status: "pending", payment_url: null,
  }]);
  if (dbError) {
    return new Response(JSON.stringify({ error: "Database error", details: dbError.message }), { status: 500, headers: corsHeaders });
  }

  // Call KazaWallet API
  const response = await fetch("https://outdoor.kasroad.com/wallet/createPaymentLink", {
    method: "POST",
    headers: { "x-api-key": KAZAWALLET_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: String(amount), currency, email, ref, redirectUrl }),
  });
  const data = await response.json();
  if (!response.ok || !data?.paymentLink) {
    return new Response(JSON.stringify({ error: "Failed to create payment link", details: data }), { status: 500, headers: corsHeaders });
  }

  // Update payment_url in Supabase
  await supabase.from("payments").update({ payment_url: data.paymentLink }).eq("ref", ref);
  return new Response(JSON.stringify({ paymentUrl: data.paymentLink, ref }), { status: 200, headers: corsHeaders });
});