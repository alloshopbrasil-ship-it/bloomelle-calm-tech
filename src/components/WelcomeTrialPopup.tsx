import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Heart, Star, Check } from "lucide-react";

const translations = {
  "pt-BR": {
    title: "Bem-vinda ao Bloomelle! 🌸",
    subtitle: "Você ganhou 7 dias grátis de Premium",
    description: "Aproveite todos os recursos exclusivos para transformar sua jornada de autocuidado.",
    features: [
      "Afirmações ilimitadas",
      "Diário emocional completo",
      "Metas e acompanhamento",
      "Comunidade exclusiva",
      "Grupos privados",
    ],
    cta: "Começar minha jornada",
    skip: "Explorar depois",
  },
  en: {
    title: "Welcome to Bloomelle! 🌸",
    subtitle: "You got 7 free days of Premium",
    description: "Enjoy all the exclusive features to transform your self-care journey.",
    features: [
      "Unlimited affirmations",
      "Complete emotional journal",
      "Goals and tracking",
      "Exclusive community",
      "Private groups",
    ],
    cta: "Start my journey",
    skip: "Explore later",
  },
  es: {
    title: "¡Bienvenida a Bloomelle! 🌸",
    subtitle: "Tienes 7 días gratis de Premium",
    description: "Disfruta de todas las funciones exclusivas para transformar tu viaje de autocuidado.",
    features: [
      "Afirmaciones ilimitadas",
      "Diario emocional completo",
      "Metas y seguimiento",
      "Comunidad exclusiva",
      "Grupos privados",
    ],
    cta: "Comenzar mi viaje",
    skip: "Explorar después",
  },
  fr: {
    title: "Bienvenue sur Bloomelle ! 🌸",
    subtitle: "Vous avez 7 jours Premium gratuits",
    description: "Profitez de toutes les fonctionnalités exclusives pour transformer votre parcours bien-être.",
    features: [
      "Affirmations illimitées",
      "Journal émotionnel complet",
      "Objectifs et suivi",
      "Communauté exclusive",
      "Groupes privés",
    ],
    cta: "Commencer mon parcours",
    skip: "Explorer plus tard",
  },
  de: {
    title: "Willkommen bei Bloomelle! 🌸",
    subtitle: "Sie haben 7 kostenlose Premium-Tage",
    description: "Genießen Sie alle exklusiven Funktionen, um Ihre Selbstfürsorge-Reise zu transformieren.",
    features: [
      "Unbegrenzte Affirmationen",
      "Vollständiges emotionales Tagebuch",
      "Ziele und Tracking",
      "Exklusive Community",
      "Private Gruppen",
    ],
    cta: "Meine Reise beginnen",
    skip: "Später erkunden",
  },
};

interface WelcomeTrialPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeTrialPopup({ open, onOpenChange }: WelcomeTrialPopupProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] || translations["pt-BR"];

  const handleStart = () => {
    onOpenChange(false);
    navigate("/dashboard");
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-b from-background to-primary/5">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-2">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-semibold text-center">
            {t.title}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-lg font-medium text-primary">{t.subtitle}</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <DialogDescription className="text-center text-muted-foreground">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {t.features.map((feature, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10"
            >
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            <Heart className="h-4 w-4 mr-2" />
            {t.cta}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            {t.skip}
          </Button>
        </div>

        <div className="flex justify-center gap-1 pt-2">
          {[...Array(3)].map((_, i) => (
            <Star 
              key={i} 
              className="h-3 w-3 text-primary/40 fill-primary/40" 
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
