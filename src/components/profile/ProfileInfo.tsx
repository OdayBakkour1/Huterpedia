import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAICredits } from '@/hooks/useAICredits';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Zap, Crown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription: string | null;
  created_at: string;
}

export const ProfileInfo = () => {
  const { user } = useAuth();
  const { data: aiCredits } = useAICredits(user?.id || '');
  const { data: subscription } = useSubscriptionStatus();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setFullName(data.full_name || '');
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, full_name: fullName });
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const creditPercentage = aiCredits ? (aiCredits.currentUsage / aiCredits.maxCredits) * 100 : 0;

  if (!profile) {
    return <div className="text-slate-400">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your basic account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-slate-700/50 border-slate-600 text-slate-300"
            />
          </div>
          
          <div>
            <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button onClick={handleSave} disabled={isLoading} size="sm">
                  Save
                </Button>
                <Button 
                  onClick={() => {
                    setIsEditing(false);
                    setFullName(profile?.full_name || '');
                  }} 
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Input
                  value={profile?.full_name || 'Not set'}
                  disabled
                  className="bg-slate-700/50 border-slate-600 text-slate-300"
                />
                <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="outline" 
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label className="text-slate-300">Subscription</Label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getSubscriptionBadge(profile?.subscription || 'free')}`}>
                  {(profile?.subscription || 'free').charAt(0).toUpperCase() + (profile?.subscription || 'free').slice(1)}
                </span>
                {subscription?.isPremium && (
                  <Crown className="h-4 w-4 text-blue-400" />
                )}
              </div>
              
              {subscription && (
                <div className="text-sm text-slate-400">
                  {subscription.isTrial && subscription.isActive && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Trial ends on {format(new Date(subscription.trialEnd!), 'MMMM d, yyyy')} 
                        ({subscription.daysRemaining} days remaining)
                      </span>
                    </div>
                  )}
                  
                  {subscription.isPremium && subscription.isActive && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Premium subscription until {format(new Date(subscription.subscriptionEnd!), 'MMMM d, yyyy')}
                        ({subscription.daysRemaining} days remaining)
                      </span>
                    </div>
                  )}
                  
                  {subscription.isExpired && (
                    <div className="flex items-center gap-1 text-red-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Your {subscription.isTrial ? 'trial' : 'subscription'} has expired
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-slate-300">Member Since</Label>
            <Input
              value={new Date(profile?.created_at || '').toLocaleDateString()}
              disabled
              className="bg-slate-700/50 border-slate-600 text-slate-300"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-cyan-400" />
            AI Credits
          </CardTitle>
          <CardDescription className="text-slate-400">
            Your current AI usage for this month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiCredits ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Remaining Credits</span>
                <span className={`font-mono text-lg ${aiCredits.remainingCredits === 0 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {aiCredits.remainingCredits}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Usage this month</span>
                  <span className="text-slate-400">
                    {aiCredits.currentUsage} / {aiCredits.maxCredits}
                  </span>
                </div>
                <Progress 
                  value={creditPercentage} 
                  className="h-2 bg-slate-700"
                />
              </div>
              
              {aiCredits.remainingCredits === 0 && (
                <div className="text-sm text-red-400 bg-red-500/10 p-3 rounded border border-red-500/20">
                  You've used all your AI credits for this month. Credits will reset on the 1st of next month.
                </div>
              )}
            </>
          ) : (
            <div className="text-slate-400">Loading AI credits...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};