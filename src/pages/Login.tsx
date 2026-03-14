import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import loginHero from "@/assets/login-hero.jpg";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { isValidEmail } from "@/lib/emailValidation";

import authWoman1 from "@/assets/auth-woman-1.jpg";
import authWoman2 from "@/assets/auth-woman-2.jpg";
import communityWoman9 from "@/assets/community-woman-9.jpg";
import communityWoman10 from "@/assets/community-woman-10.jpg";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const avatarUrls = [authWoman1, authWoman2, communityWoman9, communityWoman10];

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setLockoutRemaining(0);
        setLoginAttempts(0);
      } else {
        setLockoutRemaining(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.message,
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (isLockedOut) {
      toast({
        title: "Muitas tentativas",
        description: `Aguarde ${lockoutRemaining}s antes de tentar novamente.`,
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Por favor, insira um e-mail válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (password.length < 8) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      setLoading(true);
      const { error } = await signIn(email, password);
      
      if (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_SECONDS * 1000);
          setLockoutRemaining(LOCKOUT_SECONDS);
          toast({
            title: "Conta temporariamente bloqueada",
            description: `Muitas tentativas. Aguarde ${LOCKOUT_SECONDS}s.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao entrar",
            description: error.message === "Invalid login credentials" 
              ? `E-mail ou senha incorretos. (${MAX_ATTEMPTS - newAttempts} tentativas restantes)` 
              : error.message,
            variant: "destructive"
          });
        }
      } else {
        setLoginAttempts(0);
        toast({
          title: "Bem-vinda de volta! 🌸",
          description: "Login realizado com sucesso.",
        });
        navigate("/dashboard");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm">
        
        {/* Left side - Image panel */}
        <div 
          className="relative md:w-1/2 min-h-[200px] md:min-h-[600px] bg-cover bg-center"
          style={{ backgroundImage: `url(${loginHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary/30 to-accent/40 backdrop-blur-[1px]"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
            <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight mb-2">
              Bem-vinda de volta
            </h1>
            <p className="text-lg opacity-90 font-light">
              Continue sua jornada de autoconhecimento.
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="p-6 sm:p-10 md:p-12 md:w-1/2 flex flex-col justify-center">
          <div className="flex flex-col items-start mb-8">
            <div className="text-primary mb-3">
              <Sparkles className="h-8 w-8" />
            </div>
            <Link to="/" className="text-xl font-light text-foreground tracking-wide hover:text-primary transition-colors mb-1">
              Bloomelle
            </Link>
            <h2 className="text-2xl font-light mb-1 tracking-tight text-foreground">
              Entrar
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Se ouvir também é um começo.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-light">
                E-mail
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="seu@email.com"
                className={`rounded-xl h-11 ${emailError ? "border-destructive" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLockedOut}
              />
              {emailError && (
                <p className="text-destructive text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" title="Senha" className="text-sm font-light">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <Input
                type="password"
                id="password"
                placeholder="••••••••"
                className={`rounded-xl h-11 ${passwordError ? "border-destructive" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLockedOut}
              />
              {passwordError && (
                <p className="text-destructive text-xs mt-1">{passwordError}</p>
              )}
            </div>

            {isLockedOut && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-center">
                <p className="text-sm text-destructive">
                  Muitas tentativas. Tente novamente em <strong>{lockoutRemaining}s</strong>
                </p>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full h-12 shadow-soft hover:shadow-bloom transition-all duration-300 mt-2"
              disabled={loading || isLockedOut}
            >
              {loading ? "Entrando..." : isLockedOut ? `Aguarde ${lockoutRemaining}s` : "Entrar"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full h-11 border-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? "Entrando..." : "Entrar com Google"}
            </Button>

            <div className="flex items-center justify-center gap-3 mt-6">
              <AvatarCircles avatarUrls={avatarUrls} numPeople={2847} />
              <span className="text-xs text-muted-foreground">mulheres florescendo</span>
            </div>

            <div className="text-center text-muted-foreground text-sm mt-4">
              Ainda não tem conta?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline transition-colors">
                Criar conta
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </div>
  );
};

export default Login;