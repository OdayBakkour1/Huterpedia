
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension (for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the news fetch function to run every 10 minutes (staging mode)
SELECT cron.schedule(
  'fetch-news-to-staging-every-10-minutes',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://gzpayeckolpfflgvkqvh.supabase.co/functions/v1/fetch-news',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6cGF5ZWNrb2xwZmZsZ3ZrcXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTE2OTEsImV4cCI6MjA2NTI4NzY5MX0.56YUDNYwuTMYpc2wWdftlXr0nakH8Ru4JTUXj7HOv5M"}'::jsonb,
        body:='{"staging": true}'::jsonb
    ) as request_id;
  $$
);

-- Schedule the article processing function to run every 15 minutes
SELECT cron.schedule(
  'process-articles-every-15-minutes',
  '*/15 * * * *',
  $$
  SELECT public.process_staging_articles();
  $$
);
