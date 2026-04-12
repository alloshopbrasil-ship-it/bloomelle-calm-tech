import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle, BookOpen, Target } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { DailyProgressBloomelle } from "@/components/DailyProgressBloomelle";
import { useToast } from "@/hooks/use-toast";
import { DashboardTour } from "@/components/DashboardTour";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { getDailyAffirmation, getDailyTip } from "@/lib/dailyContent";
import EmotionalCalendar from "@/components/EmotionalCalendar";
import { DailyTipBalloon } from "@/components/DailyTipBalloon";
import FinishDayButton from "@/components/FinishDayButton";
import GoalsAchievementMap from "@/components/GoalsAchievementMap";
import { supabase } from "@/integrations/supabase/client";
import { useTrial } from "@/hooks/useTrial";
import { TrialBanner } from "@/components/TrialBanner";
import { usePopupManager } from "@/hooks/usePopupManager";
import { DashboardWeeklyCalendar } from "@/components/DashboardWeeklyCalendar";

// Popup components
import { OriginPopup } from "@/components/OriginPopup";
import { WelcomePopup } from "@/components/WelcomePopup";
import { InstructionsPopup } from "@/components/InstructionsPopup";
import { OnboardingPopup } from "@/components/OnboardingPopup";
import { WelcomeTrialPopup } from "@/components/WelcomeTrialPopup";
import { TrialExpiredPopup } from "@/components/TrialExpiredPopup";
import { CommunityPopup } from "@/components/CommunityPopup";

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Você';
  const [todayTasks, setTodayTasks] = useState<Array<{ id: number; title: string; completed: boolean }>>([]);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showGoalsMap, setShowGoalsMap] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "premium">("free");
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const dailyAffirmation = getDailyAffirmation();
  const dailyTip = getDailyTip();
  
  // Trial management
  const { isOnTrial, daysRemaining } = useTrial();
  
  // Centralized popup management
  const { 
    activePopup, 
    markPopupSeen, 
    isLoading: popupLoading,
    isPremium 
  } = usePopupManager();

  // Local state for controlled popups
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcomeTrial, setShowWelcomeTrial] = useState(false);
  const [showTrialExpired, setShowTrialExpired] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Handle active popup changes
  useEffect(() => {
    if (popupLoading) return;

    // Reset all popup states
    setShowOnboarding(false);
    setShowWelcomeTrial(false);
    setShowTrialExpired(false);
    setShowCommunity(false);
    setShowOrigin(false);
    setShowInstructions(false);
    setShowWelcomeBack(false);

    // Show the active popup based on priority
    switch (activePopup) {
      case "origin":
        setShowOrigin(true);
        break;
      case "onboarding":
        setShowOnboarding(true);
        break;
      case "instructions":
        setShowInstructions(true);
        break;
      case "welcome_trial":
        setShowWelcomeTrial(true);
        break;
      case "trial_expired":
        setShowTrialExpired(true);
        break;
      case "community":
        setShowCommunity(true);
        break;
      case "welcome_back":
        setShowWelcomeBack(true);
        break;
      case "premium_upgrade":
        // Premium upgrade is triggered by specific actions, not auto-shown
        break;
    }
  }, [activePopup, popupLoading]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .maybeSingle();
    
    if (data) {
      setUserPlan((data.plan_type as "free" | "premium") || "free");
    }
  };

  // Popup close handlers with database persistence
  const handleOriginClose = async () => {
    await markPopupSeen("origin");
    setShowOrigin(false);
  };

  const handleOnboardingClose = async () => {
    await markPopupSeen("onboarding");
    setShowOnboarding(false);
  };

  const handleInstructionsClose = async () => {
    await markPopupSeen("instructions");
    setShowInstructions(false);
  };

  const handleWelcomeTrialClose = async () => {
    await markPopupSeen("welcome_trial");
    setShowWelcomeTrial(false);
  };

  const handleTrialExpiredClose = async () => {
    await markPopupSeen("trial_expired");
    setShowTrialExpired(false);
  };

  const handleCommunityClose = async () => {
    await markPopupSeen("community");
    setShowCommunity(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: t("dashboard.greeting.morning"), emoji: "🌸" };
    if (hour < 18) return { text: t("dashboard.greeting.afternoon"), emoji: "💫" };
    return { text: t("dashboard.greeting.evening"), emoji: "🌙" };
  };

  const greeting = getGreeting();
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const weekProgress = todayTasks.length > 0 ? Math.round((completedTasks / todayTasks.length) * 100) : 0;

  const toggleTask = (id: number) => {
    setTodayTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    toast({
      title: t("dashboard.taskUpdated"),
      description: t("dashboard.everyStepMatters"),
    });
  };

  const nextLevelXP = userLevel * 100;
  const levelProgress = (userXP / nextLevelXP) * 100;

  return (
    <>
      {/* Controlled Popups - Only show based on activePopup from manager */}
      {showOrigin && (
        <OriginPopup />
      )}
      
      {showWelcomeBack && (
        <WelcomePopup userName={userName} />
      )}
      
      {showInstructions && (
        <InstructionsPopup />
      )}
      
      {showOnboarding && (
        <OnboardingPopup 
          isOpen={showOnboarding} 
          onClose={handleOnboardingClose} 
        />
      )}
      
      <DashboardTour />
      
      <PremiumUpgradePopup 
        isOpen={showPremiumPopup} 
        onClose={() => setShowPremiumPopup(false)} 
      />
      
      <GoalsAchievementMap
        isOpen={showGoalsMap}
        onClose={() => setShowGoalsMap(false)}
      />
      
      <TrialExpiredPopup
        open={showTrialExpired}
        onOpenChange={(open) => {
          if (!open) handleTrialExpiredClose();
        }}
      />
      
      <WelcomeTrialPopup
        open={showWelcomeTrial}
        onOpenChange={(open) => {
          if (!open) handleWelcomeTrialClose();
        }}
      />
      
      <CommunityPopup
        isOpen={showCommunity}
        onClose={() => setShowCommunity(false)}
        onMarkSeen={handleCommunityClose}
      />
      
      <DashboardLayout title="Dashboard" userPlan={userPlan}>
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col items-center text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                {greeting.text}, {userName} {greeting.emoji}
              </h2>
              <p className="text-muted-foreground text-lg">
                {t("dashboard.blooming")}
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm text-muted-foreground mb-1">{t("dashboard.affirmationOfDay")}</p>
              <p className="text-lg font-light text-primary italic">"{dailyAffirmation}"</p>
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        {isOnTrial && daysRemaining > 0 && (
          <div className="mb-6 animate-fade-in">
            <TrialBanner daysRemaining={daysRemaining} />
          </div>
        )}

        {/* Weekly Horizontal Calendar */}
        <div className="animate-fade-in" style={{ animationDelay: "30ms" }}>
          <DashboardWeeklyCalendar 
            completedDays={completedTasks === todayTasks.length && todayTasks.length > 0 ? [new Date()] : []} 
          />
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Progress Bloomelle */}
            <div className="animate-fade-in" style={{ animationDelay: "50ms" }}>
              <DailyProgressBloomelle 
                userPlan={userPlan}
                tasksCompleted={completedTasks}
                userName={userName}
              />
            </div>
            
            {/* Emotional Calendar / MoodMap */}
            <div className="animate-fade-in" style={{ animationDelay: "75ms" }}>
              <EmotionalCalendar />
            </div>
            {/* Progress Card */}
            <Card className="rounded-2xl bg-white border-border/40 overflow-hidden animate-fade-in" style={{ 
              animationDelay: "100ms",
              boxShadow: 'var(--shadow-card)'
            }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">{t("dashboard.yourProgress")} 🌼</h3>
                    <p className="text-sm text-foreground/70">
                      {todayTasks.length === 0 
                        ? t("dashboard.createFirstTasks")
                        : t("dashboard.completedOf").replace("{completed}", String(completedTasks)).replace("{total}", String(todayTasks.length))
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-light text-primary">{weekProgress}%</div>
                    <div className="text-xs text-foreground/60">{t("dashboard.ofToday")}</div>
                  </div>
                </div>
                <Progress value={weekProgress} className="mb-3" />
                <p className="text-sm text-foreground/70 italic">
                  {weekProgress === 0 ? t("dashboard.startJourney") : t("dashboard.keepBlooming")}
                </p>
              </div>
            </Card>

            {/* Today's Tasks */}
            <Card className="rounded-2xl bg-white border-border/40 animate-fade-in" style={{ 
              animationDelay: "150ms",
              boxShadow: 'var(--shadow-card)'
            }}>
              <CardHeader>
                <h3 className="text-xl font-semibold">{t("dashboard.todayTasks")} 💫</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.smallActions")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">{t("dashboard.noTasks")}</p>
                  </div>
                ) : (
                  todayTasks.map(task => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-card to-muted/20 border border-border/40 hover:border-primary/40 transition-all cursor-pointer hover:shadow-sm"
                      onClick={() => toggleTask(task.id)}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                      }`}>
                        {task.completed && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      <span className={`flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))
                )}
                <Button asChild className="w-full mt-4 rounded-2xl bg-primary hover:bg-primary/90">
                  <Link to="/dashboard/practices">
                    {todayTasks.length === 0 ? t("dashboard.createTasks") : t("dashboard.seeAllTasks")}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Affirmation Card */}
            <Card className="rounded-2xl bg-white border-border/40 animate-fade-in overflow-hidden" style={{ 
              animationDelay: "200ms",
              boxShadow: 'var(--shadow-bloom)'
            }}>
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2 animate-float" />
                  <h3 className="text-lg font-medium text-foreground/80 mb-2">{t("dashboard.dailyAffirmation")} 🌸</h3>
                </div>
                <blockquote className="text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-6">
                  "{dailyAffirmation}"
                </blockquote>
                <Button asChild variant="outline" className="rounded-full border-primary/30 hover:bg-primary/10">
                  <Link to="/dashboard/affirmations">{t("dashboard.moreAffirmations")}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Bloom Points */}
            <Card className="rounded-2xl bg-white border-border/40 animate-fade-in" style={{ 
              animationDelay: "250ms",
              boxShadow: 'var(--shadow-card)'
            }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{t("dashboard.bloomPoints")} 🌺</h3>
                    <p className="text-sm text-muted-foreground">{t("dashboard.gamifiedJourney")}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-primary">{t("dashboard.level")} {userLevel}</div>
                    <div className="text-xs text-muted-foreground">{userXP} {t("dashboard.points")}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={levelProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {nextLevelXP - userXP} {t("dashboard.pointsToNext")}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 rounded-2xl hover:bg-primary/5"
                  onClick={() => setShowGoalsMap(true)}
                >
                  {t("dashboard.seeCompleteGoals")}
                </Button>
              </CardContent>
            </Card>

            {/* Finish Day Button */}
            <div className="animate-fade-in" style={{ animationDelay: "275ms" }}>
              <FinishDayButton 
                tasksCompleted={completedTasks}
                totalTasks={todayTasks.length}
              />
            </div>

            {/* Community Activity */}
            <Card className="rounded-2xl bg-white border-border/40 animate-fade-in" style={{ 
              animationDelay: "300ms",
              boxShadow: 'var(--shadow-card)'
            }}>
              <CardHeader>
                <h3 className="font-semibold text-lg">{t("dashboard.communityActivity")} 💖</h3>
                <p className="text-sm text-muted-foreground">{t("dashboard.womenBlooming")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">{t("dashboard.connectWomen")}</p>
                </div>
                <Button asChild variant="ghost" className="w-full rounded-2xl hover:bg-primary/5">
                  <Link to="/dashboard/community">{t("dashboard.seeCommunity")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Quick Actions */}
          <aside className="space-y-6">
            <Card className="rounded-2xl bg-white p-6 border-border/40 animate-fade-in overflow-hidden" style={{ 
              animationDelay: "350ms",
              boxShadow: 'var(--shadow-soft)'
            }}>
              <BookOpen className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-semibold mb-2">✍️ {t("dashboard.writeJournal")}</h4>
              <p className="text-sm text-foreground/70 mb-4">{t("dashboard.privateSpace")}</p>
              <Button asChild className="w-full rounded-2xl bg-primary hover:bg-primary/90">
                <Link to="/dashboard/journal">{t("dashboard.openJournal")}</Link>
              </Button>
            </Card>

            <Card className="rounded-2xl bg-white p-6 border-border/40 animate-fade-in" style={{ 
              animationDelay: "400ms",
              boxShadow: 'var(--shadow-soft)'
            }}>
              <Target className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-semibold mb-2">🌺 {t("dashboard.createNewGoal")}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t("dashboard.transformDreams")}</p>
              <Button asChild variant="outline" className="w-full rounded-2xl hover:bg-primary/5">
                <Link to="/dashboard/progress">{t("dashboard.seeGoals")}</Link>
              </Button>
            </Card>

            <Card className="rounded-2xl bg-white p-6 border-border/40 animate-fade-in" style={{ 
              animationDelay: "450ms",
              boxShadow: 'var(--shadow-soft)'
            }}>
              <h4 className="font-semibold mb-1">{t("dashboard.tipOfDay")} 💫</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dailyTip}
              </p>
            </Card>

            {/* Daily Tip Balloon */}
            <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
              <DailyTipBalloon />
            </div>
          </aside>
        </section>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
