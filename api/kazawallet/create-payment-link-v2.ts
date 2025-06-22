import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
const KAZAWALLET_API_SECRET = process.env.KAZAWALLET_API_SECRET;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency = 'USD', email, user_id } = req.body;
  if (!amount || !email || !user_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ref = uuidv4();
  const redirectUrl = 'https://hunterpedia.site/dashboard';

  // Call Kazawallet API
  try {
    const response = await fetch('https://outdoor.kasroad.com/wallet/createPaymentLink', {
      method: 'POST',
      headers: {
        'x-api-key': KAZAWALLET_API_KEY!,
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

    // Store payment attempt in Supabase
    await supabase.from('kazawallet_payments').insert([
      {
        user_id,
        amount,
        currency,
        email,
        ref,
        status: 'pending',
        order_id: data.order_id || null,
      },
    ]);

    return res.status(200).json({ paymentLink: data.paymentLink });
  } catch (error) {
    return res.status(500).json({ error: 'Kazawallet integration error', details: error });
  }
} 