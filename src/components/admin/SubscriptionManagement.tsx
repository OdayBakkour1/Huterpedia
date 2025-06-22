import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Calendar, Edit, Users, Search, Filter, Plus, Trash2, Eye } from 'lucide-react';
import { format, addDays, addMonths } from 'date-fns';
import { useSubscriptionPlans } from '@/hooks/useAdminData';

interface UserSubscription {
  id: string;
  email: string;
  full_name: string;
  subscription: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  created_at: string;
  ai_credits: number;
  role?: string;
}

export const SubscriptionManagement = () => {
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [editingUser, setEditingUser] = useState<UserSubscription | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const { data: subscriptionPlans } = useSubscriptionPlans();

  const [editForm, setEditForm] = useState({
    subscription: 'free',
    subscription_start_date: '',
    subscription_end_date: '',
    trial_start_date: '',
    trial_end_date: '',
    ai_credits: 15
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with subscription data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          subscription,
          ai_credits,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch subscriptions data
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*');

      if (subscriptionsError) throw subscriptionsError;

      // Fetch user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine the data
      const roleMap = Object.fromEntries(
        (roles || []).map((r: any) => [r.user_id, r.role])
      );

      const subscriptionMap = Object.fromEntries(
        (subscriptions || []).map((s: any) => [s.user_id, s])
      );

      const combinedUsers = (profiles || []).map((profile: any) => {
        const subscription = subscriptionMap[profile.id];
        return {
          ...profile,
          role: roleMap[profile.id] || 'user',
          subscription_start_date: subscription?.subscription_start_date,
          subscription_end_date: subscription?.subscription_end_date,
          trial_start_date: subscription?.trial_start_date,
          trial_end_date: subscription?.trial_end_date,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserSubscription) => {
    setEditingUser(user);
    setEditForm({
      subscription: user.subscription || 'free',
      subscription_start_date: user.subscription_start_date ? format(new Date(user.subscription_start_date), 'yyyy-MM-dd') : '',
      subscription_end_date: user.subscription_end_date ? format(new Date(user.subscription_end_date), 'yyyy-MM-dd') : '',
      trial_start_date: user.trial_start_date ? format(new Date(user.trial_start_date), 'yyyy-MM-dd') : '',
      trial_end_date: user.trial_end_date ? format(new Date(user.trial_end_date), 'yyyy-MM-dd') : '',
      ai_credits: user.ai_credits || 15
    });
    setShowEditDialog(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser || !subscriptionPlans) return;

    try {
      // Create plan map from subscription plans
      const planMap = Object.fromEntries(
        subscriptionPlans.map((plan: any) => [plan.name.toLowerCase(), plan.id])
      );

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription: editForm.subscription,
          ai_credits: editForm.ai_credits
        })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Get the correct plan ID
      const planId = planMap[editForm.subscription] || planMap['free'] || null;

      // Update or create subscription record
      const subscriptionData = {
        user_id: editingUser.id,
        plan_id: planId,
        status: editForm.subscription === 'free' ? 'trial' : 'active',
        subscription_start_date: editForm.subscription_start_date || null,
        subscription_end_date: editForm.subscription_end_date || null,
        trial_start_date: editForm.trial_start_date || null,
        trial_end_date: editForm.trial_end_date || null,
      };

      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        });

      if (subscriptionError) throw subscriptionError;

      toast({
        title: "Success",
        description: "User subscription updated successfully"
      });

      setShowEditDialog(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user subscription",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      // Delete user profile (cascade will handle related records)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const getSubscriptionBadge = (subscription: string, endDate?: string) => {
    const isExpired = endDate && new Date(endDate) < new Date();
    
    if (isExpired) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
    }

    switch (subscription) {
      case 'premium':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Premium</Badge>;
      case 'free':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Free Trial</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      moderator: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      user: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    return (
      <Badge className={colors[role as keyof typeof colors] || colors.user}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesFilter = filterPlan === 'all' || user.subscription === filterPlan;
    return matchesSearch && matchesFilter;
  });

  const generateTrialDates = () => {
    const now = new Date();
    const trialEnd = addDays(now, 7);
    setEditForm({
      ...editForm,
      trial_start_date: format(now, 'yyyy-MM-dd'),
      trial_end_date: format(trialEnd, 'yyyy-MM-dd')
    });
  };

  const generatePremiumDates = () => {
    const now = new Date();
    const premiumEnd = addMonths(now, 1);
    setEditForm({
      ...editForm,
      subscription_start_date: format(now, 'yyyy-MM-dd'),
      subscription_end_date: format(premiumEnd, 'yyyy-MM-dd')
    });
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-300">Loading subscription data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown className="h-6 w-6 text-purple-400" />
          Subscription Management
        </h2>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free Trial</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">User</TableHead>
                  <TableHead className="text-slate-300">Plan</TableHead>
                  <TableHead className="text-slate-300">Role</TableHead>
                  <TableHead className="text-slate-300">Trial Period</TableHead>
                  <TableHead className="text-slate-300">Subscription Period</TableHead>
                  <TableHead className="text-slate-300">AI Credits</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-700">
                    <TableCell>
                      <div>
                        <div className="text-white font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-slate-400 text-sm">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSubscriptionBadge(user.subscription, user.subscription_end_date)}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role || 'user')}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.trial_start_date && user.trial_end_date ? (
                        <div className="text-sm">
                          <div>{format(new Date(user.trial_start_date), 'MMM dd, yyyy')}</div>
                          <div className="text-slate-400">to {format(new Date(user.trial_end_date), 'MMM dd, yyyy')}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">No trial</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.subscription_start_date && user.subscription_end_date ? (
                        <div className="text-sm">
                          <div>{format(new Date(user.subscription_start_date), 'MMM dd, yyyy')}</div>
                          <div className="text-slate-400">to {format(new Date(user.subscription_end_date), 'MMM dd, yyyy')}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">No subscription</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                        {user.ai_credits || 15}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditUser(user)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Subscription Plan</Label>
                <Select
                  value={editForm.subscription}
                  onValueChange={(value) => setEditForm({ ...editForm, subscription: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="free">Free Trial</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">AI Credits</Label>
                <Input
                  type="number"
                  value={editForm.ai_credits}
                  onChange={(e) => setEditForm({ ...editForm, ai_credits: parseInt(e.target.value) || 15 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Trial Period</Label>
                <Button
                  type="button"
                  onClick={generateTrialDates}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  Generate 7-day trial
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400 text-sm">Trial Start</Label>
                  <Input
                    type="date"
                    value={editForm.trial_start_date}
                    onChange={(e) => setEditForm({ ...editForm, trial_start_date: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Trial End</Label>
                  <Input
                    type="date"
                    value={editForm.trial_end_date}
                    onChange={(e) => setEditForm({ ...editForm, trial_end_date: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Subscription Period</Label>
                <Button
                  type="button"
                  onClick={generatePremiumDates}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  Generate 1-month subscription
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400 text-sm">Subscription Start</Label>
                  <Input
                    type="date"
                    value={editForm.subscription_start_date}
                    onChange={(e) => setEditForm({ ...editForm, subscription_start_date: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Subscription End</Label>
                  <Input
                    type="date"
                    value={editForm.subscription_end_date}
                    onChange={(e) => setEditForm({ ...editForm, subscription_end_date: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowEditDialog(false)}
              variant="outline"
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveUser}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};