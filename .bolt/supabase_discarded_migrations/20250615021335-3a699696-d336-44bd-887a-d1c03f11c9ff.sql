
-- Drop the weekly email subscriptions table
DROP TABLE IF EXISTS public.weekly_email_subscriptions CASCADE;

-- Drop the email send history table  
DROP TABLE IF EXISTS public.email_send_history CASCADE;

-- Remove any weekly_email_enabled column from profiles table if it exists
ALTER TABLE public.profiles DROP COLUMN IF EXISTS weekly_email_enabled;

