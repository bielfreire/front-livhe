import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Battle from "./pages/Battle";
import Users from "./pages/Users";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Contact from "./pages/Contact";
import Tutorials from "./pages/Tutorials";
import Updates from "./pages/Updates";

import Moods from "./pages/Moods";
import MoodsBattle from "./pages/MoodsBattle";

import MoodPresetConfig from "./pages/MoodPresetConfig ";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Login from "./pages/Login";
import RecuperarSenha from "./pages/RecuperarSenha";
import ResetarSenha from "./pages/ResetarSenha";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import React, { useState, useEffect } from "react";
import { TikTokMonitorProvider } from "@/contexts/TikTokMonitorContext";
import OverlayPage from "./pages/OverlayPage";
import OverlayLink from "./pages/OverlayLink";
import { PrivateRoute } from "./components/PrivateRoute";
import { LoadingScreen } from './components/LoadingScreen';
import './i18n/i18n';
import { UpdateNotification } from './components/UpdateNotification';
import Overlays from "./pages/Overlays";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Define the App component
const App = () => {
  const [isLoading, setIsLoading] = useState(process.env.NODE_ENV === 'production');

  useEffect(() => {
    // Verifica se está em produção
    if (process.env.NODE_ENV === 'production') {
      // O LoadingScreen agora gerencia internamente quando está pronto
      // Não precisa mais escutar eventos aqui
    } else {
      // Em desenvolvimento, não mostra a tela de carregamento
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* <Sonner /> */}
        <TikTokMonitorProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/recuperar-senha" element={<RecuperarSenha />} />
              <Route path="/resetar-senha" element={<ResetarSenha />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/games" element={<PrivateRoute><Games /></PrivateRoute>} />
              <Route path="/battle" element={<PrivateRoute><Battle /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/plans" element={<PrivateRoute><Plans /></PrivateRoute>} />
              <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />
              <Route path="/contact" element={<PrivateRoute><Contact /></PrivateRoute>} />
              <Route path="/tutorials" element={<PrivateRoute><Tutorials /></PrivateRoute>} />
              <Route path="/updates" element={<PrivateRoute><Updates /></PrivateRoute>} />
              <Route path="/moods/:id" element={<PrivateRoute><Moods /></PrivateRoute>} />
              <Route path="/battle/:id" element={<PrivateRoute><MoodsBattle /></PrivateRoute>} />
              <Route path="/overlays" element={<PrivateRoute><Overlays /></PrivateRoute>} />
              <Route
                path="/moods/:gameId/mood/:moodId/config"
                element={<PrivateRoute><MoodPresetConfig /></PrivateRoute>}
              />
              <Route path="/overlay/:gameId/:moodId" element={<OverlayPage />} />
              <Route path="/moods/:gameId/mood/:moodId/overlay" element={<OverlayLink />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TikTokMonitorProvider>
        <UpdateNotification />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
