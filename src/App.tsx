import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/AdminDashboard";
import Bookmarks from "@/pages/Bookmarks";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Pricing from "@/pages/Pricing";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import { AdminRoute } from "@/components/AdminRoute";
import { MainLayout } from "@/components/MainLayout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Routes with MainLayout */}
                <Route path="/dashboard" element={<Index />} />
                <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                <Route path="/bookmarks" element={<MainLayout><Bookmarks /></MainLayout>} />

                {/* Standalone Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};



export default App;
