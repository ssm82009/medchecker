
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { useAuth } from "./hooks/useAuth";
import { useEffect } from "react";
import { useTranslation } from "./hooks/useTranslation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show loading state or redirect if not authenticated
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public route that redirects to dashboard if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppWrapper = () => {
  const { dir, language } = useTranslation();
  
  useEffect(() => {
    // تطبيق الاتجاه RTL على عنصر html عند تحميل التطبيق
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.className = language === 'ar' ? 'rtl' : 'ltr';

    // تطبيق الاتجاه على عنصر html
    if (language === 'ar') {
      document.querySelector('html')?.setAttribute('dir', 'rtl');
    } else {
      document.querySelector('html')?.setAttribute('dir', 'ltr');
    }
  }, [dir, language]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-400 via-purple-500 to-orange-400">
            <Navbar />
            <div className="container mx-auto px-4 flex-grow pt-24"> {/* Added pt-24 for navbar space */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppWrapper />;

export default App;
