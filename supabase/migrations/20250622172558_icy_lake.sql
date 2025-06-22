/*
  # Add subscription and trial system

  1. New Tables
    - `subscriptions` - Track user subscription status and trial periods
    - `subscription_plans` - Define available plans (Premium $5/month)
  
  2. Security
    - Enable RLS on new tables
    - Add policies for user access control
  
  3. Functions
    - Function to check if user has active subscription or trial
    - Function to create trial subscription on signup
    - Trigger to automatically create trial on user registration
*/

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the Premium plan
INSERT INTO public.subscription_plans (name, price_monthly, features) VALUES
('Premium', 5.00, '["Full real-time threat feed", "Advanced filtering & search", "Email & chat support", "Personalized feed preferences", "Bookmarks & saved articles", "Multi-source intelligence feeds", "15 AI summaries per month"]')
ON CONFLICT (name) DO NOTHING;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'cancelled', 'expired')),
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id) -- One subscription per user
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON public.subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'))
  WITH CHECK (public.has_role((SELECT auth.uid()), 'admin'));

-- Function to check if user has active access (trial or paid)
CREATE OR REPLACE FUNCTION public.user_has_active_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Get user's subscription
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE user_id = _user_id;
  
  -- If no subscription found, no access
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check trial period
  IF subscription_record.status = 'trial' THEN
    RETURN subscription_record.trial_end_date > now();
  END IF;
  
  -- Check active subscription
  IF subscription_record.status = 'active' THEN
    RETURN subscription_record.subscription_end_date > now();
  END IF;
  
  -- All other statuses (cancelled, expired) = no access
  RETURN false;
END;
$$;

-- Function to create trial subscription for new users
CREATE OR REPLACE FUNCTION public.create_trial_subscription(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  premium_plan_id UUID;
BEGIN
  -- Get Premium plan ID
  SELECT id INTO premium_plan_id
  FROM public.subscription_plans
  WHERE name = 'Premium' AND is_active = true;
  
  -- Create trial subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    trial_start_date,
    trial_end_date
  ) VALUES (
    _user_id,
    premium_plan_id,
    'trial',
    now(),
    now() + interval '7 days'
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate subscriptions
END;
$$;

-- Update the handle_new_user function to create trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Create trial subscription
  PERFORM public.create_trial_subscription(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Function to get user subscription status
CREATE OR REPLACE FUNCTION public.get_user_subscription_status(_user_id UUID)
RETURNS TABLE(
  has_access BOOLEAN,
  status TEXT,
  trial_days_remaining INTEGER,
  subscription_end_date TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
  days_remaining INTEGER;
BEGIN
  -- Get user's subscription
  SELECT * INTO subscription_record
  FROM public.subscriptions
  WHERE user_id = _user_id;
  
  -- If no subscription found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'none'::TEXT, 0, NULL::TIMESTAMP WITH TIME ZONE;
    RETURN;
  END IF;
  
  -- Calculate trial days remaining
  IF subscription_record.status = 'trial' THEN
    days_remaining := GREATEST(0, EXTRACT(days FROM (subscription_record.trial_end_date - now()))::INTEGER);
  ELSE
    days_remaining := 0;
  END IF;
  
  -- Return subscription status
  RETURN QUERY SELECT 
    public.user_has_active_access(_user_id),
    subscription_record.status,
    days_remaining,
    COALESCE(subscription_record.subscription_end_date, subscription_record.trial_end_date);
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_date ON public.subscriptions(trial_end_date);