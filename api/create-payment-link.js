import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = "USD", email, ref, couponCode } = req.body;
    
    // Validate required fields
    if (!amount || !email || !ref) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Generate a unique reference ID for this payment
    const paymentRef = crypto.randomUUID();
    
    // Get KazaWallet API key
    const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
    
    if (!KAZAWALLET_API_KEY) {
      console.error('KAZAWALLET_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: "Payment service not configured",
        details: "Missing payment service configuration"
      });
    }
    
    // Set the redirect URL
    const redirectUrl = `${process.env.SITE_URL || req.headers.origin}/payment-success?ref=${paymentRef}`;
    
    // Apply coupon if provided
    let finalAmount = parseFloat(amount);
    let discountAmount = 0;
    
    if (couponCode) {
      const { data: couponValidation, error: couponError } = await supabase.rpc('validate_and_apply_coupon', {
        _coupon_code: couponCode,
        _user_id: ref,
        _original_amount: finalAmount
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
      ref: paymentRef, 
      amount: finalAmount, 
      currency, 
      user_email: email,
      user_id: ref, 
      status: "pending", 
      payment_url: null,
    }]);
    
    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: "Database error", details: dbError.message });
    }

    // Call KazaWallet API
    console.log("Calling KazaWallet API with:", { amount: String(finalAmount), currency, email, ref: paymentRef, redirectUrl });
    
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
        ref: paymentRef, 
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
      
      return res.status(500).json({ 
        error: errorMessage,
        details: errorDetails
      });
    }
    
    const data = await response.json();
    console.log("KazaWallet API response:", data);
    
    if (!data?.paymentLink) {
      return res.status(500).json({ 
        error: "Invalid response from payment provider", 
        details: "No payment link returned" 
      });
    }

    // Update payment_url in Supabase
    await supabase.from("payments").update({ payment_url: data.paymentLink }).eq("ref", paymentRef);
    
    // If coupon was applied and valid, record the redemption
    if (couponCode && discountAmount > 0) {
      await supabase.rpc('redeem_coupon', {
        _coupon_code: couponCode,
        _user_id: ref,
        _original_amount: parseFloat(amount),
        _discount_amount: discountAmount,
        _final_amount: finalAmount
      });
    }

    return res.status(200).json({ paymentLink: data.paymentLink, ref: paymentRef });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: "Unexpected error", 
      details: error.message
    });
  }
}