
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="*"
                element={
                  <>
                    <Header />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
