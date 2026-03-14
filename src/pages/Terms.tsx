import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            Termos de
            <span className="block mt-2 text-primary font-normal">
              Serviço
            </span>
          </h1>
          
          <p className="text-muted-foreground mb-12">
            Última atualização: {new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma Bloomelle, você concorda com estes Termos de Serviço. 
                Se não concordar com algum destes termos, por favor, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Bloomelle é uma plataforma digital de bem-estar emocional que oferece:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Ferramentas de rastreamento emocional (MoodMap)</li>
                <li>Rituais e práticas de autocuidado</li>
                <li>Comunidade online (BloomSpaces)</li>
                <li>Conteúdos educacionais sobre bem-estar emocional</li>
                <li>Recursos de inteligência artificial para personalização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">3. Elegibilidade e Conta</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Para usar a Bloomelle, você deve:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Ter pelo menos 16 anos de idade</li>
                <li>Fornecer informações precisas e completas no cadastro</li>
                <li>Manter a segurança de sua senha e conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">4. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Usar o serviço para qualquer propósito ilegal ou não autorizado</li>
                <li>Violar qualquer lei aplicável em sua jurisdição</li>
                <li>Compartilhar conteúdo ofensivo, discriminatório ou prejudicial</li>
                <li>Tentar obter acesso não autorizado aos nossos sistemas</li>
                <li>Interferir no funcionamento adequado da plataforma</li>
                <li>Usar o serviço para assediar, abusar ou prejudicar outros usuários</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">5. Planos e Pagamentos</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                A Bloomelle oferece planos gratuitos e pagos:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>O plano Free é gratuito e oferece funcionalidades básicas</li>
                <li>O plano Premium é uma assinatura mensal renovável automaticamente</li>
                <li>Você pode cancelar sua assinatura a qualquer momento</li>
                <li>Não há reembolsos para períodos parciais de assinatura</li>
                <li>Os preços estão sujeitos a alterações com aviso prévio de 30 dias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo da Bloomelle, incluindo textos, gráficos, logotipos, ícones, imagens, 
                clipes de áudio e software, é propriedade da Bloomelle ou de seus fornecedores de conteúdo 
                e está protegido por leis de direitos autorais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">7. Conteúdo do Usuário</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Ao compartilhar conteúdo na plataforma:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Você mantém a propriedade do seu conteúdo</li>
                <li>Você nos concede uma licença para usar, exibir e distribuir seu conteúdo na plataforma</li>
                <li>Você garante que possui os direitos necessários sobre o conteúdo compartilhado</li>
                <li>Reservamo-nos o direito de remover conteúdo que viole estes termos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">8. Isenção de Responsabilidade Médica</h2>
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-xl">
                <p className="text-muted-foreground leading-relaxed font-medium">
                  IMPORTANTE: A Bloomelle NÃO é um serviço de saúde mental e não substitui tratamento 
                  psicológico ou psiquiátrico profissional. Nossos serviços são ferramentas complementares 
                  de bem-estar e autoconhecimento. Se você está enfrentando problemas graves de saúde mental, 
                  procure ajuda profissional qualificada imediatamente.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">9. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Bloomelle não será responsável por quaisquer danos indiretos, incidentais, especiais 
                ou consequenciais resultantes do uso ou incapacidade de usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">10. Modificações do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, 
                o serviço (ou qualquer parte dele) com ou sem aviso prévio, a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">11. Rescisão</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio, se você 
                violar estes Termos de Serviço. Você pode encerrar sua conta a qualquer momento 
                através das configurações da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">12. Lei Aplicável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos serão regidos e interpretados de acordo com as leis de Portugal, 
                sem considerar conflitos de disposições legais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">13. Alterações aos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos revisar estes Termos de Serviço periodicamente. Notificaremos você sobre 
                mudanças significativas por email ou através da plataforma. O uso continuado 
                do serviço após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-tight mb-4">14. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões sobre estes Termos de Serviço, entre em contato conosco através de:
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Email: legal@bloomelle.com<br />
                Página de Contato: <a href="/contact" className="text-primary hover:underline">bloomelle.com/contact</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
