import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Lock, CheckCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-medium mb-3">Link inválido</h2>
            <p className="text-muted-foreground mb-6">
              Este link de redefinição de senha é inválido ou expirou. Solicite um novo link.
            </p>
            <Button onClick={() => navigate("/login")} className="rounded-full w-full">
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { token, newPassword: password },
      });

      if (error) {
        toast({
          title: "Erro ao atualizar senha",
          description: "Tente novamente ou solicite um novo link.",
          variant: "destructive"
        });
      } else if (data?.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive"
        });
      } else {
        setSuccess(true);
        toast({
          title: "Senha atualizada! 🌸",
          description: "Sua senha foi redefinida com sucesso.",
        });
      }
    } catch {
      toast({
        title: "Erro ao atualizar senha",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-medium mb-3">Senha redefinida!</h2>
            <p className="text-muted-foreground mb-6">
              Sua senha foi atualizada com sucesso. Agora você pode entrar com sua nova senha.
            </p>
            <Button onClick={() => navigate("/login")} className="rounded-full w-full">
              Ir para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <Link to="/" className="text-lg font-light hover:text-primary transition-colors">
              Bloomelle
            </Link>
          </div>
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha segura para sua conta.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo de 8 caracteres
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading}
            >
              {loading ? "Atualizando..." : "Atualizar senha"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
