import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterSignupDialog = ({ open, onOpenChange }: NewsletterSignupDialogProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Store email in database
      const { error } = await supabase
        .from('newsletter_signups')
        .insert({
          email: email.toLowerCase().trim(),
          user_agent: navigator.userAgent,
        });

      if (error) {
        console.error('Newsletter signup error:', error);
        
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: "There was an error subscribing to the newsletter. Please try again.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive our weekly intel brief starting next week.",
      });
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setIsLoading(false);
      toast({
        title: "Signup failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setIsSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            <Shield className="mr-3 h-6 w-6 text-cyan-400" />
            Weekly Intel Brief
          </DialogTitle>
          <DialogDescription>
            Subscribe to receive weekly cybersecurity intelligence updates in your inbox.
          </DialogDescription>
        </DialogHeader>
        
        {!isSuccess ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-white/80 leading-relaxed">
                Get the most critical cybersecurity intelligence delivered to your inbox every week. 
                Curated threats, zero noise.
              </p>
              
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-cyan-300 mb-2">What you'll get:</h4>
                <ul className="space-y-1 text-sm text-white/70">
                  <li>• Top 5 critical threats & vulnerabilities</li>
                  <li>• APT group activity summaries</li>
                  <li>• Zero-day alerts & exploitation intel</li>
                  <li>• Executive-level security briefings</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-3 transition-all duration-300 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Subscribe to Weekly Brief
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-xs text-white/50 text-center">
              No spam. Unsubscribe anytime. Your email is secure with us.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full p-4 w-fit mx-auto">
              <CheckCircle className="h-12 w-12 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">You're all set!</h3>
              <p className="text-white/70">
                Welcome to the intel community. Your first weekly brief will arrive next Monday.
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewsletterSignupDialog;
