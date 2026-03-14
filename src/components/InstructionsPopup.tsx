import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Target, ChevronRight, ChevronLeft } from "lucide-react";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export function InstructionsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const lastSeenTimestamp = localStorage.getItem("instructionsLastSeen");
    const now = Date.now();

    // Show if never seen OR if more than 1 month has passed
    const shouldShow = !lastSeenTimestamp || 
      (now - parseInt(lastSeenTimestamp, 10)) > ONE_MONTH_MS;

    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: "Registre suas emoções",
      description: "Use o MoodMap para acompanhar como você se sente a cada dia. Seus padrões emocionais revelam muito sobre você."
    },
    {
      icon: <Calendar className="w-12 h-12 text-primary" />,
      title: "Complete suas tarefas diárias",
      description: "Pequenos passos diários fazem toda a diferença. Cada tarefa completa te aproxima do seu melhor eu."
    },
    {
      icon: <Target className="w-12 h-12 text-primary" />,
      title: "Acompanhe seu progresso",
      description: "Seus Bloom Goals mostram sua jornada de autoconhecimento. Celebre cada conquista no mapa de realizações!"
    }
  ];

  const handleClose = () => {
    // Save timestamp when closed
    localStorage.setItem("instructionsLastSeen", Date.now().toString());
    localStorage.setItem("hasSeenWelcome", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md animate-scale-in" style={{
        background: 'linear-gradient(135deg, hsl(350 100% 98%) 0%, hsl(270 40% 96%) 100%)',
        boxShadow: 'var(--shadow-bloom)',
        borderRadius: 'var(--radius)'
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center text-foreground">
            Como usar a Bloomelle 🌸
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-8 flex flex-col items-center text-center space-y-6">
          <div className="animate-float">
            {steps[currentStep].icon}
          </div>
          
          <div className="space-y-3 px-4">
            <h3 className="text-xl font-medium text-foreground">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {steps[currentStep].description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-primary w-6' 
                    : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? 'Começar' : 'Próximo'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
