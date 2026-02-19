import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomTabBar from "@/components/BottomTabBar";
import ProfilePage from "@/pages/ProfilePage";
import DiscoveryPage from "@/pages/DiscoveryPage";
import MessagesPage from "@/pages/MessagesPage";
import TrainingPage from "@/pages/TrainingPage";
import NotFound from "./pages/NotFound";
import { AppProvider } from "@/context/AppContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProfilePage />} />
            <Route path="/discover" element={<DiscoveryPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/training" element={<TrainingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomTabBar />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
