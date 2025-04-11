
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
import { useAppearance } from "./hooks/useAppearance";

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

// مكون لتحميل الخطوط في بداية تحميل التطبيق
const FontLoader = () => {
  useEffect(() => {
    // إضافة الخطوط المستخدمة في التطبيق
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap',
      'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap'
    ];
    
    fonts.forEach((fontUrl, index) => {
      if (!document.getElementById(`font-${index}`)) {
        const link = document.createElement('link');
        link.id = `font-${index}`;
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }
    });
  }, []);
  
  return null;
};

const AppWrapper = () => {
  const { dir, language } = useTranslation();
  const { settings, loading: loadingAppearance, fetchSettings } = useAppearance();
  
  // تأكد من تحميل إعدادات المظهر عند بدء التطبيق
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // تطبيق إعدادات اللغة واتجاه النص
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [dir, language]);
  
  // تطبيق إعدادات المظهر
  useEffect(() => {
    if (!loadingAppearance && settings) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
      document.documentElement.style.setProperty('--secondary', settings.secondary_color);
      document.documentElement.style.setProperty('--background', settings.background_color);
      document.documentElement.style.setProperty('--navbar-color', settings.navbar_color);
      document.documentElement.style.setProperty('--footer-color', settings.footer_color);
      document.documentElement.style.setProperty('--text-color', settings.text_color);
      document.documentElement.style.setProperty('--font-family', settings.font_family);
      
      document.body.style.backgroundColor = settings.background_color;
      document.body.style.color = settings.text_color;
      document.body.style.fontFamily = settings.font_family;
      
      // تطبيق الوضع الداكن إذا كان مفعلاً
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings, loadingAppearance]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <FontLoader />
        <BrowserRouter>
          <div 
            className="min-h-screen flex flex-col"
            style={{ 
              backgroundColor: settings?.background_color || '#F8F9FA',
              color: settings?.text_color || '#1A1F2C',
              fontFamily: settings?.font_family || 'Tajawal, sans-serif'
            }}
          >
            <Navbar />
            <div className="container mx-auto px-4 flex-grow">
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
