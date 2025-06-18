
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, rateLimiter } from '@/utils/security';

export const PasswordChangeForm = () => {
  const { toast } = useToast();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [] as string[]
  });

  const handlePasswordValidation = (password: string) => {
    const validation = validatePassword(password);
    setPasswordValidation(validation);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const rateLimitKey = 'password-change';
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 15 * 60 * 1000)) { // 3 attempts per 15 minutes
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(rateLimitKey) / 60000);
      toast({
        title: "Too many attempts",
        description: `Please wait ${remainingTime} minutes before trying again`,
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid password",
        description: passwordValidation.errors[0],
        variant: "destructive",
      });
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwords.newPassword === passwords.currentPassword) {
      toast({
        title: "Error",
        description: "New password must be different from current password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: passwords.currentPassword
      });

      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully. Please sign in again for security.",
      });
      
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Sign out for security after password change
      setTimeout(() => {
        supabase.auth.signOut();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordChange} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              placeholder="Enter current password"
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
              onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            >
              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwords.newPassword}
              onChange={(e) => {
                setPasswords({ ...passwords, newPassword: e.target.value });
                handlePasswordValidation(e.target.value);
              }}
              placeholder="Enter new password"
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            >
              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {passwords.newPassword && (
          <div className="space-y-2">
            <Label className="text-slate-300">Password Requirements</Label>
            <div className="space-y-1">
              {[
                { test: passwords.newPassword.length >= 8, text: 'At least 8 characters' },
                { test: /[A-Z]/.test(passwords.newPassword), text: 'One uppercase letter' },
                { test: /[a-z]/.test(passwords.newPassword), text: 'One lowercase letter' },
                { test: /[0-9]/.test(passwords.newPassword), text: 'One number' },
                { test: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword), text: 'One special character' }
              ].map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.test ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <X className="h-3 w-3 text-red-500" />
                  )}
                  <span className={req.test ? 'text-green-400' : 'text-slate-400'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !passwordValidation.isValid || !passwords.currentPassword || !passwords.confirmPassword}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Lock className="h-4 w-4 mr-2" />
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
};
