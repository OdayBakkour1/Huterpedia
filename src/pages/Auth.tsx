import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertCircle, Eye, EyeOff, Clock, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/security';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    errors: [] as string[]
  });
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const {
    signIn,
    signUp,
    resendConfirmation,
    failedAttempts,
    isLocked,
    lockoutTime
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - (Date.now() - lockoutTime)) / 1000);
        if (remaining <= 0) {
          window.location.reload(); // Refresh to reset lockout state
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);
  const handleEmailChange = (value: string) => {
    const cleanEmail = sanitizeInput(value);
    setEmail(cleanEmail);
    if (cleanEmail && !validateEmail(cleanEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (activeTab === 'signup') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };
  const handleFullNameChange = (value: string) => {
    // Allow spaces in display, limit length
    const cleanName = value.slice(0, 100);
    setFullName(cleanName);
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      const minutes = Math.ceil(lockoutTime / 60000);
      toast({
        title: "Account Locked",
        description: `Too many failed attempts. Try again in ${minutes} minutes.`,
        variant: "destructive"
      });
      return;
    }
    if (emailError) {
      toast({
        title: "Invalid Email",
        description: emailError,
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    setShowResendConfirmation(false);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      // Check if it's an email confirmation error
      if (error.message.includes('confirmation') || error.message.includes('confirmed')) {
        setShowResendConfirmation(true);
        toast({
          title: "Email Not Confirmed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        if (failedAttempts >= 3) {
          toast({
            title: "Security Warning",
            description: `${5 - failedAttempts} attempts remaining before temporary lockout`,
            variant: "destructive"
          });
        }
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError) {
      toast({
        title: "Invalid Email",
        description: emailError,
        variant: "destructive"
      });
      return;
    }
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Requirements Not Met",
        description: passwordValidation.errors[0],
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    const {
      error
    } = await signUp(email, password, fullName);
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account."
      });
    }
    setLoading(false);
  };
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Google Sign In Failed",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setGoogleLoading(false);
    }
  };
  const handleResendConfirmation = async () => {
    if (!email || emailError) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    setResendLoading(true);
    const {
      error
    } = await resendConfirmation(email);
    if (error) {
      toast({
        title: "Failed to Resend",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email for the confirmation link."
      });
      setShowResendConfirmation(false);
    }
    setResendLoading(false);
  };
  const getLockoutMessage = () => {
    if (!isLocked) return null;
    const minutes = Math.ceil(lockoutTime / 60000);
    return <div className="mb-6 p-4 bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl">
        <div className="flex items-center space-x-3 text-red-300">
          <Clock className="h-5 w-5" />
          <span className="text-sm">Account temporarily locked due to failed login attempts. Try again in {minutes} minutes.</span>
        </div>
      </div>;
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>

      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          {/* Animated gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl opacity-50 animate-pulse"></div>
          
          <CardHeader className="relative text-center py-8 px-8">
            <div className="flex justify-center mb-6">
              <img src="/HunterPedia Png-01.png" alt="Hunterpedia Logo" className="h-20 w-20 object-contain" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-2">
              Hunterpedia
            </CardTitle>
            <p className="text-white/60 text-lg">Intelligence. Curated. Real-Time.</p>
          </CardHeader>
          
          <CardContent className="relative px-8 pb-8">
            {getLockoutMessage()}
            
            {failedAttempts > 0 && !isLocked && <div className="mb-6 p-4 bg-yellow-900/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl">
                <div className="flex items-center space-x-3 text-yellow-300">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}. {5 - failedAttempts} remaining.</span>
                </div>
              </div>}

            {showResendConfirmation && <div className="mb-6 p-4 bg-blue-900/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-blue-300">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm">Need to resend confirmation email?</span>
                  </div>
                  <Button onClick={handleResendConfirmation} disabled={resendLoading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 py-1">
                    {resendLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Resend'}
                  </Button>
                </div>
              </div>}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
                <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20 data-[state=active]:border data-[state=active]:border-white/20 rounded-xl font-medium transition-all duration-300 text-slate-800">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-600/20 data-[state=active]:border data-[state=active]:border-white/20 rounded-xl font-medium transition-all duration-300 text-slate-800">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="mt-8">
                <div className="space-y-6">
                  <Button onClick={handleGoogleAuth} disabled={googleLoading || isLocked} className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-xl rounded-2xl py-6 text-base font-medium transition-all duration-300 hover:scale-105" variant="outline">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm uppercase">
                      <span className="px-4 text-white/60 font-medium">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <Input type="email" placeholder="Email" value={email} onChange={e => handleEmailChange(e.target.value)} required disabled={isLocked} className={`bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-6 px-4 text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300 ${emailError ? 'border-red-400/50' : ''}`} />
                      {emailError && <p className="text-red-300 text-sm mt-2 px-2">{emailError}</p>}
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => handlePasswordChange(e.target.value)} required disabled={isLocked} className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-6 px-4 pr-12 text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-xl p-2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl py-6 text-base font-semibold transition-all duration-300 hover:scale-105" disabled={loading || isLocked || !!emailError}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-8">
                <div className="space-y-6">
                  <Button onClick={handleGoogleAuth} disabled={googleLoading} className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-xl rounded-2xl py-6 text-base font-medium transition-all duration-300 hover:scale-105" variant="outline">
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {googleLoading ? 'Signing up with Google...' : 'Continue with Google'}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-sm uppercase">
                      <span className="px-4 text-white/60 font-medium">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div>
                      <Input 
                        type="text" 
                        placeholder="Full Name" 
                        value={fullName} 
                        onChange={e => handleFullNameChange(e.target.value)} 
                        className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-6 px-4 text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" 
                      />
                    </div>
                    <div>
                      <Input type="email" placeholder="Email" value={email} onChange={e => handleEmailChange(e.target.value)} required className={`bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-6 px-4 text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300 ${emailError ? 'border-red-400/50' : ''}`} />
                      {emailError && <p className="text-red-300 text-sm mt-2 px-2">{emailError}</p>}
                    </div>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => handlePasswordChange(e.target.value)} required className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-6 px-4 pr-12 text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/90 hover:bg-white/10 rounded-xl p-2" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {password && !passwordValidation.isValid && <div className="text-sm text-red-300 space-y-1 bg-red-900/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-4">
                        {passwordValidation.errors.map((error, index) => <div key={index}>• {error}</div>)}
                      </div>}
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl py-6 text-base font-semibold transition-all duration-300 hover:scale-105" disabled={loading || !!emailError || !passwordValidation.isValid}>
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex items-center space-x-3 text-sm text-white/70">
                <AlertCircle className="h-4 w-4 text-cyan-400" />
                <span>Secured By Cyberpedia</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};

export default Auth;
