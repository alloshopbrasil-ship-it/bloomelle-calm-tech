import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import EmotionalCalendar from "@/components/EmotionalCalendar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, Calendar, Target, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareAchievementDialog } from "@/components/ShareAchievementDialog";

interface MoodData {
  date: string;
  value: number;
  label: string;
}

interface WeeklyData {
  day: string;
  value: number;
}

const EmotionalProgress = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [monthProgress, setMonthProgress] = useState(0);
  const [monthAchievements, setMonthAchievements] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MoodData[]>([]);
  const [averageMood, setAverageMood] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState({ title: "", description: "", emoji: "" });

  useEffect(() => {
    if (user) {
      loadStats();
      loadChartData();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: moods } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", firstDay.toISOString())
      .lte("created_at", lastDay.toISOString());

    if (moods && moods.length > 0) {
      const uniqueDays = new Set(moods.map(m => new Date(m.created_at!).toDateString()));
      setStreak(uniqueDays.size);
      
      const daysInMonth = lastDay.getDate();
      const progressPercent = Math.round((uniqueDays.size / daysInMonth) * 100);
      setMonthProgress(progressPercent);
      
      const positiveMoods = moods.filter(m => (m.mood_value || 0) >= 70);
      setMonthAchievements(positiveMoods.length);

      const avgMood = moods.reduce((acc, m) => acc + (m.mood_value || 50), 0) / moods.length;
      setAverageMood(Math.round(avgMood));
    }
  };

  const loadChartData = async () => {
    if (!user) return;

    const thirtyDaysAgo = subDays(new Date(), 30);
    
    const { data: moods } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    if (moods && moods.length > 0) {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      
      const weekly = weekDays.map((day, index) => {
        const dayMoods = moods.filter(m => {
          const moodDate = new Date(m.created_at!);
          return moodDate.getDay() === (index + 1) % 7;
        });
        const avgValue = dayMoods.length > 0 
          ? dayMoods.reduce((acc, m) => acc + (m.mood_value || 50), 0) / dayMoods.length 
          : 0;
        return { day, value: Math.round(avgValue) };
      });
      setWeeklyData(weekly);

      const monthly = moods.map(m => ({
        date: format(new Date(m.created_at!), "dd/MM", { locale: ptBR }),
        value: m.mood_value || 50,
        label: m.mood_type
      }));
      setMonthlyData(monthly);
    }
  };

  const getMoodEmoji = (value: number) => {
    if (value >= 80) return "😊";
    if (value >= 60) return "🙂";
    if (value >= 40) return "😐";
    if (value >= 20) return "😔";
    return "😢";
  };

  const handleShareAchievement = (title: string, description: string, emoji: string) => {
    setSelectedAchievement({ title, description, emoji });
    setShowShareDialog(true);
  };

  return (
    <DashboardLayout title="Progresso Emocional">
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <h2 className="text-2xl md:text-4xl font-light text-foreground mb-2">
          Sua jornada de bem-estar 🌸
        </h2>
        <p className="text-muted-foreground text-sm md:text-lg">
          Acompanhe seu crescimento emocional e celebre suas conquistas
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-fade-in">
          <Card className="rounded-2xl border-border/40">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">🔥</div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-1">{streak}</h3>
              <p className="text-xs text-muted-foreground">Dias de sequência</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-border/40">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">📊</div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-1">{monthProgress}%</h3>
              <p className="text-xs text-muted-foreground">Progresso do mês</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-border/40">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">{getMoodEmoji(averageMood)}</div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-1">{averageMood}%</h3>
              <p className="text-xs text-muted-foreground">Humor médio</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-border/40">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="text-2xl md:text-3xl mb-2">💕</div>
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-1">{monthAchievements}</h3>
              <p className="text-xs text-muted-foreground">Dias positivos</p>
              {monthAchievements > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => handleShareAchievement(
                    `${monthAchievements} dias positivos`,
                    "Conquistei dias de bem-estar emocional este mês!",
                    "💕"
                  )}
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Compartilhar
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="weekly" className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <TabsList className="mb-4 w-full md:w-auto">
            <TabsTrigger value="weekly" className="rounded-full flex-1 md:flex-none text-xs md:text-sm">Semanal</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-full flex-1 md:flex-none text-xs md:text-sm">Mensal</TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-full flex-1 md:flex-none text-xs md:text-sm">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <Card className="rounded-2xl border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Humor da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px] w-full">
                  {weeklyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis domain={[0, 100]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                          formatter={(value: number) => [`${value}%`, "Humor"]}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="hsl(var(--primary))" 
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Registre seu humor para ver o gráfico
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly">
            <Card className="rounded-2xl border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px] w-full">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[0, 100]} className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px"
                          }}
                          formatter={(value: number) => [`${value}%`, "Humor"]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      Registre seu humor para ver o gráfico
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <EmotionalCalendar />
          </TabsContent>
        </Tabs>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 backdrop-blur-sm border border-border/40 rounded-2xl p-4 md:p-8 text-center animate-fade-in" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg md:text-2xl font-light text-foreground mb-3">
            {streak === 0 ? "🌱 Comece sua jornada! 🌱" : "🌷 Você está florescendo! 🌷"}
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            {streak === 0 
              ? "Registre seu primeiro humor e comece a acompanhar seu bem-estar emocional."
              : `Você está em uma sequência de ${streak} dias! Continue cuidando de si mesma.`
            }
          </p>
          {streak >= 7 && (
            <Button
              className="mt-4 rounded-full"
              onClick={() => handleShareAchievement(
                `${streak} dias de sequência!`,
                "Mantenho uma sequência incrível de autocuidado!",
                "🔥"
              )}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar conquista
            </Button>
          )}
        </div>
      </div>

      <ShareAchievementDialog 
        open={showShareDialog} 
        onOpenChange={setShowShareDialog}
        achievement={selectedAchievement}
      />
    </DashboardLayout>
  );
};

export default EmotionalProgress;
