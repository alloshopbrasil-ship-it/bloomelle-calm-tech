import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Bell, Globe, Shield, Moon, CreditCard, Crown, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TubelightNavBar } from "@/components/ui/tubelight-navbar";
import { InvoiceHistory } from "@/components/InvoiceHistory";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { useLanguage, Language, getLanguageName } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LanguageConfirmDialog } from "@/components/LanguageConfirmDialog";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useSubscription } from "@/hooks/useSubscription";

type SettingsSection = "account" | "notifications" | "preferences" | "appearance" | "language" | "security" | "billing";

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  const { subscribed, planType, subscriptionEnd, openCustomerPortal, isLoading: subscriptionLoading } = useSubscription();
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [portalLoading, setPortalLoading] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [newAffirmations, setNewAffirmations] = useState(true);
  const [communityActivity, setCommunityActivity] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showLanguageConfirm, setShowLanguageConfirm] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPlansPopup, setShowPlansPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: "account" as const, label: t("settings.account"), icon: User, url: "#account" },
    { id: "notifications" as const, label: t("settings.notifications"), icon: Bell, url: "#notifications" },
    { id: "language" as const, label: t("settings.language"), icon: Globe, url: "#language" },
    { id: "appearance" as const, label: t("settings.appearance"), icon: Moon, url: "#appearance" },
    { id: "security" as const, label: t("settings.security"), icon: Shield, url: "#security" },
    { id: "billing" as const, label: t("settings.billing"), icon: CreditCard, url: "#billing" },
  ];

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setProfileImage(data.avatar_url || "");
      setIsAnonymous(data.is_anonymous || false);
    } else {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.email?.split('@')[0] || "",
          email: user.email || "",
        });
      
      if (!insertError) {
        setName(user.email?.split('@')[0] || "");
        setEmail(user.email || "");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang !== language) {
      setPendingLanguage(newLang as Language);
      setShowLanguageConfirm(true);
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setLanguage(pendingLanguage);
      toast({
        title: "✨",
        description: `${t("settings.language")} → ${getLanguageName(pendingLanguage)}`,
      });
    }
    setShowLanguageConfirm(false);
    setPendingLanguage(null);
  };

  const handleDarkModeChange = (enabled: boolean) => {
    setTheme(enabled ? "dark" : "light");
    toast({
      title: "🌙",
      description: enabled ? t("settings.darkMode") : "Light mode",
    });
  };

  const saveChanges = async () => {
    if (!user) return;

    try {
      setUploading(true);
      let avatarUrl = profileImage;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name,
          email: email,
          avatar_url: avatarUrl,
          is_anonymous: isAnonymous,
        });

      if (updateError) throw updateError;

      localStorage.setItem("profileImage", avatarUrl);
      window.dispatchEvent(new Event('profileImageUpdate'));

      setSelectedFile(null);
      toast({
        title: "🌸",
        description: t("settings.saveChanges"),
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title={t("settings.title")} showFooter={true} hideChat>
      {/* Header */}
      <div className="mb-6 md:mb-8 text-center animate-fade-in">
        <h2 className="text-2xl md:text-4xl font-light text-foreground mb-2">
          {t("settings.title")} 🌺
        </h2>
        <p className="text-muted-foreground text-base md:text-lg">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Tubelight Navigation */}
      <TubelightNavBar 
        items={menuItems.map(item => ({
          name: item.label,
          url: item.url,
          icon: item.icon
        }))}
        activeItem={menuItems.find(item => item.id === activeSection)?.label}
        onItemClick={(name) => {
          const item = menuItems.find(m => m.label === name);
          if (item) setActiveSection(item.id);
        }}
        className="mb-6 md:mb-8"
      />

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto">
              {/* Profile Section */}
              {activeSection === "account" && (
                <Card className="rounded-2xl border-border/40 animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{t("settings.profile")}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profileImage} />
                        <AvatarFallback className="text-2xl bg-gradient-to-r from-primary/20 to-secondary/20">
                          🌷
                        </AvatarFallback>
                      </Avatar>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {t("settings.changePhoto")}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("settings.name")}</Label>
                        <Input 
                          id="name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("settings.email")}</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={saveChanges} disabled={uploading}>
                      {uploading ? t("settings.saving") : t("settings.saveChanges")}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Notifications */}
              {activeSection === "notifications" && (
                <NotificationSettings 
                  dailyReminders={dailyReminders}
                  setDailyReminders={setDailyReminders}
                  newAffirmations={newAffirmations}
                  setNewAffirmations={setNewAffirmations}
                  communityActivity={communityActivity}
                  setCommunityActivity={setCommunityActivity}
                  t={t}
                />
              )}

              {/* Language & Region */}
              {activeSection === "language" && (
                <Card className="rounded-2xl border-border/40 animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{t("settings.languageRegion")}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">{t("settings.language")}</Label>
                      <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="pt">Português</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">{t("settings.timezone")}</Label>
                      <Select defaultValue="brt">
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="brt">Brasília (GMT-3)</SelectItem>
                          <SelectItem value="pt">Lisboa (GMT+0)</SelectItem>
                          <SelectItem value="est">New York (GMT-5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Theme */}
              {activeSection === "appearance" && (
                <Card className="rounded-2xl border-border/40 animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{t("settings.appearance")}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <div className="font-medium">{t("settings.darkMode")}</div>
                        <div className="text-sm text-muted-foreground">{t("settings.darkModeDesc")}</div>
                      </div>
                      <Switch checked={isDark} onCheckedChange={handleDarkModeChange} />
                    </div>
                    
                    {/* Theme Preview */}
                    <div className="p-4 rounded-xl border border-border/40">
                      <p className="text-sm text-muted-foreground mb-3">Preview</p>
                      <div className={`rounded-lg p-4 ${isDark ? 'bg-slate-800' : 'bg-pink-50'} transition-colors duration-300`}>
                        <div className={`h-3 w-24 rounded ${isDark ? 'bg-purple-400/60' : 'bg-pink-300'} mb-2`} />
                        <div className={`h-2 w-32 rounded ${isDark ? 'bg-purple-300/40' : 'bg-pink-200'} mb-2`} />
                        <div className={`h-2 w-20 rounded ${isDark ? 'bg-purple-300/40' : 'bg-pink-200'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy */}
              {activeSection === "security" && (
                <Card className="rounded-2xl border-border/40 animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{t("settings.privacySecurity")}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <div className="font-medium">{t("settings.anonymousMode")}</div>
                        <div className="text-sm text-muted-foreground">
                          {t("settings.anonymousModeDesc")}
                        </div>
                      </div>
                      <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      {t("settings.changePassword")}
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      {t("settings.exportData")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      {t("settings.deleteAccount")}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Billing */}
              {activeSection === "billing" && (
                <Card className="rounded-2xl border-border/40 animate-fade-in">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold">{t("settings.billingPlans")}</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {subscriptionLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : subscribed && planType === "premium" ? (
                      <>
                        {/* Premium Status */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                              <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-foreground">Bloomelle Premium</h4>
                              <p className="text-sm text-muted-foreground">Assinatura ativa</p>
                            </div>
                          </div>
                          {subscriptionEnd && (
                            <p className="text-sm text-muted-foreground">
                              Próxima cobrança: {new Date(subscriptionEnd).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          )}
                        </div>
                        
                        {/* Manage Subscription Button */}
                        <Button 
                          onClick={async () => {
                            setPortalLoading(true);
                            try {
                              await openCustomerPortal();
                            } catch (error) {
                              toast({
                                title: "Erro",
                                description: "Não foi possível abrir o portal. Tente novamente.",
                                variant: "destructive"
                              });
                            } finally {
                              setPortalLoading(false);
                            }
                          }}
                          variant="outline"
                          className="w-full"
                          disabled={portalLoading}
                        >
                          {portalLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-2" />
                          )}
                          Gerenciar assinatura
                        </Button>
                        
                        <p className="text-xs text-muted-foreground text-center mb-6">
                          Cancele, altere método de pagamento ou atualize seu plano
                        </p>
                        
                        {/* Invoice History */}
                        <InvoiceHistory />
                      </>
                    ) : (
                      <div className="text-center p-8">
                        <CreditCard className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                        <h4 className="text-lg font-medium mb-2">{t("settings.managePlan")}</h4>
                        <p className="text-muted-foreground mb-6">
                          {t("settings.managePlanDesc")}
                        </p>
                        <Button className="w-full sm:w-auto" onClick={() => setShowPlansPopup(true)}>
                          {t("settings.viewPlans")}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

      {/* Language Confirmation Dialog */}
      <LanguageConfirmDialog
        isOpen={showLanguageConfirm}
        onClose={() => {
          setShowLanguageConfirm(false);
          setPendingLanguage(null);
        }}
        pendingLanguage={pendingLanguage}
        onConfirm={confirmLanguageChange}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />

      {/* Plans Popup */}
      <PremiumUpgradePopup
        isOpen={showPlansPopup}
        onClose={() => setShowPlansPopup(false)}
      />
    </DashboardLayout>
  );
};

export default Settings;
