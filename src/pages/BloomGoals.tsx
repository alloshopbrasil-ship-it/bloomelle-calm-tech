import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Sparkles, Target, Star, Plus, Crown, Lock, Edit2, Share2 } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoalProgressDialog } from "@/components/GoalProgressDialog";
import { ShareAchievementDialog } from "@/components/ShareAchievementDialog";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  is_completed: boolean;
  category: string | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const BloomGoals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { isPremium, canAddGoal, currentGoalsCount, limits } = usePlanLimits();
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState({ title: "", description: "", emoji: "" });

  // User progress (starts from zero)
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const nextLevelXP = userLevel * 100;
  const levelProgress = (userXP / nextLevelXP) * 100;

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || t("dashboard.welcome");

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: t("goals.errorLoading") || "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGoals(data || []);
      calculateAchievements(data || []);
    }
    setLoading(false);
  };

  const calculateAchievements = (goals: Goal[]) => {
    const completedGoals = goals.filter(g => g.is_completed).length;
    const totalGoals = goals.length;
    
    const achievementsList: Achievement[] = [
      { 
        id: "first-goal", 
        title: t("goals.achievementFirst") || "Primeira Meta", 
        description: t("goals.achievementFirstDesc") || "Crie sua primeira meta", 
        unlocked: totalGoals >= 1 
      },
      { 
        id: "first-complete", 
        title: t("goals.achievementComplete") || "Primeira Conquista", 
        description: t("goals.achievementCompleteDesc") || "Complete sua primeira meta", 
        unlocked: completedGoals >= 1 
      },
      { 
        id: "goal-setter", 
        title: t("goals.achievementSetter") || "Definidora de Metas", 
        description: t("goals.achievementSetterDesc") || "Crie 5 metas", 
        unlocked: totalGoals >= 5 
      },
      { 
        id: "achiever", 
        title: t("goals.achievementAchiever") || "Realizadora", 
        description: t("goals.achievementAchieverDesc") || "Complete 3 metas", 
        unlocked: completedGoals >= 3 
      },
    ];
    
    setAchievements(achievementsList);
    
    // Calculate XP based on completed goals
    const xp = completedGoals * 50;
    setUserXP(xp);
    setUserLevel(Math.floor(xp / 100) + 1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greetings = {
      pt: { morning: "Bom dia", afternoon: "Boa tarde", evening: "Boa noite" },
      en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
      es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches" },
      fr: { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir" }
    };
    const lang = greetings[language] || greetings.pt;
    if (hour < 12) return { text: lang.morning, emoji: "🌸" };
    if (hour < 18) return { text: lang.afternoon, emoji: "💫" };
    return { text: lang.evening, emoji: "🌙" };
  };

  const greeting = getGreeting();

  const subtitleTexts = {
    pt: "Seu crescimento é uma jornada, não uma corrida. Celebre cada passo.",
    en: "Your growth is a journey, not a race. Celebrate every step.",
    es: "Tu crecimiento es un viaje, no una carrera. Celebra cada paso.",
    fr: "Votre croissance est un voyage, pas une course. Célébrez chaque étape."
  };

  const handleViewAllGoals = () => {
    toast({
      title: t("goals.loadingAll") || "Carregando todas as metas... 🎯",
      description: t("goals.loadingAllDesc") || "Preparando sua jornada completa de crescimento.",
    });
  };

  const handleAddNewGoal = () => {
    if (!canAddGoal) {
      setShowPremiumPopup(true);
      return;
    }
    setShowCreateDialog(true);
  };

  const createGoal = async () => {
    if (!newGoalTitle.trim() || !user) {
      toast({
        title: "Ops! 🌸",
        description: t("goals.addTitlePlease") || "Por favor, adicione um título para sua meta.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: newGoalTitle,
        description: newGoalDescription || null,
        category: newGoalCategory || null,
        progress: 0,
        is_completed: false,
      });

    if (error) {
      toast({
        title: t("goals.errorCreating") || "Erro ao criar meta",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("goals.created") || "Meta criada! 🌺",
        description: t("goals.createdDesc") || "Sua nova meta foi adicionada com sucesso.",
      });
      setNewGoalTitle("");
      setNewGoalDescription("");
      setNewGoalCategory("");
      setShowCreateDialog(false);
      loadGoals();
    }
  };

  const levelNames = {
    pt: { seed: "Semente 🌱", sprout: "Broto 🌿", flower: "Flor em Crescimento 🌸" },
    en: { seed: "Seed 🌱", sprout: "Sprout 🌿", flower: "Growing Flower 🌸" },
    es: { seed: "Semilla 🌱", sprout: "Brote 🌿", flower: "Flor en Crecimiento 🌸" },
    fr: { seed: "Graine 🌱", sprout: "Pousse 🌿", flower: "Fleur en Croissance 🌸" }
  };

  const currentLevelNames = levelNames[language] || levelNames.pt;
  const getLevelName = () => {
    if (userLevel === 1) return currentLevelNames.seed;
    if (userLevel === 2) return currentLevelNames.sprout;
    return currentLevelNames.flower;
  };

  const categoryLabels = {
    pt: {
      selfcare: "Autocuidado",
      wellness: "Bem-estar",
      purpose: "Propósito",
      relationships: "Relacionamentos",
      growth: "Crescimento pessoal"
    },
    en: {
      selfcare: "Self-care",
      wellness: "Wellness",
      purpose: "Purpose",
      relationships: "Relationships",
      growth: "Personal growth"
    },
    es: {
      selfcare: "Autocuidado",
      wellness: "Bienestar",
      purpose: "Propósito",
      relationships: "Relaciones",
      growth: "Crecimiento personal"
    },
    fr: {
      selfcare: "Soins personnels",
      wellness: "Bien-être",
      purpose: "Objectif",
      relationships: "Relations",
      growth: "Croissance personnelle"
    }
  };

  const categories = categoryLabels[language] || categoryLabels.pt;

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background via-accent/5 to-primary/10">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">{t("goals.title")}</h1>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
            {/* Greeting */}
            <div className="mb-8 text-center animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-light text-foreground mb-2">
                {greeting.text}, {userName} {greeting.emoji}
              </h2>
              <p className="text-muted-foreground text-lg">
                {subtitleTexts[language] || subtitleTexts.pt}
              </p>
              {!isPremium && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                  <Crown className="w-4 h-4" />
                  <span>{currentGoalsCount}/{limits.maxActiveGoals} {t("goals.activeGoals")}</span>
                </div>
              )}
            </div>

            {/* Level Card */}
            <Card className="mb-6 rounded-2xl border-border/40 bg-gradient-to-br from-primary/10 to-accent/10 animate-fade-in">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{t("goals.level") || "Nível"} {userLevel}</h3>
                      <p className="text-sm text-muted-foreground">{getLevelName()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{userXP}</div>
                    <div className="text-xs text-muted-foreground">{t("goals.of") || "de"} {nextLevelXP} XP</div>
                  </div>
                </div>
                <Progress value={levelProgress} className="h-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  {nextLevelXP - userXP} XP {t("goals.toNextLevel") || "para o próximo nível"}
                </p>
              </CardContent>
            </Card>

            {/* Goals */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t("goals.activeGoalsTitle") || "Metas Ativas"}
                </h3>
                <Button 
                  onClick={handleAddNewGoal}
                  size="sm" 
                  className="rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("goals.newGoal")}
                </Button>
              </div>
              
              {loading ? (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-primary mx-auto animate-pulse" />
                  <p className="text-muted-foreground mt-2">{t("common.loading")}</p>
                </div>
              ) : activeGoals.length === 0 ? (
                <Card className="rounded-2xl border-border/40 bg-card animate-fade-in">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{t("goals.noGoals")} 🌱</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("goals.addFirst")}
                    </p>
                    <Button onClick={handleAddNewGoal} className="rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      {t("goals.createFirst") || "Criar primeira meta"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGoals.map((goal, index) => (
                    <Card
                      key={goal.id}
                      className="rounded-2xl border-border/40 transition-all duration-500 hover:shadow-soft animate-fade-in bg-card cursor-pointer group"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowProgressDialog(true);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{goal.title}</h4>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">{goal.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedGoal(goal);
                              setShowProgressDialog(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{t("goals.progress") || "Progresso"}</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          {goal.category && (
                            <div className="text-xs text-muted-foreground">
                              {t("goals.category") || "Categoria"}: {goal.category}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                {t("goals.achievements") || "Conquistas"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <Card
                    key={achievement.id}
                    className={`rounded-2xl border-border/40 transition-all duration-500 animate-fade-in ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-primary/10 to-accent/10 hover:shadow-bloom"
                        : "bg-muted/20 opacity-60"
                    }`}
                    style={{ animationDelay: `${(activeGoals.length + index) * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {achievement.unlocked ? "🏆" : "🔒"}
                          </div>
                          <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAchievement({
                                title: achievement.title,
                                description: achievement.description,
                                emoji: "🏆"
                              });
                              setShowShareDialog(true);
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            {goals.length > 0 && (
              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="rounded-full px-8 shadow-soft hover:shadow-bloom transition-all duration-300"
                  onClick={handleViewAllGoals}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t("goals.viewAll") || "Ver Todas as Metas"}
                </Button>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-center mb-2">
              {t("goals.newGoal")} 🌺
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("goals.newGoalDesc") || "Defina uma meta para sua jornada de crescimento"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("goals.goalTitle")}</label>
              <Input
                placeholder={t("goals.goalTitlePlaceholder") || "Ex: Praticar meditação diariamente"}
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("goals.goalDescription")}</label>
              <Textarea
                placeholder={t("goals.goalDescPlaceholder") || "Descreva sua meta..."}
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("goals.category") || "Categoria"}</label>
              <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("goals.selectCategory") || "Selecione uma categoria"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="autocuidado">{categories.selfcare}</SelectItem>
                  <SelectItem value="bem-estar">{categories.wellness}</SelectItem>
                  <SelectItem value="propósito">{categories.purpose}</SelectItem>
                  <SelectItem value="relacionamentos">{categories.relationships}</SelectItem>
                  <SelectItem value="crescimento">{categories.growth}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={createGoal} className="flex-1 rounded-full">
                {t("goals.createGoal") || "Criar Meta"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="flex-1 rounded-full">
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumUpgradePopup 
        isOpen={showPremiumPopup} 
        onClose={() => setShowPremiumPopup(false)} 
      />

      {selectedGoal && (
        <GoalProgressDialog
          open={showProgressDialog}
          onOpenChange={setShowProgressDialog}
          goal={selectedGoal}
          onUpdate={loadGoals}
        />
      )}

      <ShareAchievementDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        achievement={selectedAchievement}
      />
    </SidebarProvider>
  );
};

export default BloomGoals;
