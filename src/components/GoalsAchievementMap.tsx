import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Star, Target, Heart, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  is_completed: boolean;
  category: string | null;
  created_at: string;
}

interface GoalsAchievementMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoalsAchievementMap = ({ isOpen, onClose }: GoalsAchievementMapProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<"free" | "premium">("free");

  useEffect(() => {
    if (isOpen && user) {
      loadGoals();
      loadUserPlan();
    }
  }, [isOpen, user]);

  const loadUserPlan = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("plan_type")
      .eq("id", user.id)
      .single();
    
    if (data) {
      setUserPlan(data.plan_type as "free" | "premium");
    }
  };

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
        title: "Erro ao carregar metas",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const getCategoryIcon = (category: string | null) => {
    switch (category) {
      case "autocuidado": return <Heart className="w-5 h-5" />;
      case "bem-estar": return <Sparkles className="w-5 h-5" />;
      case "propósito": return <Target className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const completedGoals = goals.filter(g => g.is_completed);
  const activeGoals = goals.filter(g => !g.is_completed);
  const canAddMoreGoals = userPlan === "premium" || activeGoals.length < 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] overflow-y-auto rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-light text-center flex-1">
              Mapa de Conquistas 🌺
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-muted-foreground text-center">
            Suas metas e conquistas ao longo da jornada
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-light text-foreground">{completedGoals.length}</div>
              <div className="text-sm text-muted-foreground">Metas Concluídas</div>
            </div>
            
            <div className="bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl p-4 text-center">
              <Target className="w-8 h-8 mx-auto text-accent mb-2" />
              <div className="text-2xl font-light text-foreground">{activeGoals.length}</div>
              <div className="text-sm text-muted-foreground">Metas Ativas</div>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto text-secondary mb-2" />
              <div className="text-2xl font-light text-foreground">
                {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%
              </div>
              <div className="text-sm text-muted-foreground">Progresso Médio</div>
            </div>
          </div>

          {/* Plan Limit Notice */}
          {userPlan === "free" && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 text-center border border-border/40">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Plano Free: {activeGoals.length}/3 metas ativas</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faça upgrade para Premium e tenha metas ilimitadas + badges exclusivos
              </p>
            </div>
          )}

          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Metas Ativas
              </h3>
              <div className="space-y-3">
                {activeGoals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-5 hover:border-primary/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        {getCategoryIcon(goal.category)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{goal.title}</h4>
                          {goal.category && (
                            <Badge variant="outline" className="text-xs">
                              {goal.category}
                            </Badge>
                          )}
                        </div>
                        
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {goal.description}
                          </p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium text-primary">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Conquistas Desbloqueadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedGoals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/20 text-primary">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Concluída em {new Date(goal.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-none">
                        ✨ 100%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {goals.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-light text-foreground mb-2">
                Comece sua jornada! 🌸
              </h3>
              <p className="text-muted-foreground">
                Crie sua primeira meta e acompanhe seu crescimento
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalsAchievementMap;
