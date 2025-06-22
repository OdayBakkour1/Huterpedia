import { Shield, Eye, Lock, Database, UserCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const Privacy = () => {
  const navigate = useNavigate();
  const sections = [{
    icon: UserCheck,
    title: "Information We Collect",
    content: ["Account information (email, name, password)", "Usage data and analytics", "Device and browser information", "Preferences and customization settings"]
  }, {
    icon: Database,
    title: "How We Use Your Data",
    content: ["Provide and improve our services", "Personalize your threat intelligence feed", "Send important security updates", "Analyze usage patterns for optimization"]
  }, {
    icon: Lock,
    title: "Data Protection",
    content: ["End-to-end encryption for sensitive data", "Regular security audits and penetration testing", "SOC 2 Type II compliance", "Zero-knowledge architecture where possible"]
  }, {
    icon: Eye,
    title: "Your Rights",
    content: ["Access your personal data", "Request data deletion", "Opt-out of marketing communications", "Export your data in standard formats"]
  }];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      {/* Floating geometric shapes - hidden on mobile for performance */}
      <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="hidden md:block absolute top-1/3 right-10 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="hidden md:block absolute bottom-20 left-1/3 w-16 h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>
      {/* Custom Header from Landing Page */}
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
                {'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-2 py-[8px]">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-4">
            Your privacy is fundamental to our mission. Learn how we protect and handle 
            your data with the same care we apply to cybersecurity intelligence.
          </p>
          <div className="mt-6 sm:mt-8 inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/10">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
            <span className="text-sm sm:text-base text-white/80">Last updated: January 15, 2025</span>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-12 sm:mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
            <CardContent className="relative p-8 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent py-[8px]">
                Privacy by Design
              </h2>
              <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-6 sm:mb-8 max-w-4xl mx-auto px-4">
                At Hunterpedia, we believe that privacy and security go hand in hand. We've built our platform 
                with privacy-first principles, ensuring that your data is protected with military-grade security 
                while still delivering the threat intelligence you need.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-12">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
                    <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Zero Knowledge</h3>
                  <p className="text-sm sm:text-base text-white/60">We can't access your encrypted data</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">SOC 2 Compliant</h3>
                  <p className="text-sm sm:text-base text-white/60">Enterprise-grade security standards</p>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
                    <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">GDPR Ready</h3>
                  <p className="text-sm sm:text-base text-white/60">Full compliance with global privacy laws</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy Sections */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {sections.map((section, index) => <Card key={index} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 sm:p-8">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-2 sm:p-3 rounded-2xl mr-3 sm:mr-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <section.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, itemIndex) => <li key={itemIndex} className="flex items-start space-x-3">
                        <div className="bg-cyan-500/20 p-1 rounded-full mt-1 flex-shrink-0">
                          <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                        </div>
                        <span className="text-sm sm:text-base text-white/80 leading-relaxed">{item}</span>
                      </li>)}
                  </ul>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-600/10 animate-pulse"></div>
            <CardContent className="relative p-8 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent py-[4px]">
                Questions About Your Privacy?
              </h2>
              <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                Our privacy team is here to help. Contact us with any questions about how we handle your data 
                or to exercise your privacy rights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Button onClick={() => navigate('/contact')} size="lg" className="group relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold transition-all duration-300 hover:scale-105">
                  Contact Privacy Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Footer (custom, as in Landing) */}
      <Footer />
    </div>
  );
};
export default Privacy;