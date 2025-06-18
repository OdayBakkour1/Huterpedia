
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Percent, Check, X } from 'lucide-react';

interface CouponInputProps {
  originalAmount: number;
  onCouponApplied: (discount: number, finalAmount: number, couponCode: string) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

interface CouponValidation {
  is_valid: boolean;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  error_message: string;
}

export const CouponInput = ({ 
  originalAmount, 
  onCouponApplied, 
  onCouponRemoved,
  appliedCoupon 
}: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<CouponValidation | null>(null);
  const { toast } = useToast();

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to use coupons",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.rpc('validate_and_apply_coupon', {
        _coupon_code: couponCode.toUpperCase(),
        _user_id: user.id,
        _original_amount: originalAmount
      });

      if (error) throw error;

      const result = data[0] as CouponValidation;
      setValidationResult(result);

      if (result.is_valid) {
        onCouponApplied(result.discount_amount, result.final_amount, couponCode.toUpperCase());
        toast({
          title: "Success",
          description: `Coupon applied! You saved $${result.discount_amount.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: result.error_message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setValidationResult(null);
    onCouponRemoved();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateCoupon();
    }
  };

  return (
    <div className="space-y-4">
      {appliedCoupon ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Coupon Applied</p>
                <p className="text-sm text-green-300">
                  Code: {appliedCoupon} - ${validationResult?.discount_amount.toFixed(2)} discount
                </p>
              </div>
            </div>
            <Button
              onClick={removeCoupon}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Label htmlFor="coupon" className="text-slate-300 flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Have a coupon code?
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="bg-slate-700 border-slate-600 text-white"
              disabled={loading}
            />
            <Button
              onClick={validateCoupon}
              disabled={loading || !couponCode.trim()}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {loading ? 'Checking...' : 'Apply'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
