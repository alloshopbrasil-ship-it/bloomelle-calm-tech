import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.functions.invoke('send-contact', {
        body: { name: formData.name, email: formData.email, message: formData.message },
      });

      if (error) throw error;

      toast({
        title: "Mensagem enviada! 🌸",
        description: "Responderemos em breve com todo o cuidado.",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto max-w-4xl text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6 leading-tight">
            Estamos aqui para <span className="text-primary">ouvir você</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Envie uma mensagem, parceria ou sugestão.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-24 px-6 bg-background">
        <div className="container mx-auto max-w-3xl">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-soft animate-fade-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-light">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como você gostaria de ser chamada?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="rounded-xl border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-light">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="rounded-xl border-border focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground font-light">
                    Mensagem
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="O que você gostaria de compartilhar?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    className="rounded-xl border-border focus:border-primary transition-colors resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full rounded-full shadow-soft hover:shadow-bloom transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar mensagem"}
                </Button>
              </form>

              <p className="text-sm text-muted-foreground text-center mt-6 leading-relaxed">
                Responderemos com o mesmo cuidado com que criamos a Bloomelle.
              </p>
            </div>

            {/* Illustration side */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
              {/* Decorative gradient blob */}
              <div className="relative h-64 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-30" />
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
              </div>

              <div className="space-y-6 p-8">
                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">
                    Parcerias e colaborações
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Interessada em colaborar com a Bloomelle? Adoraríamos ouvir sua proposta.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">
                    Suporte técnico
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Para questões técnicas, estamos aqui para ajudar a resolver qualquer dificuldade.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-light text-foreground mb-2">
                    Feedback
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Sua opinião nos ajuda a florescer. Compartilhe suas experiências e sugestões.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
