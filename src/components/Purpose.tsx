import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";

const Purpose = () => {
  const { t } = useLanguage();

  const days = [
    { key: "landing.purpose.monday", en: "Monday" },
    { key: "landing.purpose.tuesday", en: "Tuesday" },
    { key: "landing.purpose.wednesday", en: "Wednesday" },
    { key: "landing.purpose.thursday", en: "Thursday" },
    { key: "landing.purpose.friday", en: "Friday" },
    { key: "landing.purpose.saturday", en: "Saturday" },
    { key: "landing.purpose.sunday", en: "Sunday" },
  ];

  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left" distance={50}>
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight">
                {t("landing.purpose.title1")}
                <span className="block mt-2 text-primary font-normal">
                  {t("landing.purpose.title2")}
                </span>
              </h2>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>{t("landing.purpose.p1")}</p>
                <p>{t("landing.purpose.p2")}</p>
                <p className="text-sm border-l-2 border-primary/30 pl-6 py-4 italic">
                  "{t("landing.purpose.quote")}"
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" distance={50} delay={200}>
            <div className="relative">
              <div className="bg-card rounded-3xl p-8 shadow-bloom border border-border/50 backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      {t("landing.purpose.moodmap")}
                    </h3>
                    <span className="text-xs text-muted-foreground">{t("landing.purpose.thisWeek")}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {days.map((day, i) => (
                      <div key={day.key} className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-20">{t(day.key)}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-accent" : "bg-secondary"
                            }`}
                            style={{ 
                              width: `${Math.random() * 40 + 40}%`,
                              transitionDelay: `${i * 100}ms`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 text-sm text-muted-foreground">
                    <p className="leading-relaxed">
                      {t("landing.purpose.suggestion")} <span className="text-primary font-medium">{t("landing.purpose.bloomRitual")}</span>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default Purpose;
