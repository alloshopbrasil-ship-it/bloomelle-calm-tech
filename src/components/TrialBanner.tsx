import { useLanguage } from "@/contexts/LanguageContext";
import { Crown, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrialBannerProps {
  daysRemaining: number;
}

const translations = {
  "pt-BR": {
    trial: "Período de teste",
    days: "dias restantes",
    day: "dia restante",
    upgrade: "Fazer upgrade",
  },
  en: {
    trial: "Trial period",
    days: "days remaining",
    day: "day remaining",
    upgrade: "Upgrade now",
  },
  es: {
    trial: "Período de prueba",
    days: "días restantes",
    day: "día restante",
    upgrade: "Hacer upgrade",
  },
  fr: {
    trial: "Période d'essai",
    days: "jours restants",
    day: "jour restant",
    upgrade: "Mettre à niveau",
  },
  de: {
    trial: "Testphase",
    days: "Tage verbleibend",
    day: "Tag verbleibend",
    upgrade: "Jetzt upgraden",
  },
};

export function TrialBanner({ daysRemaining }: TrialBannerProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] || translations["pt-BR"];

  const isUrgent = daysRemaining <= 2;

  return (
    <div 
      className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
        isUrgent 
          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30" 
          : "bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
      }`}
      onClick={() => navigate("/plans")}
    >
      <div className="flex items-center gap-2">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isUrgent ? "bg-orange-500/20" : "bg-primary/20"
        }`}>
          {isUrgent ? (
            <Clock className={`h-4 w-4 ${isUrgent ? "text-orange-500" : "text-primary"}`} />
          ) : (
            <Crown className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">{t.trial}</span>
          <span className={`text-sm font-semibold ${isUrgent ? "text-orange-500" : "text-foreground"}`}>
            {daysRemaining} {daysRemaining === 1 ? t.day : t.days}
          </span>
        </div>
      </div>
      <span className={`text-xs font-medium ${isUrgent ? "text-orange-500" : "text-primary"}`}>
        {t.upgrade} →
      </span>
    </div>
  );
}
