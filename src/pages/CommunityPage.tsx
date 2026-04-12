import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, MessageCircle, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CommunityPage = () => {
  const navigate = useNavigate();

  const topics = [
    {
      icon: Heart,
      title: "Corpo",
      description: "Conversas sobre autoimagem, saúde e autocuidado físico",
      members: "520+ membros",
    },
    {
      icon: MessageCircle,
      title: "Mente",
      description: "Reflexões sobre ansiedade, paz interior e saúde mental",
      members: "680+ membros",
    },
    {
      icon: Users,
      title: "Relações",
      description: "Amizades, família, amor e conexões autênticas",
      members: "440+ membros",
    },
    {
      icon: Shield,
      title: "Carreira",
      description: "Crescimento profissional, propósito e equilíbrio",
      members: "390+ membros",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero with soft wave gradient */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-accent/10 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6 leading-tight">
            Um espaço para se <span className="text-primary">escutar</span> e ser <span className="text-primary">escutada</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            BloomSpaces é a comunidade empática da Bloomelle — sem likes, sem comparações, apenas apoio real.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="text-2xl font-light text-foreground mb-2">
            Mais de <span className="text-primary font-medium">2.000 mulheres</span> já florescem juntas
          </p>
          <p className="text-muted-foreground">
            Um espaço seguro, anônimo e moderado com cuidado
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="py-24 px-6 bg-white relative">
        <div className="absolute inset-0 bg-primary/5" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-light text-foreground mb-4">
              Espaços para todas as conversas
            </h2>
            <p className="text-lg text-muted-foreground">
              Escolha o tema que mais ressoa com o seu momento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {topics.map((topic, index) => (
              <div
                key={topic.title}
                className="bg-card border border-border rounded-3xl p-8 hover:shadow-bloom transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <topic.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-medium text-foreground mb-2">
                  {topic.title}
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {topic.description}
                </p>
                <p className="text-sm text-primary font-medium">
                  {topic.members}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <Button
              onClick={() => navigate("/signup")}
              size="lg"
              className="rounded-full shadow-soft hover:shadow-bloom transition-all duration-300"
            >
              Entrar na Comunidade
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-light text-foreground mb-4">
              Um espaço diferente
            </h2>
          </div>

          <div className="space-y-8">
            {[
              {
                title: "Sem likes ou métricas de vaidade",
                description: "Aqui não há competição. Apenas conexão genuína e apoio mútuo.",
              },
              {
                title: "Anonimato opcional",
                description: "Compartilhe com seu nome ou de forma anônima — você escolhe o seu conforto.",
              },
              {
                title: "Moderação empática",
                description: "Cada mensagem é cuidada para garantir um espaço seguro e respeitoso.",
              },
            ].map((value, index) => (
              <div
                key={value.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-2xl font-light text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommunityPage;
