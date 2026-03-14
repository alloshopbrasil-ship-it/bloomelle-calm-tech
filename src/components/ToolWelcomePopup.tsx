import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface ToolWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  toolIcon?: React.ReactNode;
  onShowExample?: () => void;
}

const toolTranslations: Record<string, Record<string, { title: string; description: string; cta: string; example?: string }>> = {
  journal: {
    "pt-BR": {
      title: "Bem-vinda ao Diário",
      description: "Seu espaço privado para expressar pensamentos, sonhos e emoções. Escrever ajuda a clarear a mente e processar sentimentos.",
      cta: "Começar a escrever",
      example: "Ver exemplo",
    },
    en: {
      title: "Welcome to Journal",
      description: "Your private space to express thoughts, dreams and emotions. Writing helps clear the mind and process feelings.",
      cta: "Start writing",
      example: "See example",
    },
    es: {
      title: "Bienvenida al Diario",
      description: "Tu espacio privado para expresar pensamientos, sueños y emociones. Escribir ayuda a aclarar la mente.",
      cta: "Empezar a escribir",
      example: "Ver ejemplo",
    },
    fr: {
      title: "Bienvenue dans le Journal",
      description: "Votre espace privé pour exprimer vos pensées, rêves et émotions. Écrire aide à clarifier l'esprit.",
      cta: "Commencer à écrire",
      example: "Voir exemple",
    },
    de: {
      title: "Willkommen im Tagebuch",
      description: "Dein privater Raum, um Gedanken, Träume und Emotionen auszudrücken. Schreiben hilft, den Geist zu klären.",
      cta: "Anfangen zu schreiben",
      example: "Beispiel ansehen",
    },
  },
  affirmations: {
    "pt-BR": {
      title: "Bem-vinda às Afirmações",
      description: "Palavras positivas que nutrem sua autoestima. Repita-as diariamente para transformar seus pensamentos e elevar sua energia.",
      cta: "Ver afirmações",
    },
    en: {
      title: "Welcome to Affirmations",
      description: "Positive words that nurture your self-esteem. Repeat them daily to transform your thoughts and elevate your energy.",
      cta: "View affirmations",
    },
    es: {
      title: "Bienvenida a las Afirmaciones",
      description: "Palabras positivas que nutren tu autoestima. Repítelas diariamente para transformar tus pensamientos.",
      cta: "Ver afirmaciones",
    },
    fr: {
      title: "Bienvenue dans les Affirmations",
      description: "Des mots positifs qui nourrissent votre estime de soi. Répétez-les quotidiennement.",
      cta: "Voir les affirmations",
    },
    de: {
      title: "Willkommen bei Affirmationen",
      description: "Positive Worte, die dein Selbstwertgefühl nähren. Wiederhole sie täglich.",
      cta: "Affirmationen ansehen",
    },
  },
  goals: {
    "pt-BR": {
      title: "Bem-vinda às Metas",
      description: "Transforme seus sonhos em objetivos concretos. Acompanhe seu progresso e celebre cada conquista no seu caminho.",
      cta: "Criar minha primeira meta",
    },
    en: {
      title: "Welcome to Goals",
      description: "Transform your dreams into concrete objectives. Track your progress and celebrate each achievement.",
      cta: "Create my first goal",
    },
    es: {
      title: "Bienvenida a las Metas",
      description: "Transforma tus sueños en objetivos concretos. Sigue tu progreso y celebra cada logro.",
      cta: "Crear mi primera meta",
    },
    fr: {
      title: "Bienvenue dans les Objectifs",
      description: "Transformez vos rêves en objectifs concrets. Suivez vos progrès et célébrez chaque réussite.",
      cta: "Créer mon premier objectif",
    },
    de: {
      title: "Willkommen bei Zielen",
      description: "Verwandle deine Träume in konkrete Ziele. Verfolge deinen Fortschritt und feiere jeden Erfolg.",
      cta: "Mein erstes Ziel erstellen",
    },
  },
  community: {
    "pt-BR": {
      title: "Bem-vinda à Comunidade",
      description: "Um espaço seguro para compartilhar, apoiar e ser apoiada. Juntas, florescemos mais forte.",
      cta: "Explorar a comunidade",
    },
    en: {
      title: "Welcome to Community",
      description: "A safe space to share, support and be supported. Together, we bloom stronger.",
      cta: "Explore community",
    },
    es: {
      title: "Bienvenida a la Comunidad",
      description: "Un espacio seguro para compartir, apoyar y ser apoyada. Juntas, florecemos más fuertes.",
      cta: "Explorar comunidad",
    },
    fr: {
      title: "Bienvenue dans la Communauté",
      description: "Un espace sûr pour partager, soutenir et être soutenue. Ensemble, nous fleurissons.",
      cta: "Explorer la communauté",
    },
    de: {
      title: "Willkommen in der Community",
      description: "Ein sicherer Raum zum Teilen, Unterstützen und Unterstützt werden. Zusammen blühen wir.",
      cta: "Community erkunden",
    },
  },
  practices: {
    "pt-BR": {
      title: "Bem-vinda às Práticas Diárias",
      description: "Pequenos rituais de autocuidado que transformam seu dia. Complete tarefas simples e veja seu bem-estar florescer.",
      cta: "Ver minhas práticas",
    },
    en: {
      title: "Welcome to Daily Practices",
      description: "Small self-care rituals that transform your day. Complete simple tasks and watch your well-being bloom.",
      cta: "See my practices",
    },
    es: {
      title: "Bienvenida a las Prácticas Diarias",
      description: "Pequeños rituales de autocuidado que transforman tu día. Completa tareas simples.",
      cta: "Ver mis prácticas",
    },
    fr: {
      title: "Bienvenue dans les Pratiques Quotidiennes",
      description: "De petits rituels de bien-être qui transforment votre journée.",
      cta: "Voir mes pratiques",
    },
    de: {
      title: "Willkommen bei täglichen Praktiken",
      description: "Kleine Selbstfürsorge-Rituale, die deinen Tag verwandeln.",
      cta: "Meine Praktiken ansehen",
    },
  },
  calendar: {
    "pt-BR": {
      title: "Bem-vinda ao Calendário",
      description: "Organize sua jornada de autocuidado. Visualize seus compromissos e crie uma rotina que nutre sua alma.",
      cta: "Explorar calendário",
    },
    en: {
      title: "Welcome to Calendar",
      description: "Organize your self-care journey. Visualize your commitments and create a routine that nurtures your soul.",
      cta: "Explore calendar",
    },
    es: {
      title: "Bienvenida al Calendario",
      description: "Organiza tu viaje de autocuidado. Visualiza tus compromisos y crea una rutina.",
      cta: "Explorar calendario",
    },
    fr: {
      title: "Bienvenue dans le Calendrier",
      description: "Organisez votre parcours de bien-être. Visualisez vos engagements.",
      cta: "Explorer le calendrier",
    },
    de: {
      title: "Willkommen im Kalender",
      description: "Organisiere deine Selbstfürsorge-Reise. Visualisiere deine Termine.",
      cta: "Kalender erkunden",
    },
  },
  progress: {
    "pt-BR": {
      title: "Bem-vinda ao Progresso Emocional",
      description: "Acompanhe sua evolução emocional ao longo do tempo. Cada registro é um passo na sua jornada de autoconhecimento.",
      cta: "Ver meu progresso",
    },
    en: {
      title: "Welcome to Emotional Progress",
      description: "Track your emotional evolution over time. Each record is a step in your self-discovery journey.",
      cta: "See my progress",
    },
    es: {
      title: "Bienvenida al Progreso Emocional",
      description: "Sigue tu evolución emocional. Cada registro es un paso en tu viaje de autodescubrimiento.",
      cta: "Ver mi progreso",
    },
    fr: {
      title: "Bienvenue dans le Progrès Émotionnel",
      description: "Suivez votre évolution émotionnelle. Chaque enregistrement est une étape.",
      cta: "Voir mon progrès",
    },
    de: {
      title: "Willkommen beim emotionalen Fortschritt",
      description: "Verfolge deine emotionale Entwicklung. Jede Aufzeichnung ist ein Schritt.",
      cta: "Meinen Fortschritt sehen",
    },
  },
};

export function ToolWelcomePopup({ 
  isOpen, 
  onClose, 
  toolName, 
  toolIcon,
  onShowExample 
}: ToolWelcomePopupProps) {
  const { language } = useLanguage();
  
  const translations = toolTranslations[toolName]?.[language] || 
                       toolTranslations[toolName]?.["pt-BR"] || {
                         title: `Bem-vinda`,
                         description: "Explore esta ferramenta e descubra como ela pode ajudar você.",
                         cta: "Começar",
                       };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        
        <DialogHeader className="relative text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
          >
            {toolIcon || <Sparkles className="h-8 w-8 text-primary" />}
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DialogTitle className="text-2xl font-light text-center">
              {translations.title} ✨
            </DialogTitle>
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DialogDescription className="text-center text-muted-foreground leading-relaxed">
              {translations.description}
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-3 pt-4"
        >
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            {translations.cta}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          {translations.example && onShowExample && (
            <Button 
              variant="ghost" 
              onClick={onShowExample}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <Eye className="h-4 w-4 mr-2" />
              {translations.example}
            </Button>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
