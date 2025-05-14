
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Changed from Admin to Dashboard
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

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin } = useAuth(); // Add isAdmin here
  
  console.log('ProtectedRoute loading:', loading);
  console.log('ProtectedRoute user:', user);
  console.log('ProtectedRoute isAdmin:', isAdmin());

  // Show loading state or redirect if not authenticated
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if not an admin
  if (!isAdmin()) {
    console.log('User is not admin, redirecting to home.');
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
          <Route path="/dashboard" element={<Dashboard />} /> {/* Use Dashboard component */}
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
