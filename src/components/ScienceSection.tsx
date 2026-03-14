import { Sparkles, Brain, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ScienceSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 px-6 bg-secondary text-secondary-foreground relative overflow-hidden">
      {/* Background decorative elements - pointer-events-none to allow scrolling through */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left side - Visual elements */}
          <div className="space-y-8">
            <div className="flex items-start gap-6 animate-fade-in">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2">{t("landing.science.psychology.title")}</h3>
                <p className="text-secondary-foreground/80 text-sm leading-relaxed">
                  {t("landing.science.psychology.desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 animate-fade-in" style={{ animationDelay: "150ms" }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2">{t("landing.science.design.title")}</h3>
                <p className="text-secondary-foreground/80 text-sm leading-relaxed">
                  {t("landing.science.design.desc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2">{t("landing.science.ai.title")}</h3>
                <p className="text-secondary-foreground/80 text-sm leading-relaxed">
                  {t("landing.science.ai.desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Main message */}
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
              {t("landing.science.title1")}
              <span className="block mt-2 font-normal">
                {t("landing.science.title2")}
              </span>
              <span className="block mt-2 font-normal">
                {t("landing.science.title3")}
              </span>
            </h2>

            <p className="text-lg text-secondary-foreground/90 leading-relaxed">
              {t("landing.science.subtitle")}
            </p>

            <div className="pt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-secondary-foreground/20" />
              <span className="text-sm text-secondary-foreground/70 italic">
                {t("landing.science.tagline")}
              </span>
              <div className="h-px flex-1 bg-secondary-foreground/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScienceSection;
