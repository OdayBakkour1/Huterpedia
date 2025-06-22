
-- Fix unindexed foreign keys and remove unused index for better performance

-- Add index for coupon_codes.created_by foreign key
CREATE INDEX IF NOT EXISTS idx_coupon_codes_created_by ON public.coupon_codes(created_by);

-- Add index for coupon_redemptions.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);

-- Remove unused indexes that are not providing value
DROP INDEX IF EXISTS idx_payment_methods_user_id;
DROP INDEX IF EXISTS idx_newsletter_signups_email;
DROP INDEX IF EXISTS idx_newsletter_signups_subscribed_at;

-- Add useful indexes for common query patterns that might actually be used
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active_valid ON public.coupon_codes(is_active, valid_until) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_redeemed_at ON public.coupon_redemptions(redeemed_at DESC);
