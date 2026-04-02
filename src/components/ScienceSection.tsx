import { Sparkles, Brain, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const ScienceSection = () => {
  const { t } = useLanguage();

  const items = [
    { icon: Brain, titleKey: "landing.science.psychology.title", descKey: "landing.science.psychology.desc", bgClass: "bg-primary/20" },
    { icon: Heart, titleKey: "landing.science.design.title", descKey: "landing.science.design.desc", bgClass: "bg-accent/20" },
    { icon: Sparkles, titleKey: "landing.science.ai.title", descKey: "landing.science.ai.desc", bgClass: "bg-secondary/20" },
  ];

  return (
    <section className="py-32 px-6 bg-secondary text-secondary-foreground relative overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {items.map((item, i) => (
              <ScrollReveal key={item.titleKey} direction="left" distance={40} delay={i * 150}>
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${item.bgClass} flex items-center justify-center`}>
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-normal mb-2">{t(item.titleKey)}</h3>
                    <p className="text-secondary-foreground/80 text-sm leading-relaxed">
                      {t(item.descKey)}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="right" distance={50} delay={200}>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">
                {t("landing.science.title1")}
                <span className="block mt-2 font-normal">{t("landing.science.title2")}</span>
                <span className="block mt-2 font-normal">{t("landing.science.title3")}</span>
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
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ScienceSection;
