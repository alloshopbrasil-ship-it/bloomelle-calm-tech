import React, { useState } from 'react';
import StreakCard from '@/components/StreakCard';
import { WeeklyVisualCalendar } from '@/components/VisualCalendarSystem';
import { Calendar } from '@/components/ui/calendar';
import DailyEntryModal from '@/components/DailyEntryModal';
import { DailyEntry, UserStreak } from '@/types/bloomelle';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isSameDay } from 'date-fns';

const BloomelleDashboard = () => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [streak, setStreak] = useState<UserStreak>({
    currentStreak: 12,
    longestStreak: 24,
    weeklyStatus: [true, true, true, false, false, false, false]
  });

  const [entries, setEntries] = useState<DailyEntry[]>([
    { id: '1', date: '2026-03-15', completed: true, imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' }
  ]);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (data: { imageUrl: string; note: string }) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Update or Add Entry
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
    
    // Update Streak
    if (isSameDay(selectedDate, new Date())) {
      setStreak(prev => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        weeklyStatus: prev.weeklyStatus.map((s, i) => i === selectedDate.getDay() ? true : s)
      }));
    }

    toast({
      title: "Registro salvo! ✨",
      description: "Sua jornada visual foi atualizada.",
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto space-y-8">
          
          <section className="animate-fade-in">
            <StreakCard 
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
              weeklyStatus={streak.weeklyStatus}
            />
          </section>

          {/* Carrossel Semanal Horizontal */}
          <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xs text-gray-400 uppercase font-bold mb-2 ml-2">Sua semana</h2>
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-50 p-2">
              <WeeklyVisualCalendar entries={entries} onDayClick={handleDayClick} />
            </div>
          </section>

          {/* Grade Mensal Visual (Reutilizando o Calendar UI) */}
          <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 p-6">
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

      <DailyEntryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        date={selectedDate}
      />
      
      <Footer />
    </div>
  );
};

export default BloomelleDashboard;