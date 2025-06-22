import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const KAZAWALLET_API_KEY = process.env.KAZAWALLET_API_KEY;
const KAZAWALLET_API_SECRET = process.env.KAZAWALLET_API_SECRET;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { amount, order_id, ref, status, signature } = req.body;
    if (!amount || !order_id || !ref || !status || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Verify signature
    const secretString = `${amount}:::${order_id}:::${KAZAWALLET_API_KEY}`;
    const hashDigest = crypto.createHash('sha256').update(secretString).digest();
    const hmacDigest = crypto.createHmac('sha512', KAZAWALLET_API_SECRET).update(hashDigest).digest('base64');
    if (signature !== hmacDigest) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    // Update payment status in Supabase
    let newStatus = status === 'fulfilled' ? 'fulfilled' : (status === 'timed_out' ? 'timed_out' : 'unknown');
    const { error: dbError } = await supabase.from('payments').update({ status: newStatus, order_id }).eq('ref', ref);
    if (dbError) {
      return res.status(500).json({ error: 'Database error', details: dbError.message });
    }
    // Log webhook event (optional: you can add more logging here)
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Webhook handler error', details: error.message });
  }
} 