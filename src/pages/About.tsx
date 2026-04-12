import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Heart, Users, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero with unique pattern */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-secondary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
        <div className="container mx-auto max-w-4xl text-center animate-fade-in relative z-10">
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6 leading-tight">
            A história da <span className="text-primary">Bloomelle</span>
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-8 text-lg text-muted-foreground leading-relaxed animate-fade-in">
            <p>
              Criamos a Bloomelle para transformar o modo como mulheres se relacionam com a própria autoestima.
            </p>
            <p>
              Unindo tecnologia, design e empatia, criamos um espaço onde florescer é um processo, não uma corrida.
            </p>
            <p>
              A Bloomelle é uma plataforma digital criada para ajudar mulheres a reconectarem-se com sua essência, fortalecerem a autoestima e desenvolverem hábitos de bem-estar e equilíbrio emocional.
            </p>
            <p>
              Mais do que uma ferramenta, é um espaço seguro e acolhedor, onde cada mulher floresce no seu próprio ritmo — com leveza, propósito e amor-próprio.
            </p>
            <p className="text-foreground font-light text-2xl pt-8">
              "A verdadeira beleza floresce de dentro." 🌷
            </p>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-light text-foreground mb-4">
              Nosso propósito
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "Autoestima Acessível",
                description: "Tornar o autocuidado acessível e inspirador, transformando tecnologia em uma aliada do bem-estar emocional.",
              },
              {
                icon: Sparkles,
                title: "Crescimento Genuíno",
                description: "Cada mulher floresce no seu próprio tempo, com ferramentas que respeitam seu ritmo e necessidades únicas.",
              },
              {
                icon: Users,
                title: "Comunidade de Apoio",
                description: "Um lugar de crescimento, apoio e amor-próprio, onde cada mulher sente que pertence.",
              },
            ].map((value, index) => (
              <div
                key={value.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-light text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-light text-foreground mb-6">
              Nosso time
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
              Somos uma equipa multidisciplinar de designers, psicólogas, desenvolvedoras e criadoras de conteúdo. 
              Todas unidas pela missão de criar tecnologia mais humana.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Design", "Psicologia", "Tecnologia", "Conteúdo", "Comunidade"].map((area, index) => (
                <div
                  key={area}
                  className="bg-primary/10 px-6 py-3 rounded-full text-primary font-light animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {area}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/5 to-secondary/10">
        <div className="container mx-auto max-w-3xl text-center animate-fade-in">
          <p className="text-2xl font-light text-foreground leading-relaxed">
            "Autoestima não se conquista. <br />
            Ela se <span className="text-primary">cultiva</span>, com tempo e cuidado."
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
