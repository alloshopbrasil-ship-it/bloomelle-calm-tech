import React, { useState } from 'react';
import StreakCard from '@/components/StreakCard';
import { HorizontalWeeklyCalendar } from '@/components/HorizontalWeeklyCalendar';
import { Calendar } from '@/components/ui/calendar';
import { DailyEntryDrawer } from '@/components/DailyEntryDrawer';
import { DailyEntry, UserStreak } from '@/types/bloomelle';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BloomelleDashboard = () => {
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Estado Único de Entradas (Shared State)
  const [entries, setEntries] = useState<DailyEntry[]>([
    { id: '1', date: '2024-03-20', completed: true, imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop' }
  ]);

  const [streak] = useState<UserStreak>({
    currentStreak: 12,
    longestStreak: 24,
    weeklyStatus: [true, true, true, false, false, false, false]
  });

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  const handleSaveEntry = (data: { imageUrl: string; note: string }) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== dateStr);
      return [...filtered, {
        id: Math.random().toString(36).substr(2, 9),
        date: dateStr,
        imageUrl: data.imageUrl,
        note: data.note,
        completed: true
      }];
    });

    toast({
      title: "Momento registrado! ✨",
      description: "Sua foto agora brilha em seus calendários.",
    });
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

          {/* 1. Calendário Semanal (Entre Header e Streak) */}
          <section className="bg-white rounded-[32px] shadow-sm border border-gray-50 p-4">
            <HorizontalWeeklyCalendar 
              entries={entries} 
              selectedDate={selectedDate} 
              onDayClick={handleDayClick} 
            />
          </section>

          {/* 2. Streak Card (Com ícone de Check) */}
          <section>
            <StreakCard 
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              weeklyStatus={streak.weeklyStatus}
            />
          </section>

          {/* 3. Calendário Mensal (Sincronizado) */}
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
      />
      
      <Footer />
    </div>
  );
};

export default BloomelleDashboard;