import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { BookOpen, Save, Crown, Sparkles } from "lucide-react";
import { BloomiaJournalResponse } from "@/components/BloomiaJournalResponse";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PremiumUpgradePopup } from "@/components/PremiumUpgradePopup";
import { useLanguage } from "@/contexts/LanguageContext";
import { ToolWelcomePopup } from "@/components/ToolWelcomePopup";
import { useToolWelcome } from "@/hooks/usePopupManager";

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isPremium, canAddJournalEntry, currentMonthJournalCount, limits } = usePlanLimits();
  const { isOpen: showToolWelcome, closeToolWelcome } = useToolWelcome("journal");
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || t("dashboard.welcome");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [journalEntry, setJournalEntry] = useState("");
  const [journalTitle, setJournalTitle] = useState("");
  const [entries, setEntries] = useState<Array<{ id: string; title: string | null; content: string; created_at: string }>>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [datesWithEntries, setDatesWithEntries] = useState<Date[]>([]);
  const [showBloomia, setShowBloomia] = useState(false);
  const [savedContent, setSavedContent] = useState("");

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      loadEntryForDate(selectedDate);
    }
  }, [selectedDate]);

  const loadEntries = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, title, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
      const dates = data.map(entry => new Date(entry.created_at));
      setDatesWithEntries(dates);
    }
  };

  const loadEntryForDate = async (date: Date) => {
    if (!user) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", `${dateStr}T00:00:00`)
      .lte("created_at", `${dateStr}T23:59:59`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setJournalTitle(data.title || "");
      setJournalEntry(data.content);
      setCurrentEntryId(data.id);
    } else {
      setJournalTitle("");
      setJournalEntry("");
      setCurrentEntryId(null);
    }
  };

  const handleSaveEntry = async () => {
    if (!user || !journalEntry.trim()) {
      toast({
        title: t("journal.writeFirst") || "Escreva algo primeiro 💫",
        description: t("journal.waitingThoughts") || "Seu diário está esperando seus pensamentos.",
        variant: "destructive",
      });
      return;
    }

    if (!currentEntryId && !canAddJournalEntry) {
      setShowPremiumPopup(true);
      return;
    }

    setIsSaving(true);

    try {
      if (currentEntryId) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            title: journalTitle || null,
            content: journalEntry,
          })
          .eq("id", currentEntryId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            title: journalTitle || null,
            content: journalEntry,
          });

        if (error) throw error;
      }

      toast({
        title: t("journal.saved") || "Reflexão salva! 🌸",
        description: t("journal.savedDesc") || "Sua entrada foi registrada com carinho.",
      });

      setSavedContent(journalEntry);
      setShowBloomia(true);
      loadEntries();
    } catch (error: any) {
      toast({
        title: t("journal.errorSaving") || "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasEntryOnDate = (date: Date) => {
    return datesWithEntries.some(entryDate => 
      entryDate.toDateString() === date.toDateString()
    );
  };

  const getDateLocale = () => {
    const locales: Record<string, string> = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR'
    };
    return locales[language] || locales.pt;
  };

  const placeholderTexts: Record<string, string> = {
    pt: `Como você se sente hoje, ${userName}? Este é seu espaço seguro...`,
    en: `How are you feeling today, ${userName}? This is your safe space...`,
    es: `¿Cómo te sientes hoy, ${userName}? Este es tu espacio seguro...`,
    fr: `Comment te sens-tu aujourd'hui, ${userName}? C'est ton espace sûr...`
  };

  const subtitleTexts: Record<string, string> = {
    pt: "Escreva seus pensamentos e sentimentos com liberdade",
    en: "Write your thoughts and feelings freely",
    es: "Escribe tus pensamientos y sentimientos con libertad",
    fr: "Écrivez vos pensées et sentiments librement"
  };

  return (
    <>
      <ToolWelcomePopup 
        isOpen={showToolWelcome} 
        onClose={closeToolWelcome} 
        toolName="journal"
        toolIcon={<BookOpen className="h-8 w-8 text-primary" />}
      />
      <DashboardLayout title={t("journal.title")} maxWidth="max-w-6xl">
        <div className="mb-8 text-center animate-fade-in">
          <h2 className="text-2xl md:text-4xl font-light text-foreground mb-2">
            {t("journal.yourSpace") || "Seu espaço de reflexão"}, {userName} 📖
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {subtitleTexts[language] || subtitleTexts.pt}
          </p>
          {!isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
              <Crown className="w-4 h-4" />
              <span>{currentMonthJournalCount}/{limits.maxJournalEntriesPerMonth} {t("journal.entries")} {t("journal.thisMonth") || "este mês"}</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-2xl border-border/40 animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {currentEntryId ? (t("journal.editEntry") || "Editar Entrada") : (t("journal.newEntry"))}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              <Input
                placeholder={t("journal.entryTitle") + " (" + t("journal.optional") + ")" || "Título (opcional)"}
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                className="text-lg font-medium border-none focus-visible:ring-0 bg-transparent"
              />
              <Textarea
                placeholder={placeholderTexts[language] || placeholderTexts.pt}
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                className="min-h-[300px] md:min-h-[400px] resize-none text-base leading-relaxed border-none focus-visible:ring-0 bg-transparent"
              />
              <div className="flex justify-end pt-4 border-t border-border/40">
                <Button
                  onClick={handleSaveEntry}
                  disabled={isSaving}
                  className="rounded-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? (t("journal.saving") || "Salvando...") : (t("journal.save"))}
                </Button>
              </div>

              {showBloomia && savedContent && (
                <BloomiaJournalResponse
                  journalContent={savedContent}
                  onClose={() => setShowBloomia(false)}
                />
              )}
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <Card className="rounded-2xl border-border/40">
              <CardHeader>
                <h3 className="text-lg font-semibold">{t("journal.calendar") || "Calendário"} 📅</h3>
                <p className="text-xs text-muted-foreground">{t("journal.clickDay") || "Clique em um dia para ver ou editar"}</p>
              </CardHeader>
              <CardContent className="p-2 md:p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-xl w-full"
                  modifiers={{
                    hasEntry: (date) => hasEntryOnDate(date),
                  }}
                  modifiersStyles={{
                    hasEntry: {
                      backgroundColor: 'hsl(var(--primary) / 0.2)',
                      borderRadius: '50%',
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/40">
              <CardHeader>
                <h3 className="text-lg font-semibold">{t("journal.previousEntries") || "Entradas Anteriores"} 📖</h3>
                <p className="text-sm text-muted-foreground">{t("journal.savedReflections") || "Suas reflexões guardadas com carinho"}</p>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                {entries.length > 0 ? (
                  entries.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 md:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer"
                      onClick={() => {
                        const date = new Date(entry.created_at);
                        setSelectedDate(date);
                      }}
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        {new Date(entry.created_at).toLocaleDateString(getDateLocale(), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {entry.title && (
                        <p className="text-sm font-medium mb-1">{entry.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.content.substring(0, 60)}...
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-muted-foreground">
                      {t("journal.noEntries")} 🌸
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </DashboardLayout>

      <PremiumUpgradePopup 
        isOpen={showPremiumPopup} 
        onClose={() => setShowPremiumPopup(false)} 
      />
    </>
  );
};

export default Journal;
