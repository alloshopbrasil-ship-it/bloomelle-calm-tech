import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Eagerly loaded routes (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Lazy loaded routes
const PlansPage = lazy(() => import("./pages/Plans"));
const CommunityDashboard = lazy(() => import("./pages/CommunityDashboard"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const BloomSpaces = lazy(() => import("./pages/BloomSpaces"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Help = lazy(() => import("./pages/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DailyTasks = lazy(() => import("./pages/DailyTasks"));
const Journal = lazy(() => import("./pages/Journal"));
const Affirmations = lazy(() => import("./pages/Affirmations"));
const BloomGoals = lazy(() => import("./pages/BloomGoals"));
const Settings = lazy(() => import("./pages/Settings"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const EmotionalProgress = lazy(() => import("./pages/EmotionalProgress"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const MyGroups = lazy(() => import("./pages/MyGroups"));
const SavedPosts = lazy(() => import("./pages/SavedPosts"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PostView = lazy(() => import("./pages/PostView"));
const ModernCalendarPage = lazy(() => import("./pages/ModernCalendarPage"));

const queryClient = new QueryClient();

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground flex flex-col items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">🌷</div>
      <span>Carregando...</span>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ScrollToTop />
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/community" element={<BloomSpaces />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/help" element={<Help />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/modern-calendar" element={<ModernCalendarPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/practices" element={<ProtectedRoute><DailyTasks /></ProtectedRoute>} />
              <Route path="/dashboard/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/dashboard/affirmations" element={<ProtectedRoute><Affirmations /></ProtectedRoute>} />
              <Route path="/dashboard/progress" element={<ProtectedRoute><BloomGoals /></ProtectedRoute>} />
              <Route path="/dashboard/emotional-progress" element={<ProtectedRoute><EmotionalProgress /></ProtectedRoute>} />
              <Route path="/dashboard/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/dashboard/community" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/dashboard/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/dashboard/groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
              <Route path="/dashboard/saved" element={<ProtectedRoute><SavedPosts /></ProtectedRoute>} />
              <Route path="/community/groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
              <Route path="/post/:postId" element={<PostView />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;