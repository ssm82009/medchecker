import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import { useState, useEffect } from "react";
import { useTranslation } from "./hooks/useTranslation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StaticPage from './components/StaticPage';
import Signup from "./pages/Signup";
import Subscribe from "./pages/Subscribe";
import MyAccount from "./pages/MyAccount";
import SimpleSignup from "./pages/SimpleSignup";
import Dashboard from "./pages/Dashboard";

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

// Admin route component that checks if user has admin role
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { language } = useTranslation();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdmin = async () => {
      if (!loading && user) {
        console.log("AdminRoute - Checking admin status for:", user.email);
        console.log("AdminRoute - User role is:", user.role);
        
        // Directly check the role property from our user object
        // This now incorporates the database role check in useAuth
        const adminStatus = user.role === 'admin';
        console.log("AdminRoute - Is admin?", adminStatus);
        
        setIsAdminUser(adminStatus);
      }
      setCheckingAdmin(false);
    };
    
    checkAdmin();
  }, [user, loading]);
  
  // Show loading state
  if (loading || checkingAdmin) {
    return <div className="flex h-screen items-center justify-center">
      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
    </div>;
  }
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if user is not an admin
  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Public route that redirects to dashboard if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    const returnUrl = location.state && location.state.returnUrl ? location.state.returnUrl : "/dashboard";
    return <Navigate to={returnUrl} replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { dir, language } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-400/15 via-purple-500/15 to-orange-400/15">
      <Navbar />
      <div className="container mx-auto px-4 flex-grow pt-8"> 
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="/about" element={<StaticPage pageKey="about" />} />
          <Route path="/terms" element={<StaticPage pageKey="terms" />} />
          <Route path="/privacy" element={<StaticPage pageKey="privacy" />} />
          <Route path="/copyright" element={<StaticPage pageKey="copyright" />} />
          <Route path="/contact" element={<StaticPage pageKey="contact" />} />
          {/* Subscribe page is accessible to all but handles auth internally */}
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/my-account" element={<MyAccount />} />
          <Route path="/simple-signup" element={<SimpleSignup />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
      <Toaster />
      <Sonner />
    </QueryClientProvider>
  );
}

export default App;
