import { Heart, Sparkles, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import SphereImageGrid, { ImageData } from "@/components/ui/image-sphere";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import sphereWoman1 from "@/assets/sphere-woman-1.jpg";
import sphereWoman2 from "@/assets/sphere-woman-2.jpg";
import sphereWoman3 from "@/assets/sphere-woman-3.jpg";
import sphereWoman4 from "@/assets/sphere-woman-4.jpg";
import sphereWoman5 from "@/assets/sphere-woman-5.jpg";
import sphereWoman6 from "@/assets/sphere-woman-6.jpg";
import sphereWoman7 from "@/assets/sphere-woman-7.jpg";
import sphereWoman8 from "@/assets/sphere-woman-8.jpg";
import sphereWoman9 from "@/assets/sphere-woman-9.jpg";
import sphereWoman10 from "@/assets/sphere-woman-10.jpg";
import sphereWoman11 from "@/assets/sphere-woman-11.jpg";
import sphereWoman12 from "@/assets/sphere-woman-12.jpg";
import sphereWoman13 from "@/assets/sphere-woman-13.jpg";
import sphereWoman14 from "@/assets/sphere-woman-14.jpg";
import communityWoman1 from "@/assets/community-woman-1.jpg";
import communityWoman2 from "@/assets/community-woman-2.jpg";
import communityWoman3 from "@/assets/community-woman-3.jpg";
import communityWoman4 from "@/assets/community-woman-4.jpg";
import communityWoman5 from "@/assets/community-woman-5.jpg";
import communityWoman6 from "@/assets/community-woman-6.jpg";
import communityWoman7 from "@/assets/community-woman-7.jpg";
import communityWoman8 from "@/assets/community-woman-8.jpg";
import communityWoman9 from "@/assets/community-woman-9.jpg";
import communityWoman10 from "@/assets/community-woman-10.jpg";

const Community = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const communityImages: ImageData[] = [
    { id: "sphere-1", src: sphereWoman1, alt: "Mulher confiante" },
    { id: "sphere-2", src: sphereWoman2, alt: "Mulher sorrindo" },
    { id: "sphere-3", src: sphereWoman3, alt: "Mulher radiante" },
    { id: "sphere-4", src: sphereWoman4, alt: "Mulher feliz" },
    { id: "sphere-5", src: sphereWoman5, alt: "Mulher serena" },
    { id: "sphere-6", src: sphereWoman6, alt: "Mulher empoderada" },
    { id: "sphere-7", src: sphereWoman7, alt: "Mulher alegre" },
    { id: "sphere-8", src: sphereWoman8, alt: "Mulher vibrante" },
    { id: "sphere-9", src: sphereWoman9, alt: "Mulher inspiradora" },
    { id: "sphere-10", src: sphereWoman10, alt: "Mulher luminosa" },
    { id: "sphere-11", src: sphereWoman11, alt: "Mulher determinada" },
    { id: "sphere-12", src: sphereWoman12, alt: "Mulher autêntica" },
    { id: "sphere-13", src: sphereWoman13, alt: "Mulher poderosa" },
    { id: "sphere-14", src: sphereWoman14, alt: "Mulher brilhante" },
    { id: "community-1", src: communityWoman1, alt: "Comunidade 1" },
    { id: "community-2", src: communityWoman2, alt: "Comunidade 2" },
    { id: "community-3", src: communityWoman3, alt: "Comunidade 3" },
    { id: "community-4", src: communityWoman4, alt: "Comunidade 4" },
    { id: "community-5", src: communityWoman5, alt: "Comunidade 5" },
    { id: "community-6", src: communityWoman6, alt: "Comunidade 6" },
    { id: "community-7", src: communityWoman7, alt: "Comunidade 7" },
    { id: "community-8", src: communityWoman8, alt: "Comunidade 8" },
    { id: "community-9", src: communityWoman9, alt: "Comunidade 9" },
    { id: "community-10", src: communityWoman10, alt: "Comunidade 10" },
  ];

  const spaces = [
    { icon: Heart, titleKey: "landing.community.body.title", descKey: "landing.community.body.desc" },
    { icon: Sparkles, titleKey: "landing.community.mind.title", descKey: "landing.community.mind.desc" },
    { icon: Users, titleKey: "landing.community.relationships.title", descKey: "landing.community.relationships.desc" },
    { icon: Briefcase, titleKey: "landing.community.career.title", descKey: "landing.community.career.desc" },
  ];

  return (
    <section id="community" className="py-24 bg-gradient-calm relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
              {t("landing.community.title1")}{" "}
              <span className="text-primary">{t("landing.community.title2")}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("landing.community.subtitle")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} scale>
          <div className="flex justify-center mb-16">
            <SphereImageGrid
              images={communityImages}
              containerSize={600}
              sphereRadius={220}
              dragSensitivity={0.8}
              momentumDecay={0.96}
              maxRotationSpeed={6}
              baseImageScale={0.18}
              hoverScale={1.4}
              perspective={1000}
              autoRotate={true}
              autoRotateSpeed={0.2}
            />
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {spaces.map((space, index) => (
            <ScrollReveal key={space.titleKey} delay={index * 100} scale>
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 hover:shadow-bloom transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <space.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-foreground mb-2">
                      {t(space.titleKey)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(space.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={400}>
          <div className="text-center">
            <Button
              size="lg"
              className="rounded-full px-8 shadow-soft hover:shadow-bloom transition-all duration-300 hover:scale-105"
              onClick={() => navigate("/signup")}
            >
              {t("landing.community.cta")}
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Community;
