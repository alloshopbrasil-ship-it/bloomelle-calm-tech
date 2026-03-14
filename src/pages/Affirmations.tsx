import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Copy, Check, RefreshCw, Crown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useFavoriteAffirmations } from "@/hooks/useFavoriteAffirmations";
import { ToolWelcomePopup } from "@/components/ToolWelcomePopup";
import { useToolWelcome } from "@/hooks/usePopupManager";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";

const allAffirmations = [
  { id: 1, text: "Eu sou suficiente, exatamente como sou.", category: "Autoestima" },
  { id: 2, text: "Meu valor não depende da aprovação dos outros.", category: "Autoaceitação" },
  { id: 3, text: "Eu mereço amor, respeito e cuidado.", category: "Amor-próprio" },
  { id: 4, text: "Minhas emoções são válidas e merecem ser ouvidas.", category: "Validação" },
  { id: 5, text: "Eu escolho me tratar com gentileza hoje.", category: "Autocuidado" },
  { id: 6, text: "Sou capaz de transformar desafios em crescimento.", category: "Resiliência" },
  { id: 7, text: "Minha jornada é única e valiosa.", category: "Propósito" },
  { id: 8, text: "Eu honro meus limites e celebro meu progresso.", category: "Limites" },
  { id: 9, text: "Sou digna de descanso e renovação.", category: "Descanso" },
  { id: 10, text: "Eu mereço tudo de bom que está por vir.", category: "Abundância" },
  { id: 11, text: "Confio no tempo divino da minha vida.", category: "Fé" },
  { id: 12, text: "Sou forte, resiliente e corajosa.", category: "Força" },
  { id: 13, text: "Eu me permito crescer no meu próprio ritmo.", category: "Paciência" },
  { id: 14, text: "Minha energia é valiosa e eu a protejo.", category: "Energia" },
  { id: 15, text: "Eu acolho minhas emoções com compaixão.", category: "Compaixão" },
  { id: 16, text: "Sou a protagonista da minha história.", category: "Empoderamento" },
  { id: 17, text: "Eu celebro minhas pequenas vitórias.", category: "Celebração" },
  { id: 18, text: "Minha intuição me guia com sabedoria.", category: "Intuição" },
];

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000;

const Affirmations = () => {
  const { toast } = useToast();
  const { toggleFavorite: toggleFavoriteDB, isFavorite } = useFavoriteAffirmations();
  const { isOpen: showToolWelcome, closeToolWelcome } = useToolWelcome("affirmations");
  const { isPremium, canViewMoreAffirmations, remainingAffirmations, incrementAffirmationView } = usePlanLimits();
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [affirmations, setAffirmations] = useState<typeof allAffirmations>([]);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const generateNewAffirmations = useCallback(() => {
    const shuffled = [...allAffirmations].sort(() => Math.random() - 0.5);
    const maxCards = isPremium ? 9 : 3;
    const selected = shuffled.slice(0, maxCards);
    setAffirmations(selected);
    setLastRefresh(Date.now());
    localStorage.setItem("lastAffirmationRefresh", Date.now().toString());
    localStorage.setItem("currentAffirmations", JSON.stringify(selected.map(a => a.id)));
  }, [isPremium]);

  useEffect(() => {
    const savedLastRefresh = localStorage.getItem("lastAffirmationRefresh");
    const savedAffirmations = localStorage.getItem("currentAffirmations");
    const now = Date.now();

    if (savedLastRefresh && savedAffirmations) {
      const lastRefreshTime = parseInt(savedLastRefresh);
      const timeSinceRefresh = now - lastRefreshTime;

      if (timeSinceRefresh < REFRESH_INTERVAL) {
        const savedIds = JSON.parse(savedAffirmations) as number[];
        const restoredAffirmations = savedIds
          .map(id => allAffirmations.find(a => a.id === id))
          .filter(Boolean) as typeof allAffirmations;
        setAffirmations(restoredAffirmations);
        setLastRefresh(lastRefreshTime);
        return;
      }
    }
    generateNewAffirmations();
  }, [generateNewAffirmations]);

  const copyAffirmation = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = async (id: number) => {
    const isCurrentlyFavorite = isFavorite(id);
    const success = await toggleFavoriteDB(id);
    if (success) {
      toast({
        title: isCurrentlyFavorite ? "Removida dos favoritos" : "Adicionada aos favoritos! 💖",
        description: "Suas afirmações favoritas estão salvas na sua conta.",
      });
    }
  };

  const handleGenerateNew = () => {
    if (!isPremium && !canViewMoreAffirmations) {
      setShowUpgrade(true);
      return;
    }
    setIsGenerating(true);
    if (!isPremium) incrementAffirmationView();
    setTimeout(() => {
      generateNewAffirmations();
      setIsGenerating(false);
      toast({ title: "Novas afirmações geradas! ✨", description: "Afirmações renovadas para você." });
    }, 500);
  };

  const getTimeUntilNextRefresh = () => {
    const timeSinceRefresh = Date.now() - lastRefresh;
    const timeRemaining = REFRESH_INTERVAL - timeSinceRefresh;
    if (timeRemaining <= 0) return "Disponível agora";
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}min`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Bom dia", emoji: "🌸" };
    if (hour < 18) return { text: "Boa tarde", emoji: "💫" };
    return { text: "Boa noite", emoji: "🌙" };
  };

  const greeting = getGreeting();
  const dailyAffirmation = affirmations.length > 0 ? affirmations[0] : null;

  return (
    <>
      <PremiumUpgradePopup isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
      <ToolWelcomePopup 
        isOpen={showToolWelcome} 
        onClose={closeToolWelcome} 
        toolName="affirmations"
        toolIcon={<Sparkles className="h-8 w-8 text-primary" />}
      />
      <DashboardLayout title="Afirmações" maxWidth="max-w-5xl" className="bg-gradient-to-b from-background via-primary/5 to-accent/10">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-light text-foreground mb-2">{greeting.text} {greeting.emoji}</h2>
          <p className="text-muted-foreground text-base md:text-lg mb-6">Palavras que nutrem sua alma e fortalecem sua confiança.</p>
          <div className="flex flex-col items-center gap-2">
            <Button size="lg" className="rounded-full px-8 shadow-soft" onClick={handleGenerateNew} disabled={isGenerating}>
              {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Gerar novas afirmações ✨
            </Button>
            <p className="text-xs text-muted-foreground">Próxima atualização automática: {getTimeUntilNextRefresh()}</p>
            {!isPremium && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {remainingAffirmations > 0 
                  ? `${remainingAffirmations} renovação${remainingAffirmations > 1 ? "ões" : ""} restante${remainingAffirmations > 1 ? "s" : ""} hoje`
                  : <span className="text-primary cursor-pointer flex items-center gap-1" onClick={() => setShowUpgrade(true)}><Crown className="w-3 h-3" /> Desbloqueie afirmações ilimitadas</span>
                }
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affirmations.map((affirmation, index) => (
            <Card key={affirmation.id} className="rounded-2xl border-border/40 bg-gradient-to-br from-card to-primary/5 hover:shadow-bloom transition-all duration-500 hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <CardContent className="p-4 md:p-6">
                <div className="mb-3"><span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{affirmation.category}</span></div>
                <p className="text-base md:text-lg leading-relaxed text-foreground mb-4 min-h-[60px] md:min-h-[80px]">"{affirmation.text}"</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(affirmation.id)} className={isFavorite(affirmation.id) ? "text-primary" : ""}>
                    <Heart className={`w-4 h-4 ${isFavorite(affirmation.id) ? "fill-primary" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => copyAffirmation(affirmation.text, affirmation.id)}>
                    {copiedId === affirmation.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dailyAffirmation && (
          <Card className="mt-8 rounded-2xl border-border/40 bg-gradient-to-br from-accent/10 to-primary/10 animate-fade-in">
            <CardContent className="p-6 md:p-8 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-xl md:text-2xl font-light text-foreground mb-3">Afirmação do Dia</h3>
              <p className="text-lg md:text-xl leading-relaxed text-foreground/90 max-w-2xl mx-auto">"{dailyAffirmation.text}" 🌸</p>
            </CardContent>
          </Card>
        )}
      </DashboardLayout>
    </>
  );
};

export default Affirmations;
