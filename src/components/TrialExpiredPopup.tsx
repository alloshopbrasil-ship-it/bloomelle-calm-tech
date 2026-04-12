import { useLanguage } from "@/contexts/LanguageContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TrialExpiredPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const translations = {
  "pt-BR": {
    title: "Seu período de teste terminou 💫",
    description: "Seus 7 dias de acesso Premium chegaram ao fim. Continue sua jornada de autocuidado com todos os recursos desbloqueados.",
    benefits: [
      "Metas ilimitadas para seu crescimento",
      "Diário sem limites mensais",
      "Acesso a grupos privados",
      "Posts ilimitados na comunidade",
    ],
    upgrade: "Continuar com Premium",
    later: "Continuar no plano gratuito",
  },
  en: {
    title: "Your trial period has ended 💫",
    description: "Your 7 days of Premium access have come to an end. Continue your self-care journey with all features unlocked.",
    benefits: [
      "Unlimited goals for your growth",
      "Unlimited monthly journal entries",
      "Access to private groups",
      "Unlimited community posts",
    ],
    upgrade: "Continue with Premium",
    later: "Continue on free plan",
  },
  es: {
    title: "Tu período de prueba ha terminado 💫",
    description: "Tus 7 días de acceso Premium han llegado a su fin. Continúa tu viaje de autocuidado con todas las funciones desbloqueadas.",
    benefits: [
      "Metas ilimitadas para tu crecimiento",
      "Diario sin límites mensuales",
      "Acceso a grupos privados",
      "Posts ilimitados en la comunidad",
    ],
    upgrade: "Continuar con Premium",
    later: "Continuar en plan gratuito",
  },
  fr: {
    title: "Votre période d'essai est terminée 💫",
    description: "Vos 7 jours d'accès Premium sont terminés. Continuez votre parcours de bien-être avec toutes les fonctionnalités débloquées.",
    benefits: [
      "Objectifs illimités pour votre croissance",
      "Journal sans limites mensuelles",
      "Accès aux groupes privés",
      "Publications illimitées dans la communauté",
    ],
    upgrade: "Continuer avec Premium",
    later: "Continuer avec le plan gratuit",
  },
  de: {
    title: "Ihre Testphase ist beendet 💫",
    description: "Ihre 7 Tage Premium-Zugang sind zu Ende. Setzen Sie Ihre Selbstfürsorge-Reise mit allen freigeschalteten Funktionen fort.",
    benefits: [
      "Unbegrenzte Ziele für Ihr Wachstum",
      "Tagebuch ohne monatliche Limits",
      "Zugang zu privaten Gruppen",
      "Unbegrenzte Community-Beiträge",
    ],
    upgrade: "Mit Premium fortfahren",
    later: "Mit kostenlosem Plan fortfahren",
  },
};

export function TrialExpiredPopup({ open, onOpenChange }: TrialExpiredPopupProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] || translations["pt-BR"];

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/plans");
  };

  const icons = [Crown, Heart, Star, Sparkles];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl text-center">{t.title}</DialogTitle>
          <DialogDescription className="text-center">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {t.benefits.map((benefit, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            {t.upgrade}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground">
            {t.later}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
