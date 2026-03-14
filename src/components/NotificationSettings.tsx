import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettingsProps {
  dailyReminders: boolean;
  setDailyReminders: (value: boolean) => void;
  newAffirmations: boolean;
  setNewAffirmations: (value: boolean) => void;
  communityActivity: boolean;
  setCommunityActivity: (value: boolean) => void;
  t: (key: string) => string;
}

export const NotificationSettings = ({
  dailyReminders,
  setDailyReminders,
  newAffirmations,
  setNewAffirmations,
  communityActivity,
  setCommunityActivity,
  t
}: NotificationSettingsProps) => {
  const { toast } = useToast();
  const { isSupported, permission, requestPermission, sendNotification } = usePushNotifications();

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast({
        title: "Notificações ativadas! 🔔",
        description: "Você receberá lembretes gentis para cuidar de si mesma."
      });
      // Send a test notification
      sendNotification("Bloomelle 🌸", {
        body: "Notificações ativadas com sucesso! Estamos aqui para você.",
        tag: "welcome"
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Você pode ativar as notificações nas configurações do navegador.",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = () => {
    sendNotification("Lembrete de autocuidado 🌸", {
      body: "Que tal uma pausa gentil? Respire fundo e lembre-se: você é incrível! ✨",
      tag: "test"
    });
  };

  return (
    <Card className="rounded-2xl border-border/40 animate-fade-in">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("settings.notifications")}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Push Notifications */}
        {isSupported && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-primary" />
                <span className="font-medium">Notificações Push</span>
              </div>
              {permission === "granted" ? (
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                  Ativadas
                </span>
              ) : (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Desativadas
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Receba lembretes gentis mesmo quando não estiver usando o app.
            </p>
            {permission !== "granted" ? (
              <Button
                onClick={handleEnablePush}
                className="w-full rounded-full"
                size="sm"
              >
                Ativar notificações push
              </Button>
            ) : (
              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full rounded-full"
                size="sm"
              >
                Testar notificação
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t("settings.dailyReminders")}</div>
            <div className="text-sm text-muted-foreground">{t("settings.dailyRemindersDesc")}</div>
          </div>
          <Switch checked={dailyReminders} onCheckedChange={setDailyReminders} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t("settings.newAffirmations")}</div>
            <div className="text-sm text-muted-foreground">{t("settings.newAffirmationsDesc")}</div>
          </div>
          <Switch checked={newAffirmations} onCheckedChange={setNewAffirmations} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{t("settings.communityActivity")}</div>
            <div className="text-sm text-muted-foreground">{t("settings.communityActivityDesc")}</div>
          </div>
          <Switch checked={communityActivity} onCheckedChange={setCommunityActivity} />
        </div>
      </CardContent>
    </Card>
  );
};
