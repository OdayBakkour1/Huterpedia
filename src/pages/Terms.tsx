import { Shield, Scale, FileText, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import NewPublicHeader from "@/components/NewPublicHeader";
import NewPublicFooter from "@/components/NewPublicFooter";
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Users,
      title: "Acceptance of Terms",
      content: [
        "By accessing Hunterpedia, you agree to these terms",
        "Must be 18+ or have parental consent",
        "Agreement applies to all users and visitors",
        "Updated terms will be posted with notice"
      ]
    },
    {
      icon: CheckCircle,
      title: "Permitted Use",
      content: [
        "Professional cybersecurity research and analysis",
        "Educational and academic purposes",
        "Internal organizational threat intelligence",
        "Integration with approved security tools"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Prohibited Activities",
      content: [
        "Sharing credentials or unauthorized access",
        "Automated scraping without permission",
        "Reselling or redistributing content",
        "Using data for illegal activities"
      ]
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "Content is licensed, not sold",
        "Hunterpedia retains all platform rights",
        "User data remains your property",
        "Respect third-party intellectual property"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Hunterpedia Terms of Use | Legal & User Guidelines</title>
        <meta name="description" content="Understand the rules of using Hunterpedia. Our terms outline your rights, obligations, and how we maintain a secure platform for all users." />
        <meta property="og:title" content="Hunterpedia Terms of Use | Legal & User Guidelines" />
        <meta property="og:description" content="Understand the rules of using Hunterpedia. Our terms outline your rights, obligations, and how we maintain a secure platform for all users." />
        <meta property="og:image" content="https://www.hunterpedia.site/Thumb/TERMSpng.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.hunterpedia.site/terms" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hunterpedia Terms of Use | Legal & User Guidelines" />
        <meta name="twitter:description" content="Understand the rules of using Hunterpedia. Our terms outline your rights, obligations, and how we maintain a secure platform for all users." />
        <meta name="twitter:image" content="https://www.hunterpedia.site/Thumb/TERMSpng.png" />
        <link rel="canonical" href="https://www.hunterpedia.site/terms" />
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
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12 sm:mb-20">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent px-2">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-4xl mx-auto leading-relaxed px-4">
              Clear, fair terms that protect both our users and our platform. 
              Understanding your rights and responsibilities when using Hunterpedia.
            </p>
            <div className="mt-6 sm:mt-8 inline-flex items-center space-x-2 bg-white/5 backdrop-blur-xl rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/10">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
              <span className="text-sm sm:text-base text-white/80">Effective: January 15, 2025</span>
            </div>
          </div>
        </div>

        {/* Overview */}
        <section className="relative z-10 py-12 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-12 sm:mb-20">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
              <CardContent className="relative p-8 sm:p-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  Welcome to Hunterpedia
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
                  <div>
                    <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-4 sm:mb-6">
                      These terms govern your use of Hunterpedia's cybersecurity intelligence platform. 
                      By using our service, you're agreeing to these terms and joining a community 
                      committed to improving global cybersecurity.
                    </p>
                    <p className="text-base sm:text-lg text-cyan-400 font-semibold">
                      Fair. Transparent. Focused on security.
                    </p>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/20 p-1.5 sm:p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      </div>
                      <span className="text-sm sm:text-base text-white/80">Responsible use guidelines</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/20 p-1.5 sm:p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      </div>
                      <span className="text-sm sm:text-base text-white/80">Clear intellectual property rights</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/20 p-1.5 sm:p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      </div>
                      <span className="text-sm sm:text-base text-white/80">Privacy-first approach</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/20 p-1.5 sm:p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400" />
                      </div>
                      <span className="text-sm sm:text-base text-white/80">Professional community standards</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Terms Sections */}
        <section className="relative z-10 py-12 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {sections.map((section, index) => (
                <Card key={index} className="group relative bg-white/5 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
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
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="bg-cyan-500/20 p-1 rounded-full mt-1 flex-shrink-0">
                            <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                          </div>
                          <span className="text-sm sm:text-base text-white/80 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Terms */}
        <section className="relative z-10 py-12 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <Shield className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  Service Availability
                </h3>
                <div className="space-y-3 sm:space-y-4 text-white/70">
                  <p className="text-sm sm:text-base">We strive for 99.9% uptime but cannot guarantee uninterrupted service.</p>
                  <p className="text-sm sm:text-base">Scheduled maintenance will be announced in advance.</p>
                  <p className="text-sm sm:text-base">Emergency maintenance may occur without notice for security reasons.</p>
                  <p className="text-sm sm:text-base">Free tier users may experience reduced priority during high traffic.</p>
                </div>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center">
                  <Scale className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  Limitation of Liability
                </h3>
                <div className="space-y-3 sm:space-y-4 text-white/70">
                  <p className="text-sm sm:text-base">Hunterpedia is provided "as is" without warranties.</p>
                  <p className="text-sm sm:text-base">We are not liable for decisions made using our intelligence.</p>
                  <p className="text-sm sm:text-base">Maximum liability is limited to your subscription fees.</p>
                  <p className="text-sm sm:text-base">Users are responsible for verifying threat intelligence independently.</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative z-10 py-12 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <Card className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-600/10 animate-pulse"></div>
              <CardContent className="relative p-8 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent">
                  Questions About These Terms?
                </h2>
                <p className="text-lg sm:text-xl text-white/70 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                  Our legal team is available to clarify any aspects of these terms. 
                  We believe in transparency and fair dealing in all our relationships.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                  <Button 
                    onClick={() => navigate('/contact')}
                    size="lg"
                    className="group relative bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-2xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Contact Legal Team
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    size="lg"
                    className="bg-white/5 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10 shadow-xl rounded-2xl px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl transition-all duration-300 hover:scale-105"
                  >
                    Accept & Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <NewPublicFooter />
      </div>
    </>
  );
};

export default Terms;
