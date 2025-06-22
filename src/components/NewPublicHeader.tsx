import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NewPublicHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
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
  );
};

export default NewPublicHeader; 