import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.hunterpedia.site",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  const { amount, currency = "USD", email, userId, couponCode } = await req.json();
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

  try {
    // Apply coupon if provided
    let finalAmount = amount;
    let discountAmount = 0;
    
    if (couponCode) {
      const { data: couponValidation, error: couponError } = await supabase.rpc('validate_and_apply_coupon', {
        _coupon_code: couponCode,
        _user_id: userId,
        _original_amount: amount
      });
      
      if (couponError) {
        console.error('Coupon validation error:', couponError);
      } else if (couponValidation && couponValidation[0]?.is_valid) {
        finalAmount = couponValidation[0].final_amount;
        discountAmount = couponValidation[0].discount_amount;
        console.log(`Coupon applied: ${couponCode}, discount: ${discountAmount}, final: ${finalAmount}`);
      }
    }

    // Store payment intent in Supabase
    const { error: dbError } = await supabase.from("payments").insert([{
      ref, 
      amount: finalAmount, 
      currency, 
      user_email: email, 
      user_id: userId, 
      status: "pending", 
      payment_url: null,
    }]);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: "Database error", details: dbError.message }), { status: 500, headers: corsHeaders });
    }

    // Call KazaWallet API
    const response = await fetch("https://outdoor.kasroad.com/wallet/createPaymentLink", {
      method: "POST",
      headers: { "x-api-key": KAZAWALLET_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ 
        amount: String(finalAmount), 
        currency, 
        email, 
        ref, 
        redirectUrl 
      }),
    });
    
    const data = await response.json();
    if (!response.ok || !data?.paymentLink) {
      console.error('KazaWallet API error:', data);
      return new Response(JSON.stringify({ error: "Failed to create payment link", details: data }), { status: 500, headers: corsHeaders });
    }

    // Update payment_url in Supabase
    await supabase.from("payments").update({ payment_url: data.paymentLink }).eq("ref", ref);
    
    // If coupon was applied and valid, record the redemption
    if (couponCode && discountAmount > 0) {
      await supabase.rpc('redeem_coupon', {
        _coupon_code: couponCode,
        _user_id: userId,
        _original_amount: amount,
        _discount_amount: discountAmount,
        _final_amount: finalAmount
      });
    }

    return new Response(JSON.stringify({ paymentUrl: data.paymentLink, ref }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: "Unexpected error", details: error.message }), { status: 500, headers: corsHeaders });
  }
});