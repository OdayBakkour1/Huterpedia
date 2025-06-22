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

  // Update payment status in Supabase
  let newStatus = status === "fulfilled" ? "fulfilled" : (status === "timed_out" ? "timed_out" : "unknown");
  const { error: dbError } = await supabase.from("payments").update({ status: newStatus, order_id }).eq("ref", ref);
  if (dbError) {
    return new Response(JSON.stringify({ error: "Database error", details: dbError.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
});