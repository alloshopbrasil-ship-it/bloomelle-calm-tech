import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

const PlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subscribed,
    planType,
    createCheckout,
    openCustomerPortal,
    isLoading,
    currency,
    pricingLoading,
    getPremiumPricing,
  } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isBrazil = currency === 'brl';

  const moneyFormatter = useMemo(() => {
    const code = currency.toUpperCase();
    const locale = isBrazil ? 'pt-BR' : undefined;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    });
  }, [currency, isBrazil]);

  const formatMoney = (amountInCents: number) => moneyFormatter.format(amountInCents / 100);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setCheckoutLoading(true);
    try {
      await createCheckout({ interval: isAnnual ? "year" : "month" });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Erro ao abrir portal. Tente novamente.");
    }
  };

  const isPremium = subscribed && planType === "premium";

  const premiumMonthly = getPremiumPricing("month");
  const premiumAnnual = getPremiumPricing("year");
  const originalAnnual = premiumMonthly.amount * 12;
  const annualSavingsCents = Math.max(0, originalAnnual - premiumAnnual.amount);
  const discountPct = originalAnnual > 0 ? Math.round((1 - premiumAnnual.amount / originalAnnual) * 100) : 0;

  const plans = [
    {
      name: "Bloomelle Free",
      monthlyPrice: formatMoney(0),
      annualPrice: formatMoney(0),
      period: isAnnual ? "/ano" : "/mês",
      description: "Ideal para começar sua jornada",
      features: [
        "Tarefas diárias de autocuidado",
        "Diário de emoções pessoal",
        "Afirmações positivas básicas",
        "Acesso limitado à comunidade",
      ],
      cta: isPremium ? "Plano atual" : "Começar grátis",
      highlighted: false,
      isCurrent: !isPremium && user,
    },
    {
      name: "Bloomelle Premium",
      monthlyPrice: formatMoney(premiumMonthly.amount),
      annualPrice: formatMoney(premiumAnnual.amount),
      originalAnnualPrice: annualSavingsCents > 0 ? formatMoney(originalAnnual) : undefined,
      annualSavings:
        isAnnual && annualSavingsCents > 0
          ? `${discountPct}% OFF - Economize ${formatMoney(annualSavingsCents)}/ano`
          : undefined,
      period: isAnnual ? "/ano" : "/mês",
      description: "Para uma transformação profunda",
      badge: isPremium ? "Seu Plano" : "Recomendado",
      features: [
        "Tudo do plano gratuito",
        "Rastreador de progresso emocional",
        "Afirmações inteligentes com IA",
        "Acesso total à comunidade",
        "Bloom Goals - metas personalizadas",
        "Recursos de foco guiado",
        "Suporte prioritário",
      ],
      cta: isPremium ? "Gerenciar assinatura" : "Assinar Premium",
      highlighted: true,
      isCurrent: isPremium,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero with gradient */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6 leading-tight">
            Escolha o seu <span className="text-primary">Plano</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            Preços acessíveis e adaptáveis aos seus objetivos.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full p-1 border border-border">
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isAnnual
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anual
              {isAnnual && (
                <span className="bg-primary-foreground/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {discountPct}% OFF
                </span>
              )}
            </button>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isAnnual
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 px-6 bg-background relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-40 left-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2 animate-fade-in ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20 shadow-bloom"
                    : "bg-card border-border shadow-soft"
                } ${plan.isCurrent ? "ring-2 ring-primary" : ""}`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${
                      plan.isCurrent 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white" 
                        : "bg-primary text-primary-foreground"
                    }`}>
                      {plan.isCurrent && <Crown className="w-3.5 h-3.5" />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-medium text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-light text-foreground">
                      {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  {isAnnual && plan.originalAnnualPrice && (
                    <p className="text-muted-foreground text-sm mt-1 line-through">
                      {plan.originalAnnualPrice}
                    </p>
                  )}
                  {isAnnual && plan.annualSavings && (
                    <p className="text-primary text-sm mt-1 font-medium">
                      {plan.annualSavings}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-4">O que inclui:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-muted-foreground text-sm leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => {
                    if (plan.highlighted) {
                      if (isPremium) {
                        handleManageSubscription();
                      } else {
                        handleSubscribe();
                      }
                    } else {
                      navigate("/signup");
                    }
                  }}
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                  className="w-full rounded-full transition-all duration-300"
                  disabled={checkoutLoading || isLoading || pricingLoading || (plan.isCurrent && !plan.highlighted)}
                >
                  {(checkoutLoading || isLoading) && plan.highlighted ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-12 animate-fade-in" style={{ animationDelay: "300ms" }}>
            Autoestima não é um destino, é um processo.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PlansPage;
