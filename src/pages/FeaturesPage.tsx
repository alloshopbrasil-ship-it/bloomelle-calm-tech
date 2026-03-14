import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Sparkles, Users, Flower2 } from "lucide-react";

const FeaturesPage = () => {
  const features = [
    {
      icon: Heart,
      title: "Tarefas Diárias",
      subtitle: "Desafios leves de autocuidado",
      description: "Pequenas ações diárias que estimulam o autocuidado, a gratidão e o foco positivo. Cada tarefa foi pensada para ser leve, acessível e transformadora no seu próprio ritmo.",
      benefits: [
        "Desafios personalizados ao seu momento",
        "Foco em autocuidado genuíno",
        "Celebração de pequenas vitórias",
        "Construção de hábitos sustentáveis",
      ],
    },
    {
      icon: Sparkles,
      title: "Rastreador de Progresso",
      subtitle: "Visualize sua evolução emocional",
      description: "Acompanhe sua jornada de crescimento pessoal e autoestima. O rastreador oferece uma visão clara da sua evolução, ajudando você a reconhecer padrões e celebrar conquistas.",
      benefits: [
        "Gráficos de evolução emocional",
        "Identificação de padrões de bem-estar",
        "Relatórios personalizados",
        "Celebração de marcos importantes",
      ],
    },
    {
      icon: Users,
      title: "Comunidade Feminina",
      subtitle: "Espaço seguro para conexão",
      description: "Um ambiente acolhedor onde mulheres se conectam, compartilham experiências e se inspiram mutuamente. Aqui, vulnerabilidade é força e crescimento é coletivo.",
      benefits: [
        "Ambiente moderado e seguro",
        "Compartilhamento autêntico",
        "Sem comparações ou julgamentos",
        "Apoio mútuo genuíno",
      ],
    },
    {
      icon: Flower2,
      title: "Afirmações Positivas",
      subtitle: "Mensagens que nutrem sua autoestima",
      description: "Afirmações personalizadas que se adaptam ao seu humor e aos seus objetivos. Palavras escolhidas com cuidado para fortalecer sua relação consigo mesma.",
      benefits: [
        "Mensagens adaptadas ao seu momento",
        "Foco em autocompaixão",
        "Biblioteca de afirmações inspiradoras",
        "Lembretes gentis ao longo do dia",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero with geometric pattern */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-tr from-primary/10 via-background to-accent/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-3xl blur-3xl rotate-45" />
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent rounded-3xl blur-3xl -rotate-12" />
        </div>
        <div className="container mx-auto max-w-4xl text-center animate-fade-in relative z-10">
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6 leading-tight">
            Autoestima inteligente, <span className="text-primary">no seu ritmo</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Descubra tudo o que a Bloomelle faz por você.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-6xl space-y-32">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              } gap-12 items-center animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon & Title */}
              <div className="flex-1 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-4xl font-light text-foreground mb-2">
                    {feature.title}
                  </h2>
                  <p className="text-xl text-primary font-light">
                    {feature.subtitle}
                  </p>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Benefits */}
              <div className="flex-1 bg-card border border-border rounded-3xl p-8 shadow-soft">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-6 font-medium">
                  O que você ganha
                </h3>
                <ul className="space-y-4">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-foreground leading-relaxed">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-3xl text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-light text-foreground mb-6 leading-tight">
            Pronta para <span className="text-primary">florescer</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece gratuitamente e descubra como pequenas pausas podem transformar sua autoestima.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
