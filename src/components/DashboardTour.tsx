import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Target, BookOpen, Home, ChevronLeft, ChevronRight, Heart, Users, BarChart3, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tourSteps = [
  {
    icon: Home,
    title: "Bem-vinda à Bloomelle! 🌸",
    description: "Este é o seu espaço seguro de autocuidado. Vamos fazer um tour rápido pelas principais funcionalidades.",
    highlight: "Seu jardim de bem-estar"
  },
  {
    icon: Heart,
    title: "Registro de Humor",
    description: "Acompanhe como você se sente todos os dias. Pequenos registros que revelam grandes padrões.",
    highlight: "No dashboard principal"
  },
  {
    icon: Calendar,
    title: "Calendário Pessoal",
    description: "Agende compromissos consigo mesma. Momentos de autocuidado merecem espaço na sua agenda.",
    highlight: "Menu lateral"
  },
  {
    icon: Target,
    title: "Bloom Goals",
    description: "Defina metas gentis e acompanhe seu progresso. Cada pequeno passo é uma vitória! 🌺",
    highlight: "Menu lateral"
  },
  {
    icon: BookOpen,
    title: "Diário",
    description: "Escreva livremente. Suas palavras são sementes de autoconhecimento.",
    highlight: "Menu lateral"
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Conecte-se com outras mulheres em um espaço seguro e acolhedor. Você não está sozinha.",
    highlight: "Menu lateral"
  },
  {
    icon: BarChart3,
    title: "Progresso Emocional",
    description: "Veja gráficos do seu bem-estar e celebre sua evolução ao longo do tempo.",
    highlight: "Menu lateral"
  },
  {
    icon: Sparkles,
    title: "Afirmações Diárias",
    description: "Palavras que nutrem sua alma. Receba afirmações personalizadas todos os dias.",
    highlight: "Menu lateral"
  }
];

export const DashboardTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const tourDone = localStorage.getItem("dashboardTourDone");
    const hasSeenInstructions = localStorage.getItem("hasSeenInstructions");
    const welcomeShown = localStorage.getItem("welcomePopupShown");
    
    if (hasSeenInstructions && welcomeShown && !tourDone) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("dashboardTourDone", "true");
    setIsOpen(false);
  };

  const CurrentIcon = tourSteps[currentStep].icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg border-none bg-gradient-to-br from-[#FFF9F9] via-[#F8E8EE] to-[#EBDCFD] dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/30 backdrop-blur-xl rounded-[24px] shadow-2xl p-0 overflow-hidden">
        <div className="relative p-8">
          {/* Progress bar */}
          <div className="flex justify-center gap-1.5 mb-6">
            {tourSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep
                    ? "w-3 bg-primary/60"
                    : "w-3 bg-primary/20"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: index === currentStep ? 1 : 0.9 }}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="mb-4 flex justify-center">
                <motion.div 
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center backdrop-blur-sm"
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CurrentIcon className="w-10 h-10 text-primary" />
                </motion.div>
              </div>
              
              <span className="text-xs text-primary/80 font-medium uppercase tracking-wider">
                {tourSteps[currentStep].highlight}
              </span>
              
              <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3 mt-2">
                {tourSteps[currentStep].title}
              </h2>
              
              <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md mx-auto">
                {tourSteps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="rounded-full"
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {tourSteps.length}
            </span>

            <Button
              onClick={handleNext}
              className="rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              {isLastStep ? "✨ Começar!" : "Próximo"}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tutorial
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
