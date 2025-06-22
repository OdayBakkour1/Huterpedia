import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PaymentStatus() {
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = new URLSearchParams(window.location.search).get('ref');

  useEffect(() => {
    if (!ref) {
      setError('Missing payment reference.');
      setLoading(false);
      return;
    }
    let interval;
    const fetchStatus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('status')
        .eq('ref', ref)
        .single();
      if (error) {
        setError('Could not fetch payment status.');
        setLoading(false);
        return;
      }
      setStatus(data.status);
      setLoading(false);
      if (data.status === 'fulfilled') {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [ref]);

  if (loading) return <div className="text-cyan-400">Checking payment status...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (status === 'fulfilled') return <div className="text-green-500 font-bold">Payment successful! Redirecting...</div>;
  if (status === 'timed_out') return <div className="text-yellow-500 font-bold">Payment timed out or expired.</div>;
  return <div className="text-cyan-400">Payment is pending...</div>;
} 