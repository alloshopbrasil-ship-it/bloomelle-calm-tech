import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Plans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const plans = [
    {
      nameKey: "landing.plans.free.name",
      priceKey: "landing.plans.free.price",
      periodKey: "landing.plans.free.period",
      descKey: "landing.plans.free.desc",
      features: [
        "landing.plans.free.feature1",
        "landing.plans.free.feature2",
        "landing.plans.free.feature3",
        "landing.plans.free.feature4",
      ],
      ctaKey: "landing.plans.free.cta",
      highlighted: false,
    },
    {
      nameKey: "landing.plans.premium.name",
      priceKey: "landing.plans.premium.price",
      periodKey: "landing.plans.premium.period",
      descKey: "landing.plans.premium.desc",
      badgeKey: "landing.plans.premium.badge",
      features: [
        "landing.plans.premium.feature1",
        "landing.plans.premium.feature2",
        "landing.plans.premium.feature3",
        "landing.plans.premium.feature4",
        "landing.plans.premium.feature5",
        "landing.plans.premium.feature6",
      ],
      ctaKey: "landing.plans.premium.cta",
      highlighted: true,
    },
  ];

  return (
    <section id="plans" className="py-24 bg-background relative">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
            {t("landing.plans.title1")} <span className="text-primary">{t("landing.plans.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("landing.plans.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.nameKey}
              className={`relative rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2 animate-fade-in ${
                plan.highlighted
                  ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-bloom"
                  : "bg-card border-border shadow-soft"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.badgeKey && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    {t(plan.badgeKey)}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-medium text-foreground mb-2">
                  {t(plan.nameKey)}
                </h3>
                <p className="text-muted-foreground mb-4">{t(plan.descKey)}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-foreground">
                    {t(plan.priceKey)}
                  </span>
                  <span className="text-muted-foreground">{t(plan.periodKey)}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground leading-relaxed">
                      {t(featureKey)}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                className="w-full rounded-full transition-all duration-300"
                onClick={() => navigate("/signup")}
              >
                {t(plan.ctaKey)}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "300ms" }}>
          {t("landing.plans.tagline")}
        </p>
      </div>
    </section>
  );
};

export default Plans;
