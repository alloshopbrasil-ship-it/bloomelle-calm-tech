import { Heart, MessageCircle, Sparkles, Wind } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Heart,
      titleKey: "landing.features.emotional.title",
      descKey: "landing.features.emotional.desc",
      color: "primary"
    },
    {
      icon: Wind,
      titleKey: "landing.features.daily.title",
      descKey: "landing.features.daily.desc",
      color: "secondary"
    },
    {
      icon: MessageCircle,
      titleKey: "landing.features.community.title",
      descKey: "landing.features.community.desc",
      color: "accent"
    },
    {
      icon: Sparkles,
      titleKey: "landing.features.affirmations.title",
      descKey: "landing.features.affirmations.desc",
      color: "primary"
    }
  ];

  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <ScrollReveal>
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
              {t("landing.features.title1")}
              <span className="block mt-2 text-transparent bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text font-normal">
                {t("landing.features.title2")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("landing.features.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal 
                key={feature.titleKey} 
                delay={index * 150}
                scale
              >
                <div
                  className="group relative bg-card rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-bloom hover:-translate-y-1"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${feature.color}/10 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 text-${feature.color}`} />
                  </div>

                  <h3 className="text-2xl font-normal mb-4 tracking-tight">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t(feature.descKey)}
                  </p>

                  <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-${feature.color}/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={600}>
          <div className="mt-20 text-center">
            <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto">
              {t("landing.features.quote")}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Features;
