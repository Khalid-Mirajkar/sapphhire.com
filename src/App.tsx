
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import ParticlesBackground from "./components/ParticlesBackground";
import CustomLoader from "./components/CustomLoader";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StartPractice = lazy(() => import("./pages/StartPractice"));
const MCQTest = lazy(() => import("./pages/MCQTest"));
const Results = lazy(() => import("./pages/Results"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ComingSoonPlaceholder = lazy(() => import("./components/ComingSoonPlaceholder"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Analytics = lazy(() => import("./pages/Analytics"));
const History = lazy(() => import("./pages/History"));
const AIVideoInterview = lazy(() => import("./pages/AIVideoInterview"));
const WaitingScreen = lazy(() => import("./pages/WaitingScreen"));
const Feedback = lazy(() => import("./pages/Feedback"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <CustomLoader size="lg" text="Loading…" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/start-practice" element={<ProtectedRoute><StartPractice /></ProtectedRoute>} />
          <Route path="/waiting" element={<ProtectedRoute><WaitingScreen /></ProtectedRoute>} />
          <Route path="/mcq-test" element={<ProtectedRoute><MCQTest /></ProtectedRoute>} />
          <Route path="/ai-video-interview" element={<ProtectedRoute><AIVideoInterview /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/history" element={<History />} />
          <Route path="/dashboard/feedback" element={<Feedback />} />
          <Route path="/dashboard/:section" element={<ComingSoonPlaceholder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ParticlesBackground />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
