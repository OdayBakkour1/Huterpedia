
-- Add ai_credits column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN ai_credits INTEGER DEFAULT 15;

-- Add a comment to document the column
COMMENT ON COLUMN public.profiles.ai_credits IS 'Number of AI credits available to the user for AI features';
