import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WelcomePopupProps {
  userName?: string;
}

export const WelcomePopup = ({ userName = "Ana" }: WelcomePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem("hasSeenInstructions");
    const lastLogin = localStorage.getItem("lastLogin");
    const shouldShow = hasSeenInstructions && (!lastLogin || isInactive(lastLogin));
    
    // Only show welcome after instructions have been seen
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const isInactive = (lastLoginDate: string) => {
    const lastDate = new Date(lastLoginDate);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 30;
  };

  const handleClose = () => {
    localStorage.setItem("lastLogin", new Date().toISOString());
    localStorage.setItem("welcomePopupShown", "true");
    setIsOpen(false);
  };

  const handleStart = () => {
    localStorage.setItem("lastLogin", new Date().toISOString());
    localStorage.setItem("welcomePopupShown", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-none bg-gradient-to-br from-[#EBDCFD] to-[#F8E8EE] backdrop-blur-xl rounded-[24px] shadow-2xl p-0 overflow-hidden">
        <div className="relative p-8 text-center">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3">
              🌸 Seja bem-vinda de volta, {userName}!
            </h2>
            
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-sm mx-auto">
              Estamos felizes por ter você aqui. Continue sua jornada de autocuidado e florescimento interior.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleStart}
                className="rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition-opacity px-6"
              >
                Começar o dia 🌷
              </Button>
              <Button 
                onClick={handleClose}
                variant="ghost"
                className="rounded-full hover:bg-white/20"
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
