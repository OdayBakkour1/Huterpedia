import { Shield, Check, Zap, Crown, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import NewPublicHeader from "@/components/NewPublicHeader";
import NewPublicFooter from "@/components/NewPublicFooter";
import { Helmet } from 'react-helmet-async';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: subscription } = useSubscriptionStatus();
  
  const plan = {
    name: "Premium",
    price: "$5",
    period: "/month",
    icon: Zap,
    popular: true,
    trial: "7-day free trial",
    features: ["Full real-time threat feed", "Advanced filtering & search", "Email & chat support", "Personalized feed preferences", "Bookmarks & saved articles", "Multi-source intelligence feeds"],
    aiFeature: "30 AI summaries per month",
    limitations: []
  };

  const handleSubscribe = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      <Helmet>
        <title>Hunterpedia Pricing | Plans for Cyber Professionals</title>
        <meta name="description" content="Choose a plan that fits your needs. Get full access to Hunterpedia's premium threat alerts, CVE tracking, and real-time cybersecurity updates." />
        <meta property="og:title" content="Hunterpedia Pricing | Plans for Cyber Professionals" />
        <meta property="og:description" content="Choose a plan that fits your needs. Get full access to Hunterpedia's premium threat alerts, CVE tracking, and real-time cybersecurity updates." />
        <meta property="og:image" content="https://www.hunterpedia.site/Thumb/Pricing.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hunterpedia.site/pricing" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hunterpedia Pricing | Plans for Cyber Professionals" />
        <meta name="twitter:description" content="Choose a plan that fits your needs. Get full access to Hunterpedia's premium threat alerts, CVE tracking, and real-time cybersecurity updates." />
        <meta name="twitter:image" content="https://www.hunterpedia.site/Thumb/Pricing.png" />
        <link rel="canonical" href="https://www.hunterpedia.site/pricing" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
        {/* Modern mesh gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        {/* Floating geometric shapes - hidden on mobile for performance */}
        <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
        <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
        <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>
        <NewPublicHeader />
        {/* Main Content */}
        <section className="relative z-10 container mx-auto px-6 py-8 sm:py-12">
          <div className="text-center mb-20">
            <h1 className="text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent py-[12px]">
              Simple Pricing
            </h1>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              One plan with everything you need. Start with a 7-day free trial and get full access 
              to our threat intelligence platform.
            </p>
          </div>
        </section>

        {/* Pricing Card */}
        <section className="relative z-10 py-8 sm:py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-md mx-auto">
              <Card className="group relative backdrop-blur-2xl border rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden bg-white/10 border-cyan-400/50 ring-2 ring-cyan-400/30">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-2xl border-2 border-white/20 backdrop-blur-sm">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    7-day free trial
                  </Badge>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardContent className="relative pt-14 sm:pt-16 p-6 sm:p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        $5
                      </span>
                      <span className="text-white/60 text-lg">/month</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="bg-cyan-500/20 p-1 rounded-full">
                          <Check className="h-4 w-4 text-cyan-400" />
                        </div>
                        <span className="text-white/80">{feature}</span>
                      </div>)}
                    <div className="flex items-center space-x-3 border-t border-white/10 pt-4">
                      <div className="bg-purple-500/20 p-1 rounded-full">
                        <Check className="h-4 w-4 text-purple-400" />
                      </div>
                      <span className="text-white/80 font-medium">{plan.aiFeature}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubscribe} 
                    className="w-full shadow-2xl rounded-2xl py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white mb-6"
                  >
                    {subscription?.isExpired 
                      ? "Upgrade Now" 
                      : subscription?.isTrial 
                        ? "Upgrade to Premium" 
                        : "Start 7-Day Free Trial"}
                  </Button>

                  <div className="border-t border-white/10 pt-6">
                    <p className="text-center text-white/60 text-sm mb-4">We accept</p>
                    <div className="flex items-center justify-center space-x-6">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-8 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="Mastercard" className="h-8 w-auto" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative z-10 py-8 sm:py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {[{
              q: "How does the 7-day trial work?",
              a: "Start using all features immediately. No payment required until your trial ends."
            }, {
              q: "What happens after 30 AI summaries?",
              a: "You can still access all other features. AI summaries reset monthly with your subscription."
            }, {
              q: "Can I cancel anytime?",
              a: "Yes, cancel anytime during or after your trial. No long-term commitments required."
            }, {
              q: "How do I get started?",
              a: "Simply create an account and you'll automatically get a 7-day free trial with full access."
            }].map((faq, index) => <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                    <p className="text-white/70">{faq.a}</p>
                  </Card>)}
            </div>
          </div>
        </section>
        <NewPublicFooter />
      </div>
    </>
  );
};
export default Pricing;