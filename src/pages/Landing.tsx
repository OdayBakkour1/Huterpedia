import { Shield, Zap, Users, TrendingUp, ChevronRight, Eye, Mail, Globe, Brain, AlertTriangle, BarChart3, Sparkles, ArrowRight, Star, Lock, Activity, Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Footer from "@/components/Footer";
import NewsletterSignupDialog from "@/components/NewsletterSignupDialog";
import { Helmet } from 'react-helmet-async';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  const handleNewsletterSignup = () => {
    setShowNewsletterDialog(true);
  };

  const mockFeedItems = [
    {
      severity: "critical",
      title: "CVE-2025-XXXX – Chrome Zero-Day Being Actively Exploited",
      time: "2 min ago"
    },
    {
      severity: "high",
      title: "New Ransomware Variant \"Cerberus++\" Targets Healthcare Systems",
      time: "15 min ago"
    },
    {
      severity: "medium",
      title: "APT29 Launches Phishing Campaign in EU",
      time: "1 hour ago"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hunterpedia | Cybersecurity News & Threat Intelligence</title>
        <meta name="description" content="Track real-time cyber threats, breaches, and CVE alerts. Hunterpedia aggregates trusted security news sources to keep you protected 24/7." />
        <meta property="og:title" content="Hunterpedia | Cybersecurity News & Threat Intelligence" />
        <meta property="og:description" content="Track real-time cyber threats, breaches, and CVE alerts. Hunterpedia aggregates trusted security news sources to keep you protected 24/7." />
        <meta property="og:image" content="https://www.hunterpedia.site/Thumb/Home.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hunterpedia.site/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hunterpedia | Cybersecurity News & Threat Intelligence" />
        <meta name="twitter:description" content="Track real-time cyber threats, breaches, and CVE alerts. Hunterpedia aggregates trusted security news sources to keep you protected 24/7." />
        <meta name="twitter:image" content="https://www.hunterpedia.site/Thumb/Home.png" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
        {/* Modern mesh gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        
        {/* Floating geometric shapes - hidden on mobile for performance */}
        <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
        <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
        <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>

        {/* Header */}
        <header className="relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl">
            <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src="/HunterPedia Png-01.png"
                    alt="Hunterpedia Logo"
                    className="h-20 w-20 object-contain"
                  />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                      Hunterpedia
                    </h1>
                    <p className="text-xs sm:text-sm text-white/60 hidden sm:block">Intelligence. Curated. Real-Time.</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-2xl rounded-2xl px-3 sm:px-6 py-2 text-sm sm:text-base transition-all duration-300 hover:scale-105"
                >
                  {user ? 'Dashboard' : 'Sign In'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
              {/* Left Column - Text */}
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-3 sm:px-4 py-2 border border-white/10">
                  <Star className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-white/80">World's First Real-Time Cyber Intel</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                    The Intelligence
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-purple-600 bg-clip-text text-transparent">
                    Edge You Can't
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                    Afford to Miss
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Hunterpedia is the world's first real-time cybersecurity news aggregator — giving you a unified view of global threats, breaches, and vulnerabilities.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
                  <Button 
                    onClick={handleGetStarted} 
                    size="lg" 
                    className="w-full sm:w-auto group relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25"
                  >
                    <Shield className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                    Explore Live Feed
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                  
                  <Button 
                    onClick={handleNewsletterSignup} 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto group relative bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 hover:border-white/30 shadow-xl rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-white/10"
                  >
                    <Mail className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="hidden sm:inline">Join the Weekly Intel Brief</span>
                    <span className="sm:hidden">Weekly Brief</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>

                {/* Floating threat badges */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start">
                  <Badge className="bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-xl animate-pulse text-xs sm:text-sm">
                    🚨 Zero-Day Active
                  </Badge>
                  <Badge className="bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 text-purple-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-xl animate-pulse delay-300 text-xs sm:text-sm">
                    💀 CVE-2025-XXXX
                  </Badge>
                  <Badge className="bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-xl animate-pulse delay-500 text-xs sm:text-sm">
                    👤 APT29 Active
                  </Badge>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative mt-8 lg:mt-0">
                {/* Main dashboard mockup */}
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  {/* Thumbnail image for landing page */}
                  <div className="flex justify-center mb-4">
                    <img src="/Thumb/Home.png" alt="Home Thumbnail" className="w-48 h-48 object-cover rounded-3xl shadow-2xl border-4 border-white/10 bg-white/10" />
                  </div>
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-cyan-500 rounded-full"></div>
                    </div>
                    <div className="text-white/60 text-xs sm:text-sm">Live Feed</div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {mockFeedItems.map((item, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                            item.severity === 'critical' ? 'bg-cyan-500' : 
                            item.severity === 'high' ? 'bg-purple-500' : 'bg-cyan-400'
                          } animate-pulse`}></div>
                          <span className="text-white/90 text-xs sm:text-sm font-medium line-clamp-2">{item.title}</span>
                        </div>
                        <div className="text-white/50 text-xs mt-2">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating elements - hidden on mobile */}
                <div className="hidden sm:block absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/10 shadow-xl animate-bounce">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                </div>
                
                <div className="hidden sm:block absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-gradient-to-br from-purple-500/20 to-cyan-600/20 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-white/10 shadow-xl animate-pulse">
                  <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Is Hunterpedia */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-0 py-2">
                Meet Your Cyber Intel Command Center
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed mb-4 sm:mb-6 px-2">
                Hunterpedia brings together the latest in global cybersecurity news, threat intel, and breach updates — curated and filtered from over 200 trusted sources in real time.
              </p>
              <p className="text-lg sm:text-xl text-cyan-400 font-semibold">
                No more switching tabs, no more alerts buried in noise. One dashboard. Total awareness.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Zap,
                  color: "from-cyan-500 to-purple-500",
                  title: "Real-Time Aggregation",
                  desc: "Live threat intel from global sources"
                },
                {
                  icon: Brain,
                  color: "from-cyan-500 to-purple-600",
                  title: "AI-Powered Relevance",
                  desc: "Noise reduction via intelligent filtering"
                },
                {
                  icon: Globe,
                  color: "from-purple-500 to-cyan-500",
                  title: "200+ Global Sources",
                  desc: "Comprehensive coverage worldwide"
                },
                {
                  icon: Users,
                  color: "from-purple-500 to-cyan-600",
                  title: "Threat Actor Tracking",
                  desc: "APT groups and attribution intel"
                },
                {
                  icon: AlertTriangle,
                  color: "from-cyan-500 to-purple-500",
                  title: "CVE Alerts",
                  desc: "Instant vulnerability notifications"
                },
                {
                  icon: BarChart3,
                  color: "from-purple-500 to-cyan-500",
                  title: "Analyst Summaries",
                  desc: "Ready-to-use intelligence reports"
                }
              ].map((item, index) => (
                <Card key={index} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <CardContent className="relative p-6 sm:p-8">
                    <div className={`bg-gradient-to-br ${item.color} p-3 sm:p-4 rounded-2xl w-fit mb-4 sm:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-transparent">
                Under the Hood: How Hunterpedia Works
              </h2>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                {[
                  {
                    step: "01",
                    title: "Aggregate",
                    desc: "Continuously scans and ingests feeds from 200+ global cybersecurity sources.",
                    color: "from-cyan-500 to-purple-500"
                  },
                  {
                    step: "02",
                    title: "Classify",
                    desc: "Proprietary AI tags and prioritizes by severity, region, actor, and type.",
                    color: "from-purple-500 to-cyan-500"
                  },
                  {
                    step: "03",
                    title: "Deliver",
                    desc: "Access the live feed, or receive curated weekly intel directly in your inbox.",
                    color: "from-cyan-500 to-purple-600"
                  }
                ].map((item, index) => (
                  <div key={index} className="group text-center relative">
                    {/* Connection line - hidden on mobile */}
                    {index < 2 && (
                      <div className="hidden lg:block absolute top-16 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent z-0"></div>
                    )}
                    
                    <div className="relative z-10">
                      <div className="relative mb-6 sm:mb-8">
                        <div className={`bg-gradient-to-br ${item.color} p-6 sm:p-8 rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 backdrop-blur-xl border border-white/10`}>
                          <span className="text-xl sm:text-2xl font-bold text-white">{item.step}</span>
                        </div>
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-white/70 leading-relaxed max-w-sm mx-auto text-sm sm:text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Live Preview */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                Real Threats. Real Time.
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                This isn't a simulation. Here's a live snapshot of the intel Hunterpedia is tracking right now.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-3xl opacity-20 animate-pulse"></div>
                
                <CardContent className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 sm:p-3 rounded-2xl mr-3 sm:mr-4 shadow-xl">
                        <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <span className="hidden sm:inline">Live Threat Feed</span>
                      <span className="sm:hidden">Live Feed</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-white/60 text-sm">Live</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {mockFeedItems.map((item, index) => (
                      <div key={index} className="group bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-102">
                        <div className="flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                          <div className="flex items-center space-x-3 sm:space-x-4 w-full">
                            <Badge className={`${
                              item.severity === 'critical' 
                                ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' 
                                : item.severity === 'high' 
                                ? 'bg-purple-500/20 border-purple-500/30 text-purple-300' 
                                : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                            } px-3 sm:px-4 py-1 sm:py-2 rounded-full font-semibold backdrop-blur-xl text-xs sm:text-sm flex-shrink-0`}>
                              {item.severity === 'critical' ? '🚨 CRITICAL' : item.severity === 'high' ? '⚠️ HIGH' : '📍 MEDIUM'}
                            </Badge>
                            <span className="text-white font-medium group-hover:text-cyan-300 transition-colors duration-300 text-sm sm:text-base line-clamp-2">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-white/50 text-xs sm:text-sm flex-shrink-0 self-end sm:self-center">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent py-2">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
                Start with a 7-day free trial and get full access to our threat intelligence platform.
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card className="group relative backdrop-blur-2xl border rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden bg-white/10 border-cyan-400/50 ring-2 ring-cyan-400/30">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                  <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm shadow-2xl border-2 border-white/20 backdrop-blur-sm">
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    7-day free trial
                  </Badge>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                
                <CardContent className="relative pt-10 sm:pt-12 p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Premium</h3>
                    <div className="mb-4 sm:mb-6">
                      <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        $5
                      </span>
                      <span className="text-white/60 text-base sm:text-lg">/month</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {[
                      "Full real-time threat feed",
                      "Advanced filtering & search",
                      "Email & chat support",
                      "Personalized feed preferences",
                      "Bookmarks & saved articles",
                      "Multi-source intelligence feeds"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="bg-cyan-500/20 p-1 rounded-full flex-shrink-0">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-400" />
                        </div>
                        <span className="text-white/80 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                    <div className="flex items-center space-x-3 border-t border-white/10 pt-3 mt-4">
                      <div className="bg-purple-500/20 p-1 rounded-full flex-shrink-0">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                      </div>
                      <span className="text-white/80 font-medium text-sm sm:text-base">15 AI summaries per month</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGetStarted} 
                    className="w-full shadow-2xl rounded-2xl py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white mb-4"
                  >
                    Start 7-Day Free Trial
                  </Button>

                  <div className="text-center">
                    <button 
                      onClick={() => navigate('/pricing')} 
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors duration-300"
                    >
                      View full pricing details →
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Animated mesh gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
              
              <div className="relative p-8 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  Don't Just React. Hunt Smarter.
                </h2>
                <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
                  Hunterpedia puts you one step ahead of attackers, breaches, and emerging threats — without the noise. Start using the world's first cybersecurity news aggregator today.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <Button 
                    onClick={handleGetStarted} 
                    size="lg" 
                    className="w-full sm:w-auto group relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                    Launch the Feed
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                  
                  <Button 
                    onClick={handleNewsletterSignup} 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto group relative bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 hover:border-white/30 shadow-xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-white/10"
                  >
                    <Mail className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="hidden sm:inline">Join the Weekly Intel Brief</span>
                    <span className="sm:hidden">Weekly Brief</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Newsletter Dialog */}
        <NewsletterSignupDialog open={showNewsletterDialog} onOpenChange={setShowNewsletterDialog} />
      </div>
    </>
  );
};

export default Landing;
