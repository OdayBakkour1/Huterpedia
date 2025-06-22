import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get request body
    const { amount, currency = "USD", email, userId, productInfo } = await req.json();

    // Validate required fields
    if (!amount || !email || !userId || !productInfo) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: "amount, email, userId, and productInfo are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get KazaWallet API credentials
    const kazawalletApiKey = Deno.env.get("KAZAWALLET_API_KEY");
    const kazawalletApiSecret = Deno.env.get("KAZAWALLET_API_SECRET");
    const siteUrl = Deno.env.get("SITE_URL") || "https://hunterpedia.site";

    if (!kazawalletApiKey || !kazawalletApiSecret) {
      return new Response(
        JSON.stringify({
          error: "Payment provider configuration missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a unique reference ID
    const paymentRef = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // Create payment record in database
    const { error: dbError } = await supabase.from("payments").insert({
      user_id: userId,
      amount,
      currency,
      status: "pending",
      reference: paymentRef,
      product_info: productInfo,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Failed to create payment record",
          details: dbError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create payment with KazaWallet API
    const kazawalletResponse = await fetch("https://api.kazawallet.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": kazawalletApiKey,
        "X-API-Secret": kazawalletApiSecret,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency,
        reference: paymentRef,
        description: productInfo,
        customer: {
          email,
        },
        success_url: `${siteUrl}/payment-success?ref=${paymentRef}`,
        cancel_url: `${siteUrl}/payment-cancel?ref=${paymentRef}`,
        webhook_url: `${supabaseUrl}/functions/v1/webhook-handler`,
      }),
    });

    if (!kazawalletResponse.ok) {
      const errorText = await kazawalletResponse.text();
      console.error("KazaWallet API error:", errorText);
      
      return new Response(
        JSON.stringify({
          error: "Payment provider error",
          details: errorText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const kazawalletData = await kazawalletResponse.json();

    // Update payment record with payment provider ID
    await supabase
      .from("payments")
      .update({
        provider_payment_id: kazawalletData.id,
      })
      .eq("reference", paymentRef);

    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: kazawalletData.checkout_url,
        ref: paymentRef,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    
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