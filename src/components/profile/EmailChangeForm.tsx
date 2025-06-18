
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, AlertCircle } from 'lucide-react';

export const EmailChangeForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email Change Requested",
        description: "Please check both your current and new email addresses for confirmation links.",
      });
      
      setNewEmail('');
    } catch (error: any) {
      console.error('Error changing email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">Email Change Process:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You'll receive confirmation emails at both your current and new email addresses</li>
              <li>You must confirm the change from both emails</li>
              <li>Your login email will only change after both confirmations</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleEmailChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentEmail" className="text-slate-300">Current Email</Label>
          <Input
            id="currentEmail"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-slate-700/50 border-slate-600 text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail" className="text-slate-300">New Email</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter your new email address"
            required
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !newEmail || newEmail === user?.email}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Mail className="h-4 w-4 mr-2" />
          {loading ? 'Sending...' : 'Change Email'}
        </Button>
      </form>
    </div>
  );
};
