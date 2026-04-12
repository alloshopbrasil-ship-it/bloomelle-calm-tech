import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const HowItWorks = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
              {t("landing.howItWorks.title1")}
              <span className="block mt-2 text-primary font-normal">
                {t("landing.howItWorks.title2")}
              </span>
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              <p>{t("landing.howItWorks.p1")}</p>
              <p>{t("landing.howItWorks.p2")}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-6 lg:hidden px-4">
              <Button 
                size="lg"
                onClick={() => navigate("/signup")}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-5 text-sm rounded-full shadow-bloom transition-all duration-300 w-full sm:w-auto whitespace-normal text-center leading-tight"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{t("landing.hero.cta")}</span>
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => scrollToSection("features")}
                className="px-5 py-5 text-sm rounded-full border-2 hover:bg-muted/50 transition-all duration-300 w-full sm:w-auto whitespace-normal text-center leading-tight"
              >
                {t("landing.hero.ctaSecondary")}
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
