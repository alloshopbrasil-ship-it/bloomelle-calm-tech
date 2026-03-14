import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Flower2 } from "lucide-react";

const Privacy = () => {
  const sections = [
    {
      title: "Coleta de dados",
      content: [
        "Na Bloomelle, coletamos apenas as informações essenciais para proporcionar uma experiência personalizada e segura.",
        "Dados coletados incluem: informações de cadastro (nome, e-mail), dados de uso da plataforma (interações, preferências), e dados emocionais fornecidos voluntariamente através do MoodMap e Daily Bloom.",
        "Nunca compartilhamos seus dados emocionais com terceiros. Eles existem apenas para melhorar sua experiência pessoal.",
      ],
    },
    {
      title: "Uso das informações",
      content: [
        "Utilizamos seus dados exclusivamente para: personalizar sua experiência na Bloomelle, gerar insights sobre seu bem-estar emocional, melhorar nossos serviços e funcionalidades.",
        "Seus dados emocionais são processados de forma anônima e criptografada. A IA da Bloomelle aprende com padrões gerais, nunca com informações identificáveis.",
        "Não usamos seus dados para publicidade direcionada nem os vendemos a terceiros.",
      ],
    },
    {
      title: "Direitos do usuário",
      content: [
        "Você tem total controle sobre seus dados. A qualquer momento, você pode: acessar todos os seus dados armazenados, solicitar a correção de informações incorretas, exportar seus dados para uso pessoal, deletar permanentemente sua conta e todos os dados associados.",
        "Para exercer qualquer um desses direitos, basta entrar em contato através da nossa página de contato.",
      ],
    },
    {
      title: "Segurança e armazenamento",
      content: [
        "Levamos sua segurança a sério. Todos os dados são criptografados em repouso e em trânsito.",
        "Utilizamos servidores seguros localizados na União Europeia, em conformidade com o GDPR (Regulamento Geral de Proteção de Dados).",
        "Implementamos autenticação de dois fatores e monitoramento contínuo para prevenir acessos não autorizados.",
      ],
    },
    {
      title: "Cookies e rastreamento",
      content: [
        "Utilizamos cookies essenciais para o funcionamento da plataforma (como manter você logada).",
        "Não utilizamos cookies de rastreamento para publicidade.",
        "Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.",
      ],
    },
    {
      title: "Atualizações desta política",
      content: [
        "Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou requisitos legais.",
        "Notificaremos você por e-mail sobre quaisquer alterações significativas.",
        "A data da última atualização está sempre indicada no topo desta página.",
      ],
    },
    {
      title: "Contato",
      content: [
        "Se você tiver dúvidas sobre esta política ou sobre como tratamos seus dados, entre em contato conosco através da página de contato.",
        "Estamos aqui para garantir que você se sinta segura e informada sobre seus dados na Bloomelle.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Flower2 className="w-8 h-8 text-primary" />
            <h1 className="text-5xl md:text-6xl font-light text-foreground leading-tight">
              Sua privacidade também <span className="text-primary">floresce</span> aqui
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Última atualização: Janeiro de 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-16">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Flower2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <h2 className="text-3xl font-light text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-4 pl-7">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Closing note */}
          <div className="mt-16 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center animate-fade-in">
            <p className="text-lg text-foreground font-light leading-relaxed">
              Na Bloomelle, sua confiança é sagrada. <br />
              Tratamos seus dados com o mesmo cuidado que você merece.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;
