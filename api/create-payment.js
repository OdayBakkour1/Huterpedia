// Force redeploy: trivial comment
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
const KAZAWALLET_API_SECRET = process.env.KAZAWALLET_API_SECRET;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { amount, currency = 'USD', email, userId, productInfo } = req.body;
  if (!amount || !email || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const ref = uuidv4();
  const redirectUrl = `${SITE_URL}/payment-success?ref=${ref}`;
  try {
    // Store payment intent in Supabase
    const { error: dbError } = await supabase.from('payments').insert([
      {
        ref,
        amount,
        currency,
        user_email: email,
        user_id: userId,
        status: 'pending',
        payment_url: null,
      },
    ]);
    if (dbError) {
      return res.status(500).json({ error: 'Database error', details: dbError.message });
    }
    // Call KazaWallet API
    const response = await fetch('https://outdoor.kasroad.com/wallet/createPaymentLink', {
      method: 'POST',
      headers: {
        'x-api-key': KAZAWALLET_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amount),
        currency,
        email,
        ref,
        redirectUrl,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data?.paymentLink) {
      return res.status(500).json({ error: 'Failed to create payment link', details: data });
    }
    // Update payment_url in Supabase
    await supabase.from('payments').update({ payment_url: data.paymentLink }).eq('ref', ref);
    return res.status(200).json({ paymentUrl: data.paymentLink, ref });
  } catch (error) {
    return res.status(500).json({ error: 'Payment integration error', details: error.message });
  }
} 