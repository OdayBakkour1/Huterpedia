/*
  # Add subscription tables and functions

  1. New Tables
    - `subscription_plans` - Stores available subscription plans
    - `subscriptions` - Stores user subscription details

  2. Changes
    - Added foreign key relationships to profiles and users tables
    - Added functions for subscription management

  3. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

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
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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

-- Create RLS policies
CREATE POLICY "Anyone can view active subscription plans" 
  ON subscription_plans 
  FOR SELECT 
  TO public 
  USING (is_active = true);

CREATE POLICY "Admins can manage all subscriptions" 
  ON subscriptions 
  FOR ALL 
  TO authenticated 
  USING (has_role(uid(), 'admin'::app_role)) 
  WITH CHECK (has_role(uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own subscription" 
  ON subscriptions 
  FOR SELECT 
  TO public 
  USING ((user_id = uid()));

CREATE POLICY "Users can update their own subscription" 
  ON subscriptions 
  FOR UPDATE 
  TO public 
  USING ((user_id = uid()));

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, features)
VALUES 
  ('free', 0.00, '["7-day trial", "Basic access", "15 AI summaries per month"]'::jsonb),
  ('premium', 5.00, '["Full access", "Unlimited articles", "30 AI summaries per month", "Priority support"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

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
  WHERE s.user_id = user_id;
END;
$$ LANGUAGE plpgsql;