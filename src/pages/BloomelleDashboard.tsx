import React, { useState, useEffect, useCallback } from 'react';
import StreakCard from '@/components/StreakCard';
import { HorizontalWeeklyCalendar } from '@/components/HorizontalWeeklyCalendar';
import { Calendar } from '@/components/ui/calendar';
import { DailyEntryDrawer } from '@/components/DailyEntryDrawer';
import { DailyEntry } from '@/types/bloomelle';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { uploadJournalImage, getSignedImageUrl } from '@/utils/imageUpload';
import { isSameDay, format, startOfWeek, addDays } from 'date-fns';
import { useStreak } from '@/hooks/useStreak';

const BloomelleDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const { currentStreak, longestStreak, loading: streakLoading } = useStreak();

  // Compute weekly status from entries
  const getWeeklyStatus = useCallback((): boolean[] => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, i) => {
      const day = addDays(start, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      return entries.some(e => e.date === dayStr);
    });
  }, [entries]);

  // Load entries from journal_entries table
  const loadEntries = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('id, content, created_at, images, title')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading entries:', error);
      return;
    }

    if (!data) return;

    // Convert journal_entries to DailyEntry format with signed URLs
    const converted: DailyEntry[] = await Promise.all(
      data.map(async (entry) => {
        const dateStr = entry.created_at ? entry.created_at.split('T')[0] : '';
        const storagePath = entry.images?.[0] || null;
        let signedUrl: string | null = null;

        if (storagePath) {
          signedUrl = await getSignedImageUrl(storagePath);
        }

        return {
          id: entry.id,
          date: dateStr,
          completed: true,
          imageUrl: signedUrl || undefined,
          storagePath: storagePath || undefined,
          signedUrl: signedUrl || undefined,
          note: entry.content || undefined,
        };
      })
    );

    setEntries(converted);
  }, [user]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    
    // Check if there's an existing entry for this date
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = entries.find(e => e.date === dateStr);
    setEditingEntry(existing || null);
    setIsDrawerOpen(true);
  };

  const handleSaveEntry = async (data: { imageFile?: File; note: string }) => {
    if (!user) return;
    setIsSaving(true);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      let storagePath: string | null = editingEntry?.storagePath || null;

      // Upload new image if provided
      if (data.imageFile) {
        const path = await uploadJournalImage(data.imageFile, user.id);
        if (path) {
          storagePath = path;
        }
      }

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('journal_entries')
          .update({
            content: data.note,
            images: storagePath ? [storagePath] : null,
          })
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new entry
        const { error } = await supabase
          .from('journal_entries')
          .insert({
            user_id: user.id,
            content: data.note || '',
            title: `Registro de ${dateStr}`,
            images: storagePath ? [storagePath] : null,
            created_at: new Date(dateStr + 'T12:00:00').toISOString(),
          });

        if (error) throw error;
      }

      await loadEntries();
      setIsDrawerOpen(false);

      toast({
        title: editingEntry ? "Registro atualizado! ✨" : "Momento registrado! ✨",
        description: editingEntry 
          ? "Sua entrada foi atualizada com sucesso."
          : "Sua foto agora brilha em seus calendários.",
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-24 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <header className="px-2">
            <h1 className="text-3xl font-light text-gray-800 lowercase">olá, bloomelle 🌸</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">seu progresso visual</p>
          </header>

          {/* 1. Calendário Semanal */}
          <section className="bg-white rounded-[32px] shadow-sm border border-gray-50 p-4">
            <HorizontalWeeklyCalendar 
              entries={entries} 
              selectedDate={selectedDate} 
              onDayClick={handleDayClick} 
            />
          </section>

          {/* 2. Streak Card */}
          <section>
            <StreakCard 
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              weeklyStatus={getWeeklyStatus()}
            />
          </section>

          {/* 3. Calendário Mensal */}
          <section>
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-6">
              <h2 className="text-[10px] text-gray-400 uppercase font-bold mb-4 ml-2 tracking-widest">jornada mensal</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDayClick}
                entries={entries}
                className="p-0"
              />
            </div>
          </section>
        </div>
      </main>

      <DailyEntryDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveEntry}
        date={selectedDate}
        existingEntry={editingEntry}
        isSaving={isSaving}
      />
      
      <Footer />
    </div>
  );
};

export default BloomelleDashboard;
