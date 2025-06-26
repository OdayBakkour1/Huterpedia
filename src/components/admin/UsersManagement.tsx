import { useState } from 'react';
import { useAllUsers, useUpdateUserRole, useUpdateUserSubscription, useDeleteUser } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Crown, Shield, User, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

export const UsersManagement = () => {
  const { data: users, isLoading } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updateSubscriptionMutation = useUpdateUserSubscription();
  const deleteUserMutation = useDeleteUser();
  const { toast } = useToast();
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    setUpdatingUser(userId);
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleSubscriptionUpdate = async (userId: string, subscription: string) => {
    try {
      await updateSubscriptionMutation.mutateAsync({ userId, subscription });
      toast({
        title: "Subscription Updated",
        description: "User subscription has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user subscription.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast({
        title: 'User Deleted',
        description: 'User has been successfully deleted.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    const colors = {
      free: 'bg-gray-500/20 text-gray-400',
      premium: 'bg-blue-500/20 text-blue-400',
      enterprise: 'bg-purple-500/20 text-purple-400'
    };
    return colors[subscription as keyof typeof colors] || colors.free;
  };

  const getSubscriptionDates = (user: any) => {
    if (!user) return null;
    
    if (user.subscription === 'premium' && user.subscription_end_date) {
      return (
        <div className="text-xs flex items-center gap-1 text-blue-400">
          <Calendar className="h-3 w-3" />
          <span>Until {format(new Date(user.subscription_end_date), 'MMM dd, yyyy')}</span>
        </div>
      );
    }
    
    if (user.subscription === 'free' && user.trial_end_date) {
      return (
        <div className="text-xs flex items-center gap-1 text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>Trial ends {format(new Date(user.trial_end_date), 'MMM dd, yyyy')}</span>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return <div className="text-slate-400">Loading users...</div>;
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">User</TableHead>
                <TableHead className="text-slate-300">Email</TableHead>
                <TableHead className="text-slate-300">Role</TableHead>
                <TableHead className="text-slate-300">Subscription</TableHead>
                <TableHead className="text-slate-300">Joined</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className="border-slate-700">
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role || 'user')}
                      {user.full_name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{user.email}</TableCell>
                  <TableCell className="text-slate-300 capitalize">
                    {user.role || 'user'}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${getSubscriptionBadge(user.subscription || 'free')}`}>
                        {(user.subscription || 'free').charAt(0).toUpperCase() + (user.subscription || 'free').slice(1)}
                      </span>
                      {getSubscriptionDates(user)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        defaultValue={user.role || 'user'}
                        onValueChange={(value) => handleRoleUpdate(user.id, value as any)}
                        disabled={updatingUser === user.id}
                      >
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="user" className="text-slate-300">User</SelectItem>
                          <SelectItem value="moderator" className="text-slate-300">Moderator</SelectItem>
                          <SelectItem value="admin" className="text-slate-300">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select
                        defaultValue={user.subscription || 'free'}
                        onValueChange={(value) => handleSubscriptionUpdate(user.id, value)}
                        disabled={updateSubscriptionMutation.isPending}
                      >
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="free" className="text-slate-300">Free</SelectItem>
                          <SelectItem value="premium" className="text-slate-300">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}
                        disabled={deleteUserMutation.isPending && userToDelete?.id === user.id}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)} disabled={deleteUserMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUserMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};