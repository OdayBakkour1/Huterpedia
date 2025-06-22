import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
const KAZAWALLET_API_SECRET = process.env.KAZAWALLET_API_SECRET;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { order_id, secret, amount, status } = req.body;
  if (!order_id || !secret || !amount || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Step 1: Create the secret string
  const secretString = `${amount}:::${order_id}:::${KAZAWALLET_API_KEY}`;

  // Step 2: Generate SHA-256 hash of the secret string
  const hashDigest = crypto.createHash('sha256').update(secretString).digest();

  // Step 3: Generate HMAC-SHA512 hash of the SHA-256 hash using the API secret
  const hmacDigest = crypto.createHmac('sha512', KAZAWALLET_API_SECRET!).update(hashDigest).digest();

  // Step 4: Encode the HMAC-SHA512 hash in Base64
  const hmacDigestBase64 = hmacDigest.toString('base64');

  // Step 5: Compare with the received secret
  if (hmacDigestBase64 === secret) {
    // Update payment status in Supabase
    const { error } = await supabase
      .from('kazawallet_payments')
      .update({ status, webhook_payload: req.body })
      .eq('order_id', order_id);
    if (error) {
      return res.status(500).json({ success: false, error: 'Failed to update payment status', details: error });
    }
    return res.status(200).json({ success: true, message: 'Webhook verified and payment status updated' });
  } else {
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
  }
} 