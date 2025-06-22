import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function usePaymentStatus(ref) {
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('status')
      .eq('ref', ref)
      .single();
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setStatus(data.status);
    setLoading(false);
  }, [ref]);

  useEffect(() => {
    if (!ref) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [ref, fetchStatus]);

  return { status, loading, error };
}

export function usePaymentHistory(userId) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, [userId]);

  return { payments, loading, error };
} 