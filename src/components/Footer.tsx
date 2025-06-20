import { Shield, Facebook, Linkedin, Twitter, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();
  return <footer className="relative z-10 bg-white/5 backdrop-blur-2xl border-t border-white/10 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <img
                src="/HunterPedia Png-01.png"
                alt="Hunterpedia Logo"
                className="h-12 w-12 object-contain rounded-lg bg-white/80 p-1 shadow"
                style={{ maxWidth: 48, maxHeight: 48 }}
              />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
                  Hunterpedia
                </h3>
                <p className="text-white/60">Built for the defenders of the digital age.</p>
              </div>
            </div>
            <p className="text-white/50">© 2025 Hunterpedia.
All Rights Reserved To Cyberpedia
          </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
            <ul className="space-y-3 text-white/60">
              <li><a href="/about" className="hover:text-cyan-400 transition-colors duration-300">About</a></li>
              <li><a href="/contact" className="hover:text-cyan-400 transition-colors duration-300">Contact</a></li>
              <li><a href="/pricing" className="hover:text-cyan-400 transition-colors duration-300">Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-3 text-white/60">
              <li><a href="/privacy" className="hover:text-cyan-400 transition-colors duration-300">Privacy</a></li>
              <li><a href="/terms" className="hover:text-cyan-400 transition-colors duration-300">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;