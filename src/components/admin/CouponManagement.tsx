
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Percent, Calendar, Users, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';

interface CouponCode {
  id: string;
  code: string;
  discount_percentage: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    max_uses: '',
    valid_until: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const couponData = {
        code: formData.code.toUpperCase(),
        discount_percentage: parseInt(formData.discount_percentage),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        created_by: user.id
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupon_codes')
          .update(couponData)
          .eq('id', editingCoupon.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Coupon updated successfully" });
      } else {
        const { error } = await supabase
          .from('coupon_codes')
          .insert([couponData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Coupon created successfully" });
      }

      setFormData({ code: '', discount_percentage: '', max_uses: '', valid_until: '' });
      setShowForm(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon",
        variant: "destructive"
      });
    }
  };

  const toggleCouponStatus = async (coupon: CouponCode) => {
    try {
      const { error } = await supabase
        .from('coupon_codes')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `Coupon ${!coupon.is_active ? 'activated' : 'deactivated'}` 
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive"
      });
    }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupon_codes')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
      
      toast({ title: "Success", description: "Coupon deleted successfully" });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive"
      });
    }
  };

  const startEdit = (coupon: CouponCode) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_percentage: coupon.discount_percentage.toString(),
      max_uses: coupon.max_uses?.toString() || '',
      valid_until: coupon.valid_until ? format(new Date(coupon.valid_until), 'yyyy-MM-dd') : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ code: '', discount_percentage: '', max_uses: '', valid_until: '' });
    setEditingCoupon(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-300">Loading coupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Percent className="h-6 w-6 text-cyan-400" />
          Coupon Management
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancel' : 'Create Coupon'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code" className="text-slate-300">Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="Enter coupon code"
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                    <Button
                      type="button"
                      onClick={generateRandomCode}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount" className="text-slate-300">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    placeholder="e.g., 20"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="maxUses" className="text-slate-300">Max Uses (Optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="Leave empty for unlimited"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil" className="text-slate-300">Valid Until (Optional)</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                {showForm && (
                  <Button type="button" onClick={resetForm} variant="outline" className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {coupons.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="text-center py-8">
              <p className="text-slate-400">No coupons created yet.</p>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {coupon.code}
                        <Badge variant={coupon.is_active ? "default" : "secondary"}>
                          {coupon.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          {coupon.discount_percentage}% off
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {coupon.current_uses}/{coupon.max_uses || '∞'} uses
                        </span>
                        {coupon.valid_until && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Expires {format(new Date(coupon.valid_until), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={() => toggleCouponStatus(coupon)}
                    />
                    <Button
                      onClick={() => startEdit(coupon)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteCoupon(coupon.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
