import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, CheckCircle2, Plus, Crown, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToolWelcomePopup } from "@/components/ToolWelcomePopup";
import { useToolWelcome } from "@/hooks/usePopupManager";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const FREE_DAILY_TASK_LIMIT = 3;

const DailyTasks = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPremium } = usePlanLimits();
  const { t, language } = useLanguage();
  const { isOpen: showToolWelcome, closeToolWelcome } = useToolWelcome("practices");
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || t("dashboard.welcome");
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: t("tasks.errorLoading") || "Erro ao carregar tarefas",
          description: t("tasks.tryAgain") || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      } else {
        setTasks(data?.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          completed: task.completed || false,
        })) || []);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  const canAddTask = isPremium || tasks.length < FREE_DAILY_TASK_LIMIT;
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;

    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: newCompleted } : t
    ));

    const { error } = await supabase
      .from('daily_tasks')
      .update({ completed: newCompleted })
      .eq('id', id);

    if (error) {
      setTasks(tasks.map(t => 
        t.id === id ? { ...t, completed: !newCompleted } : t
      ));
      toast({
        title: t("tasks.errorUpdating") || "Erro ao atualizar tarefa",
        description: t("tasks.tryAgain") || "Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: t("tasks.updated") || "Tarefa atualizada! 🌸",
        description: t("tasks.everyStep") || "Cada pequeno passo importa.",
      });
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    
    setTasks(tasks.filter(t => t.id !== id));

    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      if (taskToDelete) {
        setTasks(prev => [...prev, taskToDelete]);
      }
      toast({
        title: t("tasks.errorDeleting") || "Erro ao deletar tarefa",
        description: t("tasks.tryAgain") || "Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: t("tasks.deleted") || "Tarefa removida 🌿",
        description: t("tasks.deletedSuccess") || "Tarefa deletada com sucesso.",
      });
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({
        title: "Ops! 🌸",
        description: t("tasks.addTitlePlease") || "Por favor, adicione um título para sua tarefa.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert({
        user_id: user.id,
        title: newTaskTitle,
        description: newTaskDescription || null,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: t("tasks.errorCreating") || "Erro ao criar tarefa",
        description: t("tasks.tryAgain") || "Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setTasks([...tasks, {
      id: data.id,
      title: data.title,
      description: data.description || '',
      completed: data.completed || false,
    }]);

    setNewTaskTitle("");
    setNewTaskDescription("");
    setShowCreateDialog(false);
    
    toast({
      title: t("tasks.created") || "Tarefa criada! 🌺",
      description: t("tasks.createdSuccess") || "Mais um passo na sua jornada de autocuidado.",
    });
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
    pt: "Você está florescendo hoje. Vamos cuidar de você?",
    en: "You're blooming today. Let's take care of you?",
    es: "Estás floreciendo hoy. ¿Cuidamos de ti?",
    fr: "Tu t'épanouis aujourd'hui. Prenons soin de toi?"
  };

  if (loading) {
    return (
      <DashboardLayout title={t("tasks.title")} maxWidth="max-w-4xl">
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">{t("tasks.loading")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <ToolWelcomePopup 
        isOpen={showToolWelcome} 
        onClose={closeToolWelcome} 
        toolName="practices"
        toolIcon={<Sparkles className="h-8 w-8 text-primary" />}
      />
      <DashboardLayout title={t("tasks.title")} maxWidth="max-w-4xl">
        {/* Greeting */}
        <div className="mb-6 md:mb-8 text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-light text-foreground mb-2">
            {greeting.text}, {userName} {greeting.emoji}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {subtitleTexts[language] || subtitleTexts.pt}
          </p>
          {!isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
              <Crown className="w-4 h-4" />
              <span>{tasks.length}/{FREE_DAILY_TASK_LIMIT} {t("tasks.taskCount")}</span>
            </div>
          )}
        </div>

        {/* Progress Card */}
        <Card className="mb-6 rounded-2xl border-border/40 bg-gradient-to-br from-card to-primary/5 animate-fade-in shadow-[0_8px_24px_rgba(0,0,0,0.05)]" style={{ animationDelay: "100ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium">{t("dashboard.dailyProgress")}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {tasks.length === 0 ? t("tasks.noTasks") : `${completedCount} ${t("tasks.limit")} ${tasks.length}`}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Create Task Button */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <Button 
            onClick={() => {
              if (canAddTask) {
                setShowCreateDialog(true);
              } else {
                setShowPremiumPopup(true);
              }
            }}
            className="w-full rounded-2xl h-12 md:h-14 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t("tasks.create")}
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <Card className="rounded-2xl border-border/40 bg-card animate-fade-in" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">{t("tasks.noTasks")} 🌱</h3>
                <p className="text-muted-foreground">
                  {t("tasks.addFirst")}
                </p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task, index) => (
              <Card 
                key={task.id} 
                className={`rounded-2xl border-border/40 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] animate-fade-in ${
                  task.completed ? "bg-primary/5" : "bg-card"
                }`}
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium mb-1 ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {task.completed && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Complete Day Button */}
        {tasks.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              size="lg"
              className="rounded-full px-8 shadow-soft hover:shadow-bloom transition-all duration-300"
              disabled={completedCount < tasks.length}
            >
              {completedCount === tasks.length 
                ? (t("tasks.finishDay") || "Finalizar Dia 🌸")
                : (t("tasks.completeAll") || "Complete todas as tarefas")}
            </Button>
            {completedCount === tasks.length && tasks.length > 0 && (
              <p className="mt-3 text-sm text-muted-foreground animate-fade-in">
                {t("tasks.greatJob") || "Você fez um trabalho maravilhoso hoje! 💫"}
              </p>
            )}
          </div>
        )}
      </DashboardLayout>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5 max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-light text-center mb-2">
              {t("tasks.create")} 🌸
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("tasks.addTaskDesc") || "Adicione uma nova tarefa à sua jornada de autocuidado"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t("tasks.taskTitle")}</label>
              <Input
                placeholder={t("tasks.taskTitlePlaceholder") || "Ex: Meditação matinal"}
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t("tasks.taskDescription")}</label>
              <Textarea
                placeholder={t("tasks.taskDescPlaceholder") || "Descreva sua tarefa..."}
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={createTask} className="flex-1 rounded-full">
                {t("tasks.add")}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="flex-1 rounded-full">
                {t("tasks.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumUpgradePopup 
        isOpen={showPremiumPopup} 
        onClose={() => setShowPremiumPopup(false)} 
      />
    </>
  );
};

export default DailyTasks;
