import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Target, Sparkles } from "lucide-react";

interface GoalProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    progress: number;
    is_completed: boolean;
  };
  onUpdate: () => void;
}

export const GoalProgressDialog = ({ open, onOpenChange, goal, onUpdate }: GoalProgressDialogProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(goal.progress);
  const [loading, setLoading] = useState(false);

  const handleUpdateProgress = async () => {
    setLoading(true);
    try {
      const isCompleted = progress >= 100;

      const { error } = await supabase
        .from("goals")
        .update({
          progress,
          is_completed: isCompleted,
        })
        .eq("id", goal.id);

      if (error) throw error;

      toast({
        title: isCompleted ? "Meta concluída! 🎉" : "Progresso atualizado! 🌸",
        description: isCompleted
          ? "Parabéns! Você completou sua meta!"
          : `Progresso da meta: ${progress}%`,
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setProgress(100);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("goals")
        .update({
          progress: 100,
          is_completed: true,
        })
        .eq("id", goal.id);

      if (error) throw error;

      toast({
        title: "Meta concluída! 🎉",
        description: "Parabéns! Você completou sua meta!",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro ao completar meta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Atualizar Progresso
          </DialogTitle>
          <DialogDescription className="text-center">
            {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="text-center">
            <div className="text-5xl font-light text-primary mb-2">{progress}%</div>
            <p className="text-sm text-muted-foreground">Progresso atual</p>
          </div>

          <div className="px-4">
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="my-6"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              className="rounded-full"
              onClick={handleUpdateProgress}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Progresso"}
            </Button>
            
            {!goal.is_completed && progress < 100 && (
              <Button
                variant="outline"
                className="rounded-full border-primary/30 hover:bg-primary/10"
                onClick={handleComplete}
                disabled={loading}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
