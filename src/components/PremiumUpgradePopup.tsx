import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PremiumUpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumUpgradePopup = ({ isOpen, onClose }: PremiumUpgradePopupProps) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
  const { t } = useLanguage();

  // Prices in Euros
  const monthlyPrice = 14.90;
  const annualPrice = 129.90; // 30% discount (was €178.80 annually)
  const discountPercentage = 30;

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2).replace(".", ",")}`;
  };

  const plans = [
    {
      name: t("premium.free.name"),
      description: t("premium.free.desc"),
      price: "€0",
      period: `/${t("premium.monthly").toLowerCase()}`,
      features: [
        "Diário emocional básico (5/mês)",
        "3 afirmações positivas por dia",
        "5 mensagens/dia com a Bloomia 🌸",
        "Comunidade básica (5 posts/dia)",
        "3 metas simples de autocuidado",
      ],
      cta: t("premium.currentPlan"),
      highlighted: false,
      icon: null
    },
    {
      name: t("premium.premium.name"),
      description: t("premium.premium.desc"),
      price: billingCycle === "annually" 
        ? formatPrice(annualPrice) 
        : formatPrice(monthlyPrice),
      period: billingCycle === "annually" 
        ? `/${t("common.year").toLowerCase()}` 
        : `/${t("common.month").toLowerCase()}`,
      features: [
        "Bloomia ilimitada — sua coach 24/7 🌸",
        "Análise emocional do diário pela IA ✨",
        "Afirmações personalizadas ilimitadas",
        "Metas com sugestões inteligentes da IA",
        "Desafios de autoestima exclusivos 💪",
        "Estatísticas de evolução emocional 📊",
        "Comunidade completa — posts ilimitados",
        "Conteúdos e recursos exclusivos 🌿",
      ],
      cta: t("premium.startPremium"),
      highlighted: true,
      icon: Crown
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-muted/30 via-background to-accent/5 border-border/50">
        {/* Decorative glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl md:text-3xl font-light mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {t("premium.title")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t("premium.subtitle")}
            </DialogDescription>
          </DialogHeader>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center bg-muted/50 rounded-full p-1">
              <button
                onClick={() => setBillingCycle("annually")}
                className={`px-4 py-2 text-sm rounded-full transition-all ${
                  billingCycle === "annually"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("premium.annually")} <span className="text-xs ml-1 opacity-80">{discountPercentage}% {t("premium.off")}</span>
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-sm rounded-full transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("premium.monthly")}
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-3xl p-6 transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-primary/10 to-secondary/5 border-2 border-primary shadow-bloom scale-[1.02]"
                    : "bg-card border border-border hover:border-primary/30 hover:shadow-soft"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs px-4 py-1 rounded-full font-medium">
                      {t("premium.recommended")}
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    {plan.icon && <plan.icon className="w-5 h-5 text-primary" />}
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  {plan.highlighted && billingCycle === "annually" && (
                    <p className="text-xs text-primary mt-1">
                      {t("premium.savingsNote") || `≈ €${(annualPrice / 12).toFixed(2).replace(".", ",")}/${t("common.month").toLowerCase()}`}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    {t("premium.included")}
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild={plan.highlighted}
                  variant={plan.highlighted ? "default" : "outline"}
                  className={`w-full rounded-full transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-soft hover:shadow-bloom"
                      : ""
                  }`}
                  disabled={!plan.highlighted}
                >
                  {!plan.highlighted ? (
                    <span>{plan.cta}</span>
                  ) : (
                    <Link to="/plans">{plan.cta}</Link>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
              {t("premium.maybeLater")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
