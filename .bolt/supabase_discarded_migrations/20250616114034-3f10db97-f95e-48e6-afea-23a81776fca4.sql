-- Create a table to store newsletter signups
CREATE TABLE public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add an index on email for faster lookups
CREATE INDEX idx_newsletter_signups_email ON public.newsletter_signups(email);

-- Add an index on subscribed_at for analytics queries
CREATE INDEX idx_newsletter_signups_subscribed_at ON public.newsletter_signups(subscribed_at);

-- Enable Row Level Security (optional - making it public for now since it's a public signup)
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe to the newsletter
CREATE POLICY "Anyone can signup for newsletter"
ON public.newsletter_signups
FOR INSERT
WITH CHECK (true);

-- Allow only admins to view newsletter signups
CREATE POLICY "Admins can view newsletter signups"
ON public.newsletter_signups
FOR SELECT
USING (auth.uid() IN (
  SELECT user_id
  FROM public.user_roles
  WHERE role = 'admin'
));
