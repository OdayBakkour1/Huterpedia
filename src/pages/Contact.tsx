import { Shield, Mail, MessageSquare, Phone, Send, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const mailtoLink = `mailto:contact@hunterpedia.site?subject=Contact Form: ${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    )}`;
    
    // Open user's default email client
    window.location.href = mailtoLink;
    
    toast({
      title: "Email Client Opened!",
      description: "Your default email client should open with the message pre-filled."
    });
    
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@hunterpedia.site",
      href: "mailto:contact@hunterpedia.site",
      description: "Get in touch via email"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+963 932477242",
      href: "tel:+963932477242",
      description: "Call us directly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="absolute top-1/3 right-10 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="absolute bottom-20 left-1/3 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>

      {/* Header */}
      <header className="relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl">
          <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4 cursor-pointer" onClick={() => navigate('/')}>
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
                {user ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-2">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed px-4">
            Have questions about Hunterpedia? Need enterprise solutions? We're here to help you 
            strengthen your cybersecurity posture with real-time threat intelligence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 pb-12 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Contact Methods - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {contactMethods.map((method, index) => (
                <Card key={index} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-6 sm:p-8 text-center">
                    <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-4 sm:mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <method.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300">
                      {method.title}
                    </h3>
                    <p className="text-white/60 mb-3 sm:mb-4 text-sm sm:text-base">{method.description}</p>
                    <a href={method.href} className="text-cyan-300 text-base sm:text-lg font-medium hover:text-cyan-200 transition-colors duration-300 break-all">
                      {method.value}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Form - Full Width */}
            <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 opacity-50"></div>
              <CardContent className="relative p-6 sm:p-12">
                <div className="text-center mb-8 sm:mb-12">
                  <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-4 sm:mb-6">
                    <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 sm:mb-3">Your Name</label>
                      <Input 
                        placeholder="Enter your full name" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                        className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-6 text-sm sm:text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" 
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2 sm:mb-3">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="Enter your email address" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                        className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-6 text-sm sm:text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" 
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6 sm:mb-8">
                    <label className="block text-white/80 text-sm font-medium mb-2 sm:mb-3">Subject</label>
                    <Input 
                      placeholder="What is this about?" 
                      value={formData.subject} 
                      onChange={e => setFormData({...formData, subject: e.target.value})} 
                      required 
                      className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-6 text-sm sm:text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300" 
                    />
                  </div>
                  
                  <div className="mb-8 sm:mb-10">
                    <label className="block text-white/80 text-sm font-medium mb-2 sm:mb-3">Message</label>
                    <Textarea 
                      placeholder="Tell us more about your inquiry..." 
                      value={formData.message} 
                      onChange={e => setFormData({...formData, message: e.target.value})} 
                      required 
                      rows={6} 
                      className="bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 rounded-2xl py-4 sm:py-6 px-4 sm:px-6 text-sm sm:text-base focus:border-cyan-400/50 focus:ring-cyan-400/25 transition-all duration-300 resize-none" 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                    >
                      <Send className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-12 sm:mt-16 text-center">
              <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-600/10 animate-pulse"></div>
                <CardContent className="relative p-8 sm:p-12">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                    Need Immediate Assistance?
                  </h3>
                  <p className="text-lg sm:text-xl text-white/70 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                    For urgent security matters or enterprise inquiries, don't hesitate to reach out directly. 
                    Our team monitors communications closely to ensure rapid response times.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-white/60">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      <span className="text-sm sm:text-base">Response within 24 hours</span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 bg-white/30 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                      <span className="text-sm sm:text-base">Secure communication</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
