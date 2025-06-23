-- Create article-cache bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-cache', 'article-cache', true)
ON CONFLICT (id) DO NOTHING;

-- Storage rules for article-cache bucket
CREATE POLICY "Article cache is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-cache')
ON CONFLICT DO NOTHING;

-- Only service role can upload to article-cache
CREATE POLICY "Only service role can upload article cache"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;

-- Only service role can update article cache
CREATE POLICY "Only service role can update article cache"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;

-- Only service role can delete article cache
CREATE POLICY "Only service role can delete article cache"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-cache' AND
  auth.role() = 'service_role'
)
ON CONFLICT DO NOTHING;

-- Fix: Set search_path for check_subscription_status
DROP FUNCTION IF EXISTS check_subscription_status();
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check if trial has expired
  IF NEW.status = 'trial' AND NEW.trial_end_date < NOW() THEN
    NEW.status := 'expired';
  END IF;
  -- Check if subscription has expired
  IF NEW.status = 'active' AND NEW.subscription_end_date < NOW() THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$;

-- Fix: Set search_path for get_user_subscription
DROP FUNCTION IF EXISTS get_user_subscription(uuid);
CREATE OR REPLACE FUNCTION get_user_subscription(user_id uuid)
RETURNS TABLE (
  subscription_status text,
  plan_name text,
  trial_end timestamptz,
  subscription_end timestamptz,
  is_active boolean
)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.status as subscription_status,
    p.name as plan_name,
    s.trial_end_date as trial_end,
    s.subscription_end_date as subscription_end,
    (s.status = 'active' OR (s.status = 'trial' AND s.trial_end_date > NOW())) as is_active
  FROM subscriptions s
  JOIN subscription_plans p ON s.plan_id = p.id
  WHERE s.user_id = get_user_subscription.user_id;
END;
$$;