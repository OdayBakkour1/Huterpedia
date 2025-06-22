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
import PaymentSuccess from "@/pages/PaymentSuccess";
import { AdminRoute } from "@/components/AdminRoute";
import { MainLayout } from "@/components/MainLayout";
import Checkout from "@/pages/Checkout";

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
                <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
                <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
                <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                
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