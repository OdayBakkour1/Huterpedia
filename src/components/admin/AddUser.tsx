
import { useState } from 'react';
import { useAddUser } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AddUser = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    subscription: 'free',
  });
  const addUserMutation = useAddUser();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addUserMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "User has been created successfully.",
      });
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'user',
        subscription: 'free',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-slate-300">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-slate-300">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Enter password"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="text-slate-300">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="user" className="text-slate-300">User</SelectItem>
                  <SelectItem value="moderator" className="text-slate-300">Moderator</SelectItem>
                  <SelectItem value="admin" className="text-slate-300">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subscription" className="text-slate-300">Subscription</Label>
              <Select
                value={formData.subscription}
                onValueChange={(value) => setFormData({ ...formData, subscription: value })}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="free" className="text-slate-300">Free</SelectItem>
                  <SelectItem value="premium" className="text-slate-300">Premium</SelectItem>
                  <SelectItem value="enterprise" className="text-slate-300">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600"
            disabled={addUserMutation.isPending}
          >
            {addUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
