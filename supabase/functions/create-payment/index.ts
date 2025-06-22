const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
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

    // Check if KazaWallet API key is configured
    if (!KAZAWALLET_API_KEY) {
      console.error('KAZAWALLET_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ 
        error: "Payment service not configured. Please contact support.",
        details: "Missing payment service configuration"
      }), { status: 500, headers: corsHeaders });
    }

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

    // Call KazaWallet API with user's actual email
    console.log("Calling KazaWallet API with:", { amount: String(finalAmount), currency, email, ref, redirectUrl });
    
    const response = await fetch("https://outdoor.kasroad.com/wallet/createPaymentLink", {
      method: "POST",
      headers: { 
        "x-api-key": KAZAWALLET_API_KEY, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        amount: String(finalAmount), 
        currency, 
        email, 
        ref, 
        redirectUrl 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`KazaWallet API error (${response.status}):`, errorText);
      
      // Parse the error response to provide more helpful error messages
      let errorMessage = "Failed to create payment link";
      let errorDetails = `Payment service error (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
        if (errorData.error?.details) {
          errorDetails = errorData.error.details;
        }
      } catch (parseError) {
        // If we can't parse the error, use the original text
        errorDetails = errorText;
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
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
      details: error.message
    }), { status: 500, headers: corsHeaders });
  }
});

// Import createClient at the top
import { createClient } from "npm:@supabase/supabase-js@2";