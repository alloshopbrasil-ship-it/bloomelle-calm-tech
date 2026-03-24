import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { BookOpen, Save, Crown, Sparkles, ImagePlus, X, Loader2 } from "lucide-react";
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
import { uploadJournalImage } from "@/utils/imageUpload";
import { useSearchParams } from "react-router-dom";

const Journal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isPremium, canAddJournalEntry, currentMonthJournalCount, limits } = usePlanLimits();
  const { isOpen: showToolWelcome, closeToolWelcome } = useToolWelcome("journal");
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || t("dashboard.welcome");
  
  const [searchParams, setSearchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dateParam ? new Date(dateParam + 'T12:00:00') : new Date()
  );
  const [journalEntry, setJournalEntry] = useState("");
  const [journalTitle, setJournalTitle] = useState("");
  const [entries, setEntries] = useState<Array<{ id: string; title: string | null; content: string; created_at: string; images: string[] | null }>>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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
      .select("id, title, content, created_at, images")
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
      setImages(data.images || []);
    } else {
      setJournalTitle("");
      setJournalEntry("");
      setCurrentEntryId(null);
      setImages([]);
    }
    setPendingFiles([]);
    setPreviewUrls([]);
  };

  const handleSaveEntry = async () => {
    if (!user || (!journalEntry.trim() && pendingFiles.length === 0 && images.length === 0)) {
      toast({
        title: t("journal.writeFirst") || "Escreva algo primeiro 💫",
        description: t("journal.waitingThoughts") || "Seu diário está esperando seus pensamentos ou fotos.",
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
      // Upload pending images
      const uploadedUrls: string[] = [];
      for (const file of pendingFiles) {
        const url = await uploadJournalImage(file, user.id);
        if (url) uploadedUrls.push(url);
      }
      
      const finalImages = [...images, ...uploadedUrls];

      if (currentEntryId) {
        const { error } = await supabase
          .from("journal_entries")
          .update({
            title: journalTitle || null,
            content: journalEntry,
            images: finalImages,
          })
          .eq("id", currentEntryId);

        if (error) throw error;
      } else {
        const dateStr = selectedDate ? selectedDate.toISOString() : new Date().toISOString();
        const { error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            title: journalTitle || null,
            content: journalEntry,
            images: finalImages,
            created_at: dateStr,
          });

        if (error) throw error;
      }

      toast({
        title: t("journal.saved") || "Reflexão salva! 🌸",
        description: t("journal.savedDesc") || "Sua entrada foi registrada com carinho.",
      });

      setSavedContent(journalEntry);
      setShowBloomia(true);
      setImages(finalImages);
      setPendingFiles([]);
      setPreviewUrls([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPendingFiles(prev => [...prev, ...filesArray]);
      
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeSavedImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setSearchParams({ date: date.toISOString().split('T')[0] });
    } else {
      setSearchParams({});
    }
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
                className="min-h-[200px] md:min-h-[300px] resize-none text-base leading-relaxed border-none focus-visible:ring-0 bg-transparent"
              />
              
              {/* Image Previews */}
              {(images.length > 0 || previewUrls.length > 0) && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {images.map((url, i) => (
                    <div key={`saved-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                      <img src={url} alt="Saved" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeSavedImage(i)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                  {previewUrls.map((url, i) => (
                    <div key={`pending-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover opacity-80" />
                      <button 
                        onClick={() => removePendingFile(i)}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <div>
                  <input
                    type="file"
                    id="journal-image-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full text-muted-foreground hover:text-primary"
                    onClick={() => document.getElementById('journal-image-upload')?.click()}
                  >
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Adicionar fotos
                  </Button>
                </div>
                
                <Button
                  onClick={handleSaveEntry}
                  disabled={isSaving}
                  className="rounded-full"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                  onSelect={handleSelectDate}
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
                        handleSelectDate(date);
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
