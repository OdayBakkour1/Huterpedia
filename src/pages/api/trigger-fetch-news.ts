export default async function handler(req, res) {
  const response = await fetch('https://gzpayeckolpfflgvkqvh.functions.supabase.co/fetch-news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    },
    body: JSON.stringify({ staging: true })
  });

  const data = await response.text();
  res.status(response.status).json({ result: data });
} 