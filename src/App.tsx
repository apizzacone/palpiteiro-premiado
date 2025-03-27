
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Teams from "./pages/Teams";
import Championships from "./pages/Championships";
import ChampionshipDetail from "./pages/ChampionshipDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminChampionships from "./pages/admin/AdminChampionships";
import AdminMatches from "./pages/admin/AdminMatches";
import AuthPage from "./pages/auth/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Página de Autenticação */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/championships" element={<Championships />} />
            <Route path="/championships/:id" element={<ChampionshipDetail />} />
            
            {/* Rotas Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/teams" element={<AdminTeams />} />
            <Route path="/admin/championships" element={<AdminChampionships />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
