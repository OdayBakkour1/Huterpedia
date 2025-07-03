-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);

-- Drop unused indexes (review before applying in production)
DROP INDEX IF EXISTS public.idx_coupon_codes_created_by;
DROP INDEX IF EXISTS public.idx_coupon_codes_active_valid;
DROP INDEX IF EXISTS public.idx_coupon_redemptions_redeemed_at;
DROP INDEX IF EXISTS public.idx_subscriptions_status;
DROP INDEX IF EXISTS public.idx_subscriptions_trial_end_date;
DROP INDEX IF EXISTS public.idx_payments_status; 