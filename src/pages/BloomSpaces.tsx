import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Heart, 
  Users, 
  Shield, 
  MessageCircle, 
  Sparkles, 
  Globe,
  Lock,
  Flower2,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { AvatarCircles } from "@/components/ui/avatar-circles";

import communityWoman1 from "@/assets/community-woman-1.jpg";
import communityWoman2 from "@/assets/community-woman-2.jpg";
import communityWoman3 from "@/assets/community-woman-3.jpg";
import communityWoman4 from "@/assets/community-woman-4.jpg";
import communityWoman5 from "@/assets/community-woman-5.jpg";

const BloomSpaces = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const avatarUrls = [
    communityWoman1,
    communityWoman2,
    communityWoman3,
    communityWoman4,
    communityWoman5,
  ];

  const features = [
    {
      icon: Shield,
      title: t("bloomspaces.features.safe.title"),
      description: t("bloomspaces.features.safe.description"),
    },
    {
      icon: Users,
      title: t("bloomspaces.features.groups.title"),
      description: t("bloomspaces.features.groups.description"),
    },
    {
      icon: MessageCircle,
      title: t("bloomspaces.features.chat.title"),
      description: t("bloomspaces.features.chat.description"),
    },
    {
      icon: Lock,
      title: t("bloomspaces.features.privacy.title"),
      description: t("bloomspaces.features.privacy.description"),
    },
    {
      icon: Heart,
      title: t("bloomspaces.features.support.title"),
      description: t("bloomspaces.features.support.description"),
    },
    {
      icon: Globe,
      title: t("bloomspaces.features.global.title"),
      description: t("bloomspaces.features.global.description"),
    },
  ];

  const values = [
    {
      icon: "🌸",
      title: t("bloomspaces.values.respect.title"),
      description: t("bloomspaces.values.respect.description"),
    },
    {
      icon: "💜",
      title: t("bloomspaces.values.empathy.title"),
      description: t("bloomspaces.values.empathy.description"),
    },
    {
      icon: "🌿",
      title: t("bloomspaces.values.growth.title"),
      description: t("bloomspaces.values.growth.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Flower2 className="w-4 h-4" />
              {t("bloomspaces.badge")}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-light text-foreground mb-6 leading-tight">
              {t("bloomspaces.hero.title")}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              {t("bloomspaces.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => navigate("/signup")}
                size="lg"
                className="rounded-full px-8 group"
              >
                {t("bloomspaces.hero.cta")}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                size="lg"
                className="rounded-full px-8"
              >
                {t("bloomspaces.hero.login")}
              </Button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <AvatarCircles avatarUrls={avatarUrls} numPeople={2847} />
              <p className="text-sm text-muted-foreground">
                {t("bloomspaces.hero.members")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is BloomSpaces */}
      <section className="py-20 px-6 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">
              {t("bloomspaces.what.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("bloomspaces.what.description")}
            </p>
          </motion.div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background rounded-3xl p-8 text-center shadow-soft border border-border/30"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-medium text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
              {t("bloomspaces.features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("bloomspaces.features.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-6 border border-border/30 hover:border-primary/30 hover:shadow-elegant transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-20 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-3xl p-8 md:p-12 border border-border/30 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-light text-foreground">
                {t("bloomspaces.guidelines.title")}
              </h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                {t("bloomspaces.guidelines.intro")}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✦</span>
                  <span>{t("bloomspaces.guidelines.rule1")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✦</span>
                  <span>{t("bloomspaces.guidelines.rule2")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✦</span>
                  <span>{t("bloomspaces.guidelines.rule3")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✦</span>
                  <span>{t("bloomspaces.guidelines.rule4")}</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-6">
              {t("bloomspaces.cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("bloomspaces.cta.subtitle")}
            </p>
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full px-10 group"
            >
              {t("bloomspaces.cta.button")}
              <Heart className="ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BloomSpaces;
