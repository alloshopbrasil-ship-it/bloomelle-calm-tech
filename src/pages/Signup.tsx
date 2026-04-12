import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Check, X, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import signupHero from "@/assets/signup-hero.jpg";
import { AvatarCircles } from "@/components/ui/avatar-circles";
import { isDisposableEmail, isValidEmail, validatePasswordStrength } from "@/lib/emailValidation";
import { useLanguage } from "@/contexts/LanguageContext";

import authWoman1 from "@/assets/auth-woman-1.jpg";
import authWoman2 from "@/assets/auth-woman-2.jpg";
import sphereWoman1 from "@/assets/sphere-woman-1.jpg";
import sphereWoman2 from "@/assets/sphere-woman-2.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const avatarUrls = [authWoman2, sphereWoman1, sphereWoman2, authWoman1];

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Erro ao continuar com Google",
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

  const passwordStrength = validatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!isValidEmail(formData.email)) {
      setEmailError("Por favor, insira um e-mail válido.");
      valid = false;
    } else if (isDisposableEmail(formData.email)) {
      setEmailError("E-mails temporários não são permitidos. Use um e-mail pessoal.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!passwordStrength.isValid) {
      setPasswordErrors(passwordStrength.errors);
      valid = false;
    } else {
      setPasswordErrors([]);
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (valid) {
      setLoading(true);
      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message === "User already registered" 
            ? "Este e-mail já está cadastrado." 
            : error.message,
          variant: "destructive"
        });
      } else {
        // Send welcome email via Resend
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          await supabase.functions.invoke('send-welcome', {
            body: { to: formData.email, name: formData.name },
          });
        } catch {
          // Non-blocking: welcome email failure shouldn't block signup
          console.warn('Welcome email failed to send');
        }
        setShowEmailVerification(true);
      }
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-3xl shadow-2xl p-8 text-center">
          <div className="text-primary mb-4">
            <Sparkles className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-light text-foreground mb-3">
            Verifique seu e-mail 📬
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Enviamos um link de verificação para{" "}
            <span className="font-medium text-foreground">{formData.email}</span>.
            <br /><br />
            Clique no link para ativar sua conta e começar sua jornada na Bloomelle.
          </p>
          <div className="bg-muted/50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              💡 Não encontrou? Verifique sua pasta de spam ou lixo eletrônico.
            </p>
          </div>
          <Link to="/login">
            <Button className="w-full rounded-full">
              Ir para o Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm">
        
        {/* Left side - Form */}
        <div className="p-6 sm:p-10 md:p-12 md:w-1/2 flex flex-col justify-center order-2 md:order-1">
          <div className="flex flex-col items-start mb-6">
            <div className="text-primary mb-3">
              <Sparkles className="h-8 w-8" />
            </div>
            <Link to="/" className="text-xl font-light text-foreground tracking-wide hover:text-primary transition-colors mb-1">
              Bloomelle
            </Link>
            <h2 className="text-2xl font-light mb-1 tracking-tight text-foreground">
              Criar Conta
            </h2>
            <p className="text-sm text-muted-foreground font-light">
              Floresça no seu tempo — Bem-vinda à Bloomelle.
            </p>
          </div>

          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-light">
                Nome
              </Label>
              <Input
                type="text"
                id="name"
                placeholder="Como gostaria de ser chamada?"
                className="rounded-xl h-10"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-light">
                E-mail
              </Label>
              <Input
                type="email"
                id="email"
                placeholder="seu@email.com"
                className={`rounded-xl h-10 ${emailError ? "border-destructive" : ""}`}
                value={formData.email}
                onChange={handleChange}
                maxLength={255}
              />
              {emailError && (
                <p className="text-destructive text-xs mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" title="Senha" className="text-sm font-light">
                Criar senha
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  className={`rounded-xl h-10 pr-10 ${passwordErrors.length > 0 ? "border-destructive" : ""}`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <PasswordRule passed={!passwordStrength.errors.includes("min8")} label="Mínimo 8 caracteres" />
                  <PasswordRule passed={!passwordStrength.errors.includes("uppercase")} label="Uma letra maiúscula" />
                  <PasswordRule passed={!passwordStrength.errors.includes("number")} label="Um número" />
                  <PasswordRule passed={!passwordStrength.errors.includes("special")} label="Um caractere especial" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" title="Confirmar Senha" className="text-sm font-light">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  className={`rounded-xl h-10 pr-10 ${confirmPasswordError ? "border-destructive" : ""}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-destructive text-xs mt-1">{confirmPasswordError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full h-11 shadow-soft hover:shadow-bloom transition-all duration-300 mt-2"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>

            <div className="relative my-2">
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
              className="w-full rounded-full h-10 border-2"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>

            <div className="flex items-center justify-center gap-3 mt-4">
              <AvatarCircles avatarUrls={avatarUrls} numPeople={2847} />
              <span className="text-xs text-muted-foreground">mulheres florescendo</span>
            </div>

            <div className="text-center text-muted-foreground text-sm mt-2">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
                Entrar
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao início
            </Link>
          </div>
        </div>

        {/* Right side - Image panel */}
        <div 
          className="relative md:w-1/2 min-h-[200px] md:min-h-[600px] bg-cover bg-center order-1 md:order-2"
          style={{ backgroundImage: `url(${signupHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-primary/30 to-secondary/40 backdrop-blur-[1px]"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-end text-white">
            <h1 className="text-3xl md:text-4xl font-light leading-tight tracking-tight mb-2">
              Comece sua jornada
            </h1>
            <p className="text-lg opacity-90 font-light">
              Um espaço seguro para crescer e florescer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PasswordRule = ({ passed, label }: { passed: boolean; label: string }) => (
  <div className="flex items-center gap-1.5">
    {passed ? (
      <Check className="h-3 w-3 text-green-500" />
    ) : (
      <X className="h-3 w-3 text-muted-foreground" />
    )}
    <span className={`text-[10px] ${passed ? "text-green-600" : "text-muted-foreground"}`}>
      {label}
    </span>
  </div>
);

export default Signup;