import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const countries = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "FR", name: "França", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "IT", name: "Itália", flag: "🇮🇹" },
  { code: "UK", name: "Reino Unido", flag: "🇬🇧" },
  { code: "OTHER", name: "Outro", flag: "🌍" },
];

export function OriginPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");

  useEffect(() => {
    const hasSeenOrigin = localStorage.getItem("hasSeenOrigin");
    
    if (!hasSeenOrigin) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = () => {
    if (selectedCountry) {
      localStorage.setItem("hasSeenOrigin", "true");
      localStorage.setItem("userCountry", selectedCountry);
      setIsOpen(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOrigin", "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md animate-scale-in" style={{
        background: 'linear-gradient(135deg, hsl(350 100% 98%) 0%, hsl(30 60% 96%) 100%)',
        boxShadow: 'var(--shadow-bloom)',
        borderRadius: 'var(--radius)'
      }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center text-foreground">
            De onde você vem? 🌍
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Nos ajude a conhecer melhor nossa comunidade global
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-float">
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </div>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione seu país" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1"
          >
            Pular
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCountry}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
