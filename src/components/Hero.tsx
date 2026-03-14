import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-bloom.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center md:opacity-40 opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-accent/10 to-background md:from-background/50 md:via-background/80 md:to-background" />
      </div>

      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/20 md:bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent/20 md:bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-secondary/20 md:bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
          <p className="text-xs md:text-sm uppercase tracking-widest text-muted-foreground font-light px-4">
            {t("landing.hero.tagline")}
          </p>

          <h1 className="text-4xl md:text-7xl lg:text-8xl font-light tracking-tight px-4">
            {t("landing.hero.headline1")}
            <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-normal pb-2">
              {t("landing.hero.headline2")}
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed px-4">
            {t("landing.hero.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-6 md:pt-8 px-4">
            <Button 
              size="lg"
              onClick={() => navigate("/signup")}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-5 md:px-8 py-5 md:py-6 text-sm md:text-lg rounded-full shadow-bloom transition-all duration-300 hover:scale-105 w-full sm:w-auto whitespace-normal text-center leading-tight"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{t("landing.hero.cta")}</span>
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </span>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection("features")}
              className="px-5 md:px-8 py-5 md:py-6 text-sm md:text-lg rounded-full border-2 hover:bg-muted/50 transition-all duration-300 w-full sm:w-auto whitespace-normal text-center leading-tight"
            >
              {t("landing.hero.ctaSecondary")}
            </Button>
          </div>

          <p className="text-xs md:text-sm text-muted-foreground pt-6 md:pt-8 font-light px-4">
            {t("landing.hero.trust")}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default Hero;