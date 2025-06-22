import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

  try {
    const { amount, currency = "USD", email, userId, couponCode } = await req.json();
    if (!amount || !email || !userId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    const ref = crypto.randomUUID();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const KAZAWALLET_API_KEY = Deno.env.get("KAZAWALLET_API_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:8080";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const redirectUrl = `${SITE_URL}/payment-success?ref=${ref}`;

    console.log("Creating payment with:", { amount, currency, email, userId, redirectUrl });

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

    // Use test email for KazaWallet in development/testing
    // KazaWallet requires users to be pre-registered in their system
    const kazawalletEmail = Deno.env.get("KAZAWALLET_TEST_EMAIL") || "test@example.com";
    
    console.log(`Using KazaWallet email: ${kazawalletEmail} (original: ${email})`);

    // Store payment intent in Supabase with original user email
    const { error: dbError } = await supabase.from("payments").insert([{
      ref, 
      amount: finalAmount, 
      currency, 
      user_email: email, // Store original user email
      user_id: userId, 
      status: "pending", 
      payment_url: null,
    }]);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: "Database error", details: dbError.message }), { status: 500, headers: corsHeaders });
    }

    // Call KazaWallet API with test email
    console.log("Calling KazaWallet API with:", { amount: String(finalAmount), currency, email: kazawalletEmail, ref, redirectUrl });
    
    const response = await fetch("https://outdoor.kasroad.com/wallet/createPaymentLink", {
      method: "POST",
      headers: { 
        "x-api-key": KAZAWALLET_API_KEY, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        amount: String(finalAmount), 
        currency, 
        email: kazawalletEmail, // Use test email for KazaWallet
        ref, 
        redirectUrl 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`KazaWallet API error (${response.status}):`, errorText);
      
      // Parse the error response to provide more helpful error messages
      let errorMessage = "Failed to create payment link";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message === "User not found") {
          errorMessage = "Payment service configuration error. Please contact support.";
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (parseError) {
        // If we can't parse the error, use the original text
        errorMessage = errorText;
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: `Payment service error (${response.status})`
      }), { status: 500, headers: corsHeaders });
    }
    
    const data = await response.json();
    console.log("KazaWallet API response:", data);
    
    if (!data?.paymentLink) {
      return new Response(JSON.stringify({ 
        error: "Invalid response from payment provider", 
        details: "No payment link returned" 
      }), { status: 500, headers: corsHeaders });
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
    return new Response(JSON.stringify({ 
      error: "Unexpected error", 
      details: error.message,
      stack: error.stack
    }), { status: 500, headers: corsHeaders });
  }
});