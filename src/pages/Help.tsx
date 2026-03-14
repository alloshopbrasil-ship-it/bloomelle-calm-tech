import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronDown, Search, MessageCircle, Book, Shield, Heart } from "lucide-react";
import { useState } from "react";

const Help = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como começo a usar a Bloomelle?",
      answer: "Comece criando sua conta gratuita. Após o login, você terá acesso ao MoodMap para rastrear suas emoções diárias, rituais de autocuidado e a comunidade BloomSpaces.",
    },
    {
      question: "O que é o MoodMap?",
      answer: "O MoodMap é uma ferramenta de rastreamento emocional que permite registrar e visualizar suas emoções ao longo do tempo, ajudando você a identificar padrões e promover o autoconhecimento.",
    },
    {
      question: "Qual a diferença entre os planos?",
      answer: "O plano Free oferece funcionalidades básicas como o MoodMap e acesso limitado à comunidade. O plano Premium inclui IA personalizada, relatórios de evolução emocional, conteúdos exclusivos e acesso completo aos BloomSpaces.",
    },
    {
      question: "Como funciona o BloomSpaces?",
      answer: "BloomSpaces é nossa comunidade online onde você pode conectar-se com outras pessoas, compartilhar experiências, participar de grupos de apoio e acessar conteúdos especializados em bem-estar emocional.",
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim! Levamos sua privacidade muito a sério. Todos os dados são criptografados e seguimos rigorosamente as normas de proteção de dados. Você tem controle total sobre suas informações.",
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura Premium a qualquer momento através das configurações da sua conta. Não há taxas de cancelamento.",
    },
    {
      question: "A Bloomelle substitui terapia profissional?",
      answer: "Não. A Bloomelle é uma ferramenta complementar de bem-estar emocional e autoconhecimento. Para questões de saúde mental, sempre recomendamos consultar profissionais qualificados.",
    },
    {
      question: "Como posso entrar em contato com o suporte?",
      answer: "Você pode nos contatar através da página de Contato ou enviando um email para suporte@bloomelle.com. Respondemos em até 24 horas.",
    },
  ];

  const categories = [
    {
      icon: Book,
      title: "Primeiros Passos",
      description: "Aprenda a usar a Bloomelle",
    },
    {
      icon: Heart,
      title: "Funcionalidades",
      description: "Conheça todas as ferramentas",
    },
    {
      icon: Shield,
      title: "Segurança & Privacidade",
      description: "Como protegemos seus dados",
    },
    {
      icon: MessageCircle,
      title: "Comunidade",
      description: "Guia dos BloomSpaces",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">
            Central de
            <span className="block mt-2 text-primary font-normal">
              Ajuda
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Estamos aqui para ajudar você a florescer
          </p>
          
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar ajuda..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <category.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-muted/20">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-center mb-12">
            Perguntas Frequentes
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4">
            Não encontrou o que procura?
          </h2>
          <p className="text-muted-foreground mb-8">
            Nossa equipe está pronta para ajudar você
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-5 h-5" />
            Entrar em Contato
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Help;
