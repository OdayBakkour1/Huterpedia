import { Shield, Users, Globe, Zap, Eye, Brain, Target, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const About = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const values = [{
    icon: Eye,
    title: "Transparency",
    desc: "Open about our sources and methodologies"
  }, {
    icon: Users,
    title: "Community",
    desc: "Building together for collective security"
  }, {
    icon: Award,
    title: "Excellence",
    desc: "Highest standards in threat intelligence"
  }, {
    icon: Globe,
    title: "Global Reach",
    desc: "Worldwide perspective on cyber threats"
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Modern mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-20 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rounded-3xl rotate-45 animate-pulse blur-sm"></div>
      <div className="absolute top-1/3 right-10 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400/10 to-cyan-600/10 rounded-full animate-bounce blur-sm"></div>
      <div className="absolute bottom-20 left-1/3 w-8 h-8 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 rotate-12 animate-pulse blur-sm"></div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-20">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-2">
            About Hunterpedia
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-4">
            We're building the world's most comprehensive real-time cybersecurity intelligence platform, 
            empowering defenders with the information they need to stay ahead of evolving threats.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-12 sm:mb-20">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
              <CardContent className="relative p-8 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  Our Mission
                </h2>
                <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-6 sm:mb-8">
                  To democratize access to high-quality cybersecurity intelligence, ensuring that organizations 
                  of all sizes can defend themselves against the ever-evolving landscape of cyber threats.
                </p>
                <p className="text-base sm:text-lg text-cyan-400">
                  We believe that security should be proactive, not reactive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12 sm:mb-16 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-2">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-6 sm:p-8 text-center">
                  <div className="bg-gradient-to-br from-cyan-500 to-purple-600 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-4 sm:mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 group-hover:text-cyan-300 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">{value.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
            <div className="relative p-8 sm:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mx-0 my-0 py-[6px]">
                Join the Intelligence Revolution
              </h2>
              <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Ready to stay ahead of cyber threats? Start using Hunterpedia today and experience 
                the power of real-time threat intelligence.
              </p>
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                className="group relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                <Shield className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
