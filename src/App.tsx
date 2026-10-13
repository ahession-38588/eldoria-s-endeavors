/* App root */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./lib/AppContext";
import { AuthProvider, useAuth } from "./lib/auth";
import Index from "./pages/Index";
import Stats from "./pages/Stats";
import QuestBoard from "./pages/QuestBoard";
import Training from "./pages/Training";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import GoogleCalendarReturn from "./pages/GoogleCalendarReturn";

const queryClient = new QueryClient();

function Gate() {
  const { user, loading } = useAuth();
  if (window.location.pathname === "/oauth/google-calendar/return") return <GoogleCalendarReturn />;
  if (loading) return <div className="min-h-screen" />;
  if (!user) return <AuthPage />;
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/quests" element={<QuestBoard />} />
          <Route path="/training" element={<Training />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
