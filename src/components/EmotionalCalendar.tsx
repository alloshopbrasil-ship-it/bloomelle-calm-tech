import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Plus, Heart, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/line-chart";

type ViewMode = "today" | "week" | "month" | "year";

interface DayData {
  dia: string;
  humor: number;
  progresso: number;
}

const chartConfig = {
  humor: {
    label: "Humor",
    color: "hsl(var(--primary))",
  },
  progresso: {
    label: "Progresso",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const EmotionalCalendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentMonth, setCurrentMonth] = useState("Dezembro");
  const [currentYear, setCurrentYear] = useState(2025);
  const [weekOffset, setWeekOffset] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMood, setNewMood] = useState<string>("");
  const [newNote, setNewNote] = useState("");
  const [moodData, setMoodData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMoodData();
    }
  }, [user, viewMode, weekOffset]);

  const loadMoodData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();
    
    if (viewMode === "week") {
      // Get start of the week (Monday)
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setDate(startDate.getDate() + (weekOffset * 7));
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else if (viewMode === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const { data: moods } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true });

    if (moods && moods.length > 0) {
      // Group by day and calculate averages
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const groupedData: { [key: string]: number[] } = {};
      
      moods.forEach(mood => {
        const date = new Date(mood.created_at!);
        const dayKey = dayNames[date.getDay()];
        if (!groupedData[dayKey]) {
          groupedData[dayKey] = [];
        }
        groupedData[dayKey].push(mood.mood_value || 50);
      });

      const chartData: DayData[] = Object.entries(groupedData).map(([dia, values]) => ({
        dia,
        humor: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        progresso: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 0.9),
      }));

      setMoodData(chartData);
    } else {
      setMoodData([]);
    }
    
    setLoading(false);
  };

  const getData = () => moodData;

  const getAverage = (key: 'humor' | 'progresso') => {
    const data = getData();
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item[key], 0);
    return Math.round(sum / data.length);
  };

  const getMotivationalMessage = () => {
    if (moodData.length === 0) {
      return "🌱 Registre seu primeiro humor e comece sua jornada!";
    }
    
    const avgHumor = getAverage('humor');
    
    if (avgHumor < 50) {
      return "🌸 Como você se sentiu essa semana? Hoje talvez precise de calma.";
    } else if (avgHumor < 70) {
      return "✨ Você está equilibrada. Continue assim!";
    } else {
      return "🌷 Você está radiante! Continue florescendo!";
    }
  };

  const handlePrevious = () => {
    if (viewMode === "week") {
      setWeekOffset(prev => prev - 1);
    } else if (viewMode === "month") {
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const currentIndex = months.indexOf(currentMonth);
      if (currentIndex > 0) {
        setCurrentMonth(months[currentIndex - 1]);
      } else {
        setCurrentMonth("Dezembro");
        setCurrentYear(prev => prev - 1);
      }
    } else {
      setCurrentYear(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setWeekOffset(prev => prev + 1);
    } else if (viewMode === "month") {
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const currentIndex = months.indexOf(currentMonth);
      if (currentIndex < 11) {
        setCurrentMonth(months[currentIndex + 1]);
      } else {
        setCurrentMonth("Janeiro");
        setCurrentYear(prev => prev + 1);
      }
    } else {
      setCurrentYear(prev => prev + 1);
    }
  };

  const handleAddRecord = () => {
    setShowAddDialog(true);
  };

  const handleSaveRecord = async () => {
    if (!newMood || !user) {
      toast({
        title: "Selecione um humor",
        description: "Por favor, escolha como você está se sentindo.",
        variant: "destructive",
      });
      return;
    }

    try {
      const moodValue = {
        happy: 90,
        calm: 75,
        sad: 40,
        anxious: 45,
        grateful: 85
      }[newMood] || 50;

      const { error } = await supabase
        .from("moods")
        .insert({
          user_id: user.id,
          mood_type: newMood,
          mood_value: moodValue,
          note: newNote || null,
        });

      if (error) throw error;

      toast({
        title: "Registro adicionado! 🌸",
        description: "Seu humor foi registrado com sucesso.",
      });
      
      setShowAddDialog(false);
      setNewMood("");
      setNewNote("");
      loadMoodData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moods = [
    { emoji: "😊", label: "Feliz", value: "happy" },
    { emoji: "😌", label: "Calma", value: "calm" },
    { emoji: "😔", label: "Triste", value: "sad" },
    { emoji: "😰", label: "Ansiosa", value: "anxious" },
    { emoji: "🥰", label: "Grata", value: "grateful" },
  ];

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/40 shadow-[var(--shadow-card)] animate-fade-in">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-light text-foreground">
                MOODMAP
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                {getMotivationalMessage()}
              </CardDescription>
            </div>

            <Button
              size="sm"
              className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
              variant="outline"
              onClick={handleAddRecord}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar registro
            </Button>
          </div>

          {/* Filter Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30">
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="year">Ano</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/50"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium px-4 py-1.5 rounded-full bg-muted/40">
              {viewMode === "week" && `Esta semana ${weekOffset !== 0 ? `(${weekOffset > 0 ? '+' : ''}${weekOffset})` : ''}`}
              {viewMode === "month" && `${currentMonth} ${currentYear}`}
              {viewMode === "year" && currentYear}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/50"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {loading ? (
          <div className="h-[250px] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        ) : moodData.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Sem registros ainda</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Registre seu primeiro humor para começar a visualizar seu progresso emocional.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart
              data={getData()}
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" />
              <XAxis
                dataKey="dia"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{name}:</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                    )}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="humor"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{
                  fill: "hsl(var(--primary))",
                  r: 5,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 7,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 3,
                }}
              />
              <Line
                type="monotone"
                dataKey="progresso"
                stroke="hsl(var(--accent))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: "hsl(var(--accent))",
                  r: 4,
                  strokeWidth: 2,
                  stroke: "hsl(var(--background))",
                }}
                activeDot={{
                  r: 6,
                  fill: "hsl(var(--accent))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/40">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Humor médio</div>
            <Badge variant="outline" className="text-primary bg-primary/10 border-primary/20">
              {getAverage('humor')}%
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Progresso médio</div>
            <Badge variant="outline" className="text-accent-foreground bg-accent/30 border-accent/40">
              {getAverage('progresso')}%
            </Badge>
          </div>
        </div>
      </CardContent>

      {/* Add Record Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-center mb-2">
              Como você está se sentindo? 💕
            </DialogTitle>
            <DialogDescription className="text-center">
              Registre seu humor e adicione uma nota opcional
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Mood Selector */}
            <div>
              <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Selecione seu humor
              </Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setNewMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      newMood === m.value
                        ? "border-primary bg-primary/10 shadow-soft"
                        : "border-border/40 bg-background/50 hover:border-primary/50"
                    }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <Label className="text-sm font-medium mb-2">
                Nota (opcional)
              </Label>
              <Textarea
                placeholder="Como foi seu dia? O que você sentiu?"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-full"
                onClick={handleSaveRecord}
              >
                Salvar registro 🌸
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EmotionalCalendar;
