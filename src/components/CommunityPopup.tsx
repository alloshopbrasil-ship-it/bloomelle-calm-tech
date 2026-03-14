import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import communityImage1 from "@/assets/community-woman-1.jpg";
import communityImage2 from "@/assets/community-woman-2.jpg";
import communityImage3 from "@/assets/community-woman-3.jpg";

interface CommunityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkSeen: () => void;
}

const translations = {
  "pt-BR": {
    title: "Você não está sozinha 💬",
    description: "Na nossa comunidade, mulheres se apoiam, compartilham conquistas e encontram inspiração juntas. Cada história importa — inclusive a sua.",
    features: [
      "Compartilhe suas vitórias e desafios",
      "Receba apoio de mulheres que entendem você",
      "Encontre inspiração para sua jornada",
    ],
    cta: "Entrar na Comunidade",
    later: "Depois",
    stats: "+500 mulheres ativas",
  },
  en: {
    title: "You're not alone 💬",
    description: "In our community, women support each other, share achievements and find inspiration together. Every story matters — including yours.",
    features: [
      "Share your victories and challenges",
      "Get support from women who understand you",
      "Find inspiration for your journey",
    ],
    cta: "Join Community",
    later: "Later",
    stats: "+500 active women",
  },
  es: {
    title: "No estás sola 💬",
    description: "En nuestra comunidad, las mujeres se apoyan, comparten logros y encuentran inspiración juntas. Cada historia importa.",
    features: [
      "Comparte tus victorias y desafíos",
      "Recibe apoyo de mujeres que te entienden",
      "Encuentra inspiración para tu viaje",
    ],
    cta: "Entrar a la Comunidad",
    later: "Después",
    stats: "+500 mujeres activas",
  },
  fr: {
    title: "Vous n'êtes pas seule 💬",
    description: "Dans notre communauté, les femmes se soutiennent, partagent leurs réussites et trouvent l'inspiration ensemble.",
    features: [
      "Partagez vos victoires et défis",
      "Recevez le soutien de femmes qui vous comprennent",
      "Trouvez l'inspiration pour votre parcours",
    ],
    cta: "Rejoindre la Communauté",
    later: "Plus tard",
    stats: "+500 femmes actives",
  },
  de: {
    title: "Du bist nicht allein 💬",
    description: "In unserer Community unterstützen sich Frauen gegenseitig, teilen Erfolge und finden gemeinsam Inspiration.",
    features: [
      "Teile deine Siege und Herausforderungen",
      "Erhalte Unterstützung von Frauen, die dich verstehen",
      "Finde Inspiration für deine Reise",
    ],
    cta: "Community beitreten",
    later: "Später",
    stats: "+500 aktive Frauen",
  },
};

export function CommunityPopup({ isOpen, onClose, onMarkSeen }: CommunityPopupProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] || translations["pt-BR"];

  const handleJoin = () => {
    onMarkSeen();
    onClose();
    navigate("/dashboard/community");
  };

  const handleLater = () => {
    onMarkSeen();
    onClose();
  };

  const icons = [Heart, Users, MessageCircle];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleLater()}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-background via-background to-accent/5 overflow-hidden p-0">
        {/* Image header */}
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-accent/20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
            {[communityImage1, communityImage2, communityImage3].map((img, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.3 }}
                className="relative"
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                />
                {i === 1 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-primary">{t.stats}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <DialogHeader className="text-center space-y-3">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <DialogTitle className="text-2xl font-light">
                {t.title}
              </DialogTitle>
            </motion.div>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <DialogDescription className="text-center text-muted-foreground leading-relaxed">
                {t.description}
              </DialogDescription>
            </motion.div>
          </DialogHeader>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            {t.features.map((feature, index) => {
              const Icon = icons[index];
              return (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2 pt-2"
          >
            <Button 
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              <Users className="h-4 w-4 mr-2" />
              {t.cta}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLater}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              {t.later}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
