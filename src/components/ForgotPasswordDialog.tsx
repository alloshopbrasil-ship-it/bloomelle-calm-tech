import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "E-mail inválido",
        description: "Por favor, insira um e-mail válido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('reset-request', {
        body: { email },
      });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível enviar o e-mail. Tente novamente.",
          variant: "destructive"
        });
      } else {
        setSent(true);
        toast({
          title: "E-mail enviado! 📧",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o e-mail. Tente novamente.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleClose = () => {
    setEmail("");
    setSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        {!sent ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <DialogTitle className="text-xl">Esqueceu sua senha?</DialogTitle>
              </div>
              <DialogDescription>
                Não se preocupe! Digite seu e-mail e enviaremos um link para você redefinir sua senha.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reset-email">E-mail</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 rounded-xl"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={handleClose}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-full"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">E-mail enviado!</h3>
            <p className="text-muted-foreground mb-6">
              Verifique sua caixa de entrada em <strong>{email}</strong> e siga as instruções para redefinir sua senha.
            </p>
            <Button onClick={handleClose} className="rounded-full">
              Entendi
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
