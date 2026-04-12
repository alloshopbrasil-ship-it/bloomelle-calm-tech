import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface FinishDayButtonProps {
  tasksCompleted: number;
  totalTasks: number;
}

const FinishDayButton = ({ tasksCompleted, totalTasks }: FinishDayButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleFinishDay = async () => {
    if (!user) return;
    
    setIsFinishing(true);
    
    try {
      // Check if mood was recorded today
      const today = new Date().toISOString().split('T')[0];
      const { data: moodData } = await supabase
        .from("moods")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .limit(1);
      
      const moodRecorded = (moodData?.length || 0) > 0;

      // Insert or update daily completion
      const { error } = await supabase
        .from("daily_completions")
        .upsert({
          user_id: user.id,
          completion_date: today,
          tasks_completed: tasksCompleted,
          mood_recorded: moodRecorded,
          affirmations_viewed: true, // Assuming true if they're on dashboard
        }, {
          onConflict: "user_id,completion_date"
        });

      if (error) throw error;

      setShowSuccessDialog(true);
      
      toast({
        title: "Dia finalizado com leveza 🌷",
        description: "Seu progresso foi salvo. Continue florescendo!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar dia",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleFinishDay}
        disabled={isFinishing}
        className="w-full rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 transition-opacity"
        size="lg"
      >
        <CheckCircle className="w-5 h-5 mr-2" />
        {isFinishing ? "Finalizando..." : "Finalizar Dia"}
      </Button>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5 max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-light">
              Dia finalizado com leveza 🌷
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              Parabéns! Você completou {tasksCompleted} de {totalTasks} tarefas hoje.
              <br />
              <br />
              Cada pequeno passo conta na sua jornada de crescimento pessoal.
              Continue assim! 🌸
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full rounded-full"
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FinishDayButton;
