import { useLanguage } from "@/contexts/LanguageContext";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns";
import ScrollReveal from "@/components/ScrollReveal";
import testimonialLaura from "@/assets/testimonial-laura.jpg";
import testimonialSofia from "@/assets/testimonial-sofia.jpg";
import testimonialAna from "@/assets/testimonial-ana.jpg";
import testimonialEmma from "@/assets/testimonial-emma.jpg";
import testimonialMaria from "@/assets/testimonial-maria.jpg";
import testimonialClara from "@/assets/testimonial-clara.jpg";
import testimonialTamara from "@/assets/testimonial-tamara.jpg";
import testimonialCarvalho from "@/assets/testimonial-carvalho.jpg";
import testimonialBorba from "@/assets/testimonial-borba.jpg";
import testimonialCourtney from "@/assets/testimonial-courtney.jpg";

const Testimonials = () => {
  const { t } = useLanguage();

  const testimonials = [
    { name: "Laura", role: "29 • França", text: t("landing.testimonials.laura"), image: testimonialLaura },
    { name: "Sofia", role: "34 • Portugal", text: t("landing.testimonials.sofia"), image: testimonialSofia },
    { name: "Ana", role: "26 • Espanha", text: t("landing.testimonials.ana"), image: testimonialTamara },
    { name: "Emma", role: "31 • Bélgica", text: t("landing.testimonials.emma"), image: testimonialCarvalho },
    { name: "Maria", role: "28 • Brasil", text: t("landing.testimonials.maria"), image: testimonialBorba },
    { name: "Clara", role: "30 • Itália", text: t("landing.testimonials.clara"), image: testimonialCourtney },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = [...testimonials.slice(4, 6), testimonials[0]];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-secondary/40 to-background relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-foreground mb-4 leading-tight">
              {t("landing.testimonials.title")}{" "}
              <span className="text-primary">🌷</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("landing.testimonials.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} scale>
          <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] max-h-[600px] overflow-hidden">
            <TestimonialsColumn testimonials={firstColumn} duration={18} />
            <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={22} />
            <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={16} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Testimonials;
