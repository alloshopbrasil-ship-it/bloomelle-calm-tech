import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, Clock, Sparkles, Heart, Sun, Moon, Star, Flower2, Bird, Circle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Avatar imports
import avatarFlower from "@/assets/avatar-flower.jpg";
import avatarCat from "@/assets/avatar-cat.jpg";
import avatarFlower2 from "@/assets/avatar-flower2.jpg";
import avatarCrown from "@/assets/avatar-crown.jpg";

interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const namePreferences = [
  { id: "name", label: "Meu nome", icon: "✨" },
  { id: "nickname", label: "Apelido", icon: "💫" },
  { id: "short", label: "Nome curto", icon: "🌸" },
  { id: "other", label: "Outro", icon: "💗" },
];

const goals = [
  "Melhorar minha autoestima",
  "Desenvolver autoconfiança",
  "Criar hábitos saudáveis",
  "Praticar autocuidado diário",
  "Encontrar paz interior",
  "Crescer emocionalmente",
];

const personalizationCards = [
  {
    id: "focus",
    title: "Seu foco atual",
    icon: "🎯",
    options: ["Autoestima", "Confiança", "Paz interior", "Crescimento"],
  },
  {
    id: "emotional",
    title: "Seu estilo emocional",
    icon: "💝",
    options: ["Sensível", "Equilibrada", "Intensa", "Tranquila"],
  },
  {
    id: "goal",
    title: "Seu objetivo de autoestima",
    icon: "🌟",
    options: ["Me amar mais", "Aceitar quem sou", "Superar medos", "Brilhar"],
  },
  {
    id: "mood",
    title: "Seu mood do momento",
    icon: "🌷",
    options: ["Esperançosa", "Calma", "Motivada", "Reflexiva"],
  },
  {
    id: "content",
    title: "Tipo de conteúdo favorito",
    icon: "📖",
    options: ["Afirmações", "Meditações", "Diário", "Desafios"],
  },
  {
    id: "level",
    title: "Nível da jornada",
    icon: "🦋",
    options: ["Iniciante", "Intermediária", "Avançada", "Explorando"],
  },
  {
    id: "pace",
    title: "Seu ritmo",
    icon: "⏰",
    options: ["Devagar", "Moderado", "Intenso", "Flexível"],
  },
  {
    id: "motivation",
    title: "Sua motivação principal",
    icon: "💪",
    options: ["Bem-estar", "Felicidade", "Equilíbrio", "Transformação"],
  },
];

const avatars = [
  { id: 1, src: avatarFlower, label: "Flor" },
  { id: 2, src: avatarCat, label: "Gatinha" },
  { id: 3, src: avatarFlower2, label: "Lotus" },
  { id: 4, src: avatarCrown, label: "Coroa" },
  { id: 5, icon: Flower2, label: "Tulipa", color: "#F5B5C8" },
  { id: 6, icon: Bird, label: "Pássaro", color: "#E8C5E5" },
  { id: 7, icon: Heart, label: "Coração", color: "#F8B4B4" },
  { id: 8, icon: Star, label: "Estrela", color: "#F9E8C0" },
  { id: 9, icon: Circle, label: "Lua", color: "#C5D5E8" },
];

export const OnboardingPopup = ({ isOpen, onClose }: OnboardingPopupProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("Português (Brasil)");
  const [detectedTimezone, setDetectedTimezone] = useState("GMT-3");
  const [selectedLanguage, setSelectedLanguage] = useState("pt-BR");
  const [namePreference, setNamePreference] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [personalizations, setPersonalizations] = useState<Record<string, string>>({});
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  
  const userName = user?.user_metadata?.name || "Querida";

  useEffect(() => {
    // Auto-detect language
    const browserLang = navigator.language;
    if (browserLang.startsWith("pt")) setDetectedLanguage("Português (Brasil)");
    else if (browserLang.startsWith("en")) setDetectedLanguage("English");
    else if (browserLang.startsWith("es")) setDetectedLanguage("Español");
    else if (browserLang.startsWith("fr")) setDetectedLanguage("Français");

    // Auto-detect timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const sign = offset <= 0 ? "+" : "-";
    setDetectedTimezone(`GMT${sign}${hours}`);
  }, []);

  const handlePersonalizationSelect = (cardId: string, option: string) => {
    setPersonalizations(prev => ({ ...prev, [cardId]: option }));
  };

  const handleComplete = () => {
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("userPreferences", JSON.stringify({
      namePreference,
      goal: selectedGoal,
      personalizations,
      avatar: selectedAvatar,
      isDarkMode,
      language: selectedLanguage,
    }));
    
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    onClose();
  };

  const totalSteps = 4;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Welcome Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F8E8EE]/60 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Onboarding</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-foreground">
                ✨ Bem-vinda, {userName}! ✨
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Vamos personalizar sua experiência em poucos passos.
              </p>
            </div>

            {/* Auto Language & Timezone */}
            <div className="bg-[#F6F3EF]/80 dark:bg-card/50 rounded-[24px] p-6 space-y-4 border border-border/30">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-[#E8DCC8]/50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Idioma detectado automaticamente</p>
                  <p className="font-medium text-foreground">{detectedLanguage}</p>
                </div>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32 h-9 rounded-full border-border/50 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <SelectItem value="pt-BR">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-[#E8DCC8]/50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground text-xs">Fuso horário detectado automaticamente</p>
                  <p className="font-medium text-foreground">{detectedTimezone}</p>
                </div>
              </div>
            </div>

            {/* Basic Configuration */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Como prefere ser chamada?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {namePreferences.map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => setNamePreference(pref.id)}
                    className={`p-4 rounded-[20px] border-2 transition-all duration-300 ${
                      namePreference === pref.id
                        ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(350_60%_70%/0.2)]"
                        : "border-border/30 bg-background/50 hover:border-primary/30"
                    }`}
                  >
                    <span className="text-xl mb-1 block">{pref.icon}</span>
                    <span className="text-sm font-medium">{pref.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Objetivo principal com a plataforma
                </p>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger className="w-full h-12 rounded-full border-border/50 bg-background/50 px-5">
                    <SelectValue placeholder="Escolha seu objetivo..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 rounded-2xl">
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal} className="rounded-xl">
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light">Personalize sua jornada ✨</h2>
              <p className="text-muted-foreground text-sm">
                Selecione uma opção em cada categoria
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
              {personalizationCards.slice(0, 4).map((card) => (
                <div
                  key={card.id}
                  className="bg-[#F6F3EF]/60 dark:bg-card/50 rounded-[20px] p-4 border border-border/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{card.icon}</span>
                    <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {card.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePersonalizationSelect(card.id, option)}
                        className={`px-3 py-2 text-xs rounded-full transition-all duration-300 ${
                          personalizations[card.id] === option
                            ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(350_60%_70%/0.3)]"
                            : "bg-background/50 text-muted-foreground hover:bg-primary/10 border border-border/30"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-light">Continue personalizando ✨</h2>
              <p className="text-muted-foreground text-sm">
                Mais algumas preferências para você
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
              {personalizationCards.slice(4).map((card) => (
                <div
                  key={card.id}
                  className="bg-[#F6F3EF]/60 dark:bg-card/50 rounded-[20px] p-4 border border-border/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{card.icon}</span>
                    <h3 className="text-sm font-medium text-foreground">{card.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {card.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handlePersonalizationSelect(card.id, option)}
                        className={`px-3 py-2 text-xs rounded-full transition-all duration-300 ${
                          personalizations[card.id] === option
                            ? "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(350_60%_70%/0.3)]"
                            : "bg-background/50 text-muted-foreground hover:bg-primary/10 border border-border/30"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Avatar Selection */}
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-light mb-2">
                  Escolha um avatar que te represente hoje 💗
                </h2>
                <p className="text-muted-foreground text-sm">
                  Você pode mudar depois quando quiser
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative aspect-square rounded-[20px] overflow-hidden transition-all duration-300 ${
                      selectedAvatar === avatar.id
                        ? "ring-4 ring-primary shadow-[0_0_30px_hsl(350_60%_70%/0.4)] scale-105"
                        : "ring-2 ring-border/30 hover:ring-primary/50"
                    }`}
                  >
                    {avatar.src ? (
                      <img
                        src={avatar.src}
                        alt={avatar.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: avatar.color }}
                      >
                        {avatar.icon && <avatar.icon className="w-8 h-8 text-white/80" />}
                      </div>
                    )}
                    {selectedAvatar === avatar.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <div className="bg-[#F6F3EF]/60 dark:bg-card/50 rounded-[24px] p-5 border border-border/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode ? "bg-[#2D2640]" : "bg-[#F8E8EE]"
                  }`}>
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-[#D4AF37]" />
                    ) : (
                      <Sun className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Modo Escuro</p>
                    <p className="text-xs text-muted-foreground">
                      Lilac profundo + dourado champanhe
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>
              
              {/* Mini Preview */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className={`rounded-xl p-3 transition-all duration-500 ${
                  !isDarkMode ? "bg-[#FDF8F6] border-2 border-primary/30" : "bg-background/30"
                }`}>
                  <div className="h-2 w-12 rounded-full bg-[#E8A4B8] mb-2" />
                  <div className="h-1 w-16 rounded-full bg-[#C9C9C9]" />
                  <p className="text-[10px] mt-2 text-muted-foreground">Claro</p>
                </div>
                <div className={`rounded-xl p-3 transition-all duration-500 ${
                  isDarkMode ? "bg-[#2D2640] border-2 border-[#D4AF37]/30" : "bg-[#2D2640]/20"
                }`}>
                  <div className="h-2 w-12 rounded-full bg-[#D4AF37] mb-2" />
                  <div className="h-1 w-16 rounded-full bg-[#4A3F5C]" />
                  <p className="text-[10px] mt-2 text-muted-foreground">Escuro</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-hidden border-none bg-gradient-to-br from-[#FDF8F6] via-[#F6F3EF] to-[#F8E8EE] dark:from-[#1a1625] dark:via-[#2D2640] dark:to-[#1a1625] rounded-[28px] shadow-[0_25px_80px_-12px_hsl(350_40%_70%/0.25)] p-0">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E8DCC8]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-6 md:p-8 overflow-y-auto max-h-[85vh] scrollbar-hide">
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= step
                    ? "w-8 bg-primary shadow-[0_0_10px_hsl(350_60%_70%/0.5)]"
                    : "w-4 bg-border/50"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/20">
            {step > 0 ? (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < totalSteps - 1 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_hsl(350_60%_70%/0.3)]"
              >
                Próximo ✨
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="rounded-full px-8 py-6 text-base bg-gradient-to-r from-primary via-[#E8A4B8] to-accent text-white shadow-[0_8px_30px_hsl(350_60%_70%/0.4)] hover:shadow-[0_12px_40px_hsl(350_60%_70%/0.5)] transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Começar minha jornada ✨
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular por agora
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
