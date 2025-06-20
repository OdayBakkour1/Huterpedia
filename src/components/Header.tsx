import { Shield, User, LogOut, Settings, UserCircle, Bookmark, Users, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AIUsageIndicator } from "./AIUsageIndicator";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  usePersonalizedFeed?: boolean;
  setUsePersonalizedFeed?: (value: boolean) => void;
  showPreferences?: boolean;
  setShowPreferences?: (value: boolean) => void;
}

export const Header = ({
  usePersonalizedFeed = false,
  setUsePersonalizedFeed,
  showPreferences = false,
  setShowPreferences
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { data: userRole } = useCurrentUserRole();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<{
    full_name: string | null;
    avatar_url: string | null;
  }>({
    full_name: null,
    avatar_url: null
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfileData(data || { full_name: null, avatar_url: null });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profileData.full_name || user?.email || 'User';
  const isDashboard = window.location.pathname === '/dashboard';

  return (
    <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            <img
              src="/HunterPedia Png-01.png"
              alt="Hunterpedia Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Hunterpedia</h1>
              <p className="text-xs sm:text-sm text-slate-400">Security Intelligence Hub</p>
            </div>
          </div>
          
          {isMobile ? (
            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-slate-300 flex items-center gap-3 px-3 py-2 hover:bg-transparent hover:text-slate-300"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profileData.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="bg-slate-700 text-slate-300">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700 w-64">
                    <AIUsageIndicator />
                    
                    {isDashboard && setUsePersonalizedFeed && setShowPreferences && (
                      <>
                        <DropdownMenuItem
                          onClick={() => setUsePersonalizedFeed(!usePersonalizedFeed)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {usePersonalizedFeed ? "Switch to General Feed" : "Switch to Personal Feed"}
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => setShowPreferences(!showPreferences)}
                          className="text-slate-300 hover:text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Feed Preferences
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuItem
                      onClick={() => navigate('/bookmarks')}
                      className="text-slate-300 hover:text-white"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Bookmarks
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="text-slate-300 hover:text-white"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>

                    {userRole === 'admin' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="text-slate-300 hover:text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-slate-300 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Sign In
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              {user && isDashboard && setUsePersonalizedFeed && setShowPreferences && (
                <>
                  <Button
                    onClick={() => setUsePersonalizedFeed(!usePersonalizedFeed)}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm transition-all duration-200 text-xs md:text-sm"
                  >
                    <Users className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">
                      {usePersonalizedFeed ? "Personal Feed" : "Switch to Personal"}
                    </span>
                    <span className="md:hidden">
                      {usePersonalizedFeed ? "Personal" : "Personal"}
                    </span>
                  </Button>
                  
                  <Button
                    onClick={() => setShowPreferences(!showPreferences)}
                    variant="ghost"
                    className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm transition-all duration-200 text-xs md:text-sm"
                  >
                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Feed Preferences</span>
                    <span className="md:hidden">Prefs</span>
                  </Button>
                </>
              )}

              {user && (
                <Button
                  onClick={() => navigate('/bookmarks')}
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm transition-all duration-200 text-xs md:text-sm"
                >
                  <Bookmark className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden lg:inline">Bookmarks</span>
                </Button>
              )}
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-slate-300 flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 hover:bg-transparent hover:text-slate-300"
                    >
                      <Avatar className="h-7 w-7 md:h-8 md:w-8">
                        <AvatarImage src={profileData.avatar_url || undefined} alt="Profile" />
                        <AvatarFallback className="bg-slate-700 text-slate-300">
                          <User className="h-3 w-3 md:h-4 md:w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-sm">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700 w-64">
                    <AIUsageIndicator />
                    <DropdownMenuItem
                      onClick={() => navigate('/profile')}
                      className="text-slate-300 hover:text-white"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    {userRole === 'admin' && (
                      <DropdownMenuItem
                        onClick={() => navigate('/admin')}
                        className="text-slate-300 hover:text-white"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-slate-300 hover:text-white"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Sign In
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
