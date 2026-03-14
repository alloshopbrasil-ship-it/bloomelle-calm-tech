import { useState } from "react";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface DailyProgressBloomelleProps {
  userPlan: "free" | "premium";
  tasksCompleted: number;
  userName?: string;
}

export function DailyProgressBloomelle({ 
  userPlan, 
  tasksCompleted,
  userName = "Ana" 
}: DailyProgressBloomelleProps) {
  const [showLimitPopup, setShowLimitPopup] = useState(false);
  
  const dailyLimit = userPlan === "free" ? 5 : Infinity;
  const progress = Math.min((tasksCompleted / dailyLimit) * 100, 100);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bom dia", emoji: "☀️" };
    if (hour < 18) return { text: "Boa tarde", emoji: "🌸" };
    return { text: "Boa noite", emoji: "🌙" };
  };

  const getMessage = () => {
    if (progress === 100 && userPlan === "free") {
      return "Limite do plano atingido 💫";
    }
    if (progress === 100) {
      return "Florescimento completo 🌺";
    }
    if (progress >= 71) {
      return "Quase lá, mantenha o ritmo ✨";
    }
    if (progress >= 31) {
      return "Você está crescendo 💕";
    }
    return "Pronta para florescer 🌱";
  };

  const greeting = getGreeting();

  // Trigger popup when limit is reached
  if (progress === 100 && userPlan === "free" && !showLimitPopup) {
    setShowLimitPopup(true);
  }

  return (
    <>
      <Card className="relative overflow-hidden rounded-3xl border-border/40 bg-gradient-to-br from-card via-primary/5 to-accent/10 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
        <div className="p-8 flex flex-col items-center text-center">
          {/* Greeting */}
          <div className="mb-6">
            <h3 className="text-xl font-light text-foreground mb-1">
              {greeting.text}, {userName} {greeting.emoji}
            </h3>
            <p className="text-sm text-muted-foreground">Seu progresso diário</p>
          </div>

          {/* Circular Progress */}
          <div className="relative mb-6">
            <AnimatedCircularProgressBar
              max={dailyLimit}
              min={0}
              value={tasksCompleted}
              gaugePrimaryColor={userPlan === "premium" ? "hsl(270 60% 75%)" : "hsl(350 50% 70%)"}
              gaugeSecondaryColor="hsl(350 25% 90%)"
              className="size-48"
            />
            {userPlan === "premium" && progress > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                <Sparkles className="absolute top-4 right-8 w-4 h-4 text-primary animate-pulse" />
                <Sparkles className="absolute bottom-8 left-6 w-3 h-3 text-accent animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
            )}
          </div>

          {/* Message */}
          <p className="text-lg font-light text-primary mb-2">{getMessage()}</p>
          
          {/* Task count */}
          <p className="text-sm text-muted-foreground">
            Tarefas: {tasksCompleted}/{userPlan === "free" ? dailyLimit : "∞"}
          </p>
        </div>
      </Card>

      {/* Limit Popup */}
      <Dialog open={showLimitPopup} onOpenChange={setShowLimitPopup}>
        <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-center mb-2">
              Você atingiu o limite do seu plano 🌼
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Desbloqueie o Premium para florescer sem limites 💖
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button asChild className="rounded-full">
              <Link to="/plans">Desbloquear Premium</Link>
            </Button>
            <Button variant="ghost" onClick={() => setShowLimitPopup(false)} className="rounded-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}