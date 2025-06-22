-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_monthly numeric(10,2) NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'trial' CHECK (status = ANY (ARRAY['trial', 'active', 'cancelled', 'expired'])),
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_date ON subscriptions(trial_end_date);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;

-- Create RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" 
  ON subscription_plans 
  FOR SELECT 
  TO public 
  USING (is_active = true);

-- Create RLS policies for subscriptions
CREATE POLICY "Admins can manage all subscriptions" 
  ON subscriptions 
  FOR ALL 
  TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own subscription" 
  ON subscriptions 
  FOR SELECT 
  TO public 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" 
  ON subscriptions 
  FOR UPDATE 
  TO public 
  USING (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, features)
VALUES 
  ('free', 0.00, '["7-day trial", "Basic access", "15 AI summaries per month"]'::jsonb),
  ('premium', 5.00, '["Full access", "Unlimited articles", "30 AI summaries per month", "Priority support"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Drop existing trigger and function if they exist (in correct order)
DROP TRIGGER IF EXISTS check_subscription_status_trigger ON subscriptions;
DROP FUNCTION IF EXISTS check_subscription_status();

-- Drop other existing functions if they exist
DROP FUNCTION IF EXISTS get_user_subscription(uuid);
DROP TRIGGER IF EXISTS create_trial_on_signup ON auth.users;
DROP FUNCTION IF EXISTS create_trial_subscription();
DROP FUNCTION IF EXISTS is_subscription_expired(uuid);
DROP FUNCTION IF EXISTS update_subscription_status();

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update subscription status
CREATE TRIGGER check_subscription_status_trigger
BEFORE INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION check_subscription_status();

-- Create function to get user subscription details
CREATE OR REPLACE FUNCTION get_user_subscription(user_id uuid)
RETURNS TABLE (
  subscription_status text,
  plan_name text,
  trial_end timestamptz,
  subscription_end timestamptz,
  is_active boolean
) AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to create trial subscription for new users
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'free' LIMIT 1;
  
  -- If no free plan exists, exit
  IF free_plan_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Create a 7-day trial subscription
  INSERT INTO subscriptions (
    user_id,
    plan_id,
    status,
    trial_start_date,
    trial_end_date
  ) VALUES (
    NEW.id,
    free_plan_id,
    'trial',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  
  -- Update profile with subscription status
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{subscription}',
    '"free"'
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create trial subscription for new users
CREATE TRIGGER create_trial_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_trial_subscription();

-- Create function to check if subscription is expired
CREATE OR REPLACE FUNCTION is_subscription_expired(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_expired boolean;
BEGIN
  SELECT 
    CASE
      WHEN s.status = 'expired' THEN true
      WHEN s.status = 'trial' AND s.trial_end_date < NOW() THEN true
      WHEN s.status = 'active' AND s.subscription_end_date < NOW() THEN true
      ELSE false
    END INTO is_expired
  FROM subscriptions s
  WHERE s.user_id = is_subscription_expired.user_id;
  
  -- If no subscription found, consider it expired
  RETURN COALESCE(is_expired, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS void AS $$
BEGIN
  -- Update trial subscriptions that have expired
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'trial' AND trial_end_date < NOW();
  
  -- Update active subscriptions that have expired
  UPDATE subscriptions
  SET status = 'expired'
  WHERE status = 'active' AND subscription_end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Try to create cron job (will fail gracefully if pg_cron extension is not available)
DO $$
BEGIN
  -- Create a cron job to run update_subscription_status every hour
  PERFORM cron.schedule(
    'update-subscription-status',
    '0 * * * *', -- Run every hour
    $$SELECT update_subscription_status()$$
  );
EXCEPTION
  WHEN undefined_table THEN
    -- pg_cron extension is not available, skip this step
    RAISE NOTICE 'pg_cron extension not available, skipping cron job creation';
  WHEN others THEN
    -- Other error, log it but don't fail the migration
    RAISE NOTICE 'Could not create cron job: %', SQLERRM;
END;
$$;