import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        setError('Could not fetch payment history.');
        setLoading(false);
        return;
      }
      setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, [user]);

  const filtered = filter === 'all' ? payments : payments.filter(p => p.status === filter);

  if (!user) return <div className="text-red-500">You must be logged in to view payment history.</div>;
  if (loading) return <div className="text-cyan-400">Loading payment history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (filtered.length === 0) return <div className="text-slate-400">No payments found.</div>;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('all')} className={filter==='all'?"font-bold underline":""}>All</button>
        <button onClick={() => setFilter('pending')} className={filter==='pending'?"font-bold underline":""}>Pending</button>
        <button onClick={() => setFilter('fulfilled')} className={filter==='fulfilled'?"font-bold underline":""}>Fulfilled</button>
        <button onClick={() => setFilter('timed_out')} className={filter==='timed_out'?"font-bold underline":""}>Timed Out</button>
      </div>
      <table className="min-w-full bg-white/5 text-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2">Date</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Status</th>
            <th className="p-2">Reference</th>
            <th className="p-2">Order ID</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(payment => (
            <tr key={payment.id} className="border-b border-slate-700">
              <td className="p-2">{new Date(payment.created_at).toLocaleString()}</td>
              <td className="p-2">{payment.amount} {payment.currency}</td>
              <td className="p-2">{payment.status}</td>
              <td className="p-2">{payment.ref}</td>
              <td className="p-2">{payment.order_id || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 