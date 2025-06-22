
-- Create coupon_codes table
CREATE TABLE public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited uses
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon_redemptions table to track usage
CREATE TABLE public.coupon_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code_id UUID REFERENCES public.coupon_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coupon_code_id, user_id) -- One use per user per coupon
);

-- Add RLS policies for coupon_codes
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage all coupons
CREATE POLICY "Admins can manage coupon codes" 
  ON public.coupon_codes 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can view active coupons
CREATE POLICY "Users can view active coupon codes" 
  ON public.coupon_codes 
  FOR SELECT 
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

-- Add RLS policies for coupon_redemptions
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions" 
  ON public.coupon_redemptions 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Users can create their own redemptions
CREATE POLICY "Users can create their own redemptions" 
  ON public.coupon_redemptions 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions" 
  ON public.coupon_redemptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION public.validate_and_apply_coupon(
  _coupon_code TEXT,
  _user_id UUID,
  _original_amount DECIMAL(10,2)
)
RETURNS TABLE(
  is_valid BOOLEAN,
  discount_percentage INTEGER,
  discount_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coupon_record RECORD;
  calculated_discount DECIMAL(10,2);
  calculated_final DECIMAL(10,2);
BEGIN
  -- Get coupon details
  SELECT * INTO coupon_record
  FROM public.coupon_codes
  WHERE code = _coupon_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > now())
    AND valid_from <= now();
  
  -- Check if coupon exists and is valid
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0.00::DECIMAL(10,2), _original_amount, 'Invalid or expired coupon code';
    RETURN;
  END IF;
  
  -- Check if user already used this coupon
  IF EXISTS (
    SELECT 1 FROM public.coupon_redemptions 
    WHERE coupon_code_id = coupon_record.id AND user_id = _user_id
  ) THEN
    RETURN QUERY SELECT false, 0, 0.00::DECIMAL(10,2), _original_amount, 'Coupon already used by this user';
    RETURN;
  END IF;
  
  -- Check usage limits
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    RETURN QUERY SELECT false, 0, 0.00::DECIMAL(10,2), _original_amount, 'Coupon usage limit reached';
    RETURN;
  END IF;
  
  -- Calculate discount
  calculated_discount := (_original_amount * coupon_record.discount_percentage / 100);
  calculated_final := _original_amount - calculated_discount;
  
  -- Ensure final amount is not negative
  IF calculated_final < 0 THEN
    calculated_final := 0;
    calculated_discount := _original_amount;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    coupon_record.discount_percentage, 
    calculated_discount, 
    calculated_final,
    ''::TEXT;
END;
$$;

-- Function to redeem coupon (call after successful payment)
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  _coupon_code TEXT,
  _user_id UUID,
  _original_amount DECIMAL(10,2),
  _discount_amount DECIMAL(10,2),
  _final_amount DECIMAL(10,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  coupon_id UUID;
BEGIN
  -- Get coupon ID
  SELECT id INTO coupon_id
  FROM public.coupon_codes
  WHERE code = _coupon_code
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Insert redemption record
  INSERT INTO public.coupon_redemptions (
    coupon_code_id, user_id, original_amount, discount_amount, final_amount
  ) VALUES (
    coupon_id, _user_id, _original_amount, _discount_amount, _final_amount
  );
  
  -- Update usage count
  UPDATE public.coupon_codes 
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE id = coupon_id;
  
  RETURN true;
END;
$$;
