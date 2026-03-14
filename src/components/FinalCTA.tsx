import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const FinalCTA = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8 md:space-y-12 animate-fade-in">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tight leading-tight">
              {t("landing.finalCta.title1")}
              <span className="block mt-2 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent font-normal pb-2">
                {t("landing.finalCta.title2")}
              </span>
            </h2>
            
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              {t("landing.finalCta.subtitle")}
            </p>
          </div>

          <div className="pt-4 md:pt-8 flex justify-center px-4">
            <Button 
              asChild
              size="lg" 
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 md:px-12 py-5 sm:py-6 md:py-8 text-sm sm:text-lg md:text-xl rounded-full shadow-bloom transition-all duration-300 md:hover:scale-105 w-full sm:w-auto whitespace-normal text-center leading-tight"
            >
              <Link to="/signup">
                <span className="flex items-center justify-center gap-2">
                  <span>{t("landing.finalCta.cta")}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </span>
              </Link>
            </Button>
          </div>

          <div className="pt-8 md:pt-12 space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("landing.finalCta.note1")}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {t("landing.finalCta.note2")}
            </p>
          </div>

          <div className="pt-12 md:pt-16 px-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <p className="text-sm text-muted-foreground italic px-4 md:px-6">
                {t("landing.finalCta.quote")}
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;