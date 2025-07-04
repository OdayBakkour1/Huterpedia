import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import { AdminRoute } from "@/components/AdminRoute";
import { MainLayout } from "@/components/MainLayout";
import { useEffect, useState } from "react";
import { DialogContext } from "@/components/Header";

const queryClient = new QueryClient();

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Workaround: forcibly remove pointer-events from body when dialog is open
  useEffect(() => {
    if (dialogOpen) {
      document.body.style.pointerEvents = "auto";
    } else {
      document.body.style.pointerEvents = "";
    }
    // Clean up on unmount
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [dialogOpen]);

  return (
    <DialogContext.Provider value={{ dialogOpen, setDialogOpen }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Routes with MainLayout */}
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                  <Route path="/bookmarks" element={<MainLayout><Bookmarks /></MainLayout>} />

                  {/* Payment Routes */}
                  <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />
                  <Route path="/payment-success" element={<MainLayout><PaymentSuccess /></MainLayout>} />
                  <Route path="/payment-cancel" element={<MainLayout><PaymentCancel /></MainLayout>} />

                  {/* Standalone Routes */}
                  <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/about" element={<MainLayout><About /></MainLayout>} />
                  <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
                  <Route path="/pricing" element={<MainLayout><Pricing /></MainLayout>} />
                  <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
                  <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </DialogContext.Provider>
  );
};

export default App;