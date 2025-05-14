
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SiteSettings from "./pages/SiteSettings";
import { useAuth, AuthProvider } from "./hooks/useAuth";
import { useState } from "react";
import { useTranslation } from "./hooks/useTranslation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StaticPage from './components/StaticPage';
import Signup from "./pages/Signup";
import Subscribe from "./pages/Subscribe";
import MyAccount from "./pages/MyAccount";
import SimpleSignup from "./pages/SimpleSignup";

const queryClient = new QueryClient();

// Simplified Protected route with minimal checks
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Simplified check - just see if user exists
  if (!user) {
    return <Navigate to="/login" state={{ returnUrl: location.pathname }} replace />;
  }
  
  // Check if admin route but not admin
  if (location.pathname.includes('/dashboard') || location.pathname.includes('/site-settings')) {
    if (user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

// Simplified Public route that redirects to home if logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (user) {
    const returnUrl = location.state && location.state.returnUrl ? location.state.returnUrl : "/";
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
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/site-settings" element={
            <ProtectedRoute>
              <SiteSettings />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<StaticPage pageKey="about" />} />
          <Route path="/terms" element={<StaticPage pageKey="terms" />} />
          <Route path="/privacy" element={<StaticPage pageKey="privacy" />} />
          <Route path="/copyright" element={<StaticPage pageKey="copyright" />} />
          <Route path="/contact" element={<StaticPage pageKey="contact" />} />
          {/* Subscribe page is accessible to all but handles auth internally */}
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/my-account" element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          } />
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
