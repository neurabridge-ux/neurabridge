import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import InvestorDashboard from "./pages/investor/InvestorDashboard";
import BrowseExperts from "./pages/investor/BrowseExperts";
import Marketplace from "./pages/Marketplace";
import PublicInsights from "./pages/PublicInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/expert/dashboard" element={<ExpertDashboard />} />
          <Route path="/investor/dashboard" element={<InvestorDashboard />} />
          <Route path="/investor/browse" element={<BrowseExperts />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/public-insights" element={<PublicInsights />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
