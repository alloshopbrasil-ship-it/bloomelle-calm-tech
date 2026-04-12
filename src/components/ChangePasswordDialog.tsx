import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePasswordDialog = ({ open, onOpenChange }: ChangePasswordDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Não foi possível identificar seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "E-mail enviado! 📧",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmailSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-3xl border-border/40 bg-gradient-to-br from-card to-primary/5">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Alterar Senha
          </DialogTitle>
          <DialogDescription className="text-center">
            {emailSent 
              ? "Um link de redefinição foi enviado para seu e-mail"
              : "Enviaremos um link seguro para você redefinir sua senha"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {emailSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-2">E-mail enviado!</p>
              <p className="text-sm text-muted-foreground mb-4">
                Verifique sua caixa de entrada em <strong>{user?.email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Enviaremos um link para:
              </p>
              <p className="font-medium text-foreground mb-4">{user?.email}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleClose}
            >
              {emailSent ? "Fechar" : "Cancelar"}
            </Button>
            {!emailSent && (
              <Button
                className="flex-1 rounded-full"
                onClick={handleSendResetEmail}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar Link"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};