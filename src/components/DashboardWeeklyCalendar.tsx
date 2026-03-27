import React, { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface JournalEntryLite {
  id: string;
  created_at: string;
  images?: string[] | null;
}

interface DashboardWeeklyCalendarProps {
  completedDays?: Date[];
}

export const DashboardWeeklyCalendar = ({ completedDays = [] }: DashboardWeeklyCalendarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date();
  const startDate = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
  const [entries, setEntries] = useState<JournalEntryLite[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchEntries = async () => {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = addDays(startDate, 6).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('journal_entries')
        .select('id, created_at, images')
        .eq('user_id', user.id)
        .gte('created_at', startStr)
        .lte('created_at', endStr + 'T23:59:59');
        
      if (data) setEntries(data);
    };
    
    fetchEntries();
  }, [user]);

  return (
    <div className="w-full grid grid-cols-7 gap-1 items-center py-2 px-0 mb-6 sm:px-1 sm:gap-2">
      {weekDays.map((day) => {
        const isToday = isSameDay(day, today);
        const isCompleted = completedDays.some(d => isSameDay(d, day));
        const dayLetter = format(day, 'E', { locale: ptBR }).charAt(0).toUpperCase();
        const dayNumber = format(day, 'd');
        
        const entryForDay = entries.find(e => isSameDay(new Date(e.created_at), day));
        const thumbnail = entryForDay?.images?.[0];
        
        return (
          <button 
            key={day.toString()} 
            onClick={() => navigate(`/dashboard/journal?date=${format(day, 'yyyy-MM-dd')}`)}
            className={cn(
              "flex flex-col items-center justify-center rounded-[24px] py-2 px-0 transition-all w-full hover:bg-muted group/daybtn",
              isToday ? "border-[1.5px] border-primary/20 shadow-sm bg-background" : "border-[1.5px] border-transparent"
            )}
          >
            <span className={cn(
              "text-xs font-medium mb-3",
              isToday ? "text-primary" : "text-muted-foreground/50"
            )}>
              {dayLetter}
            </span>
            
            <div className={cn(
              "relative flex items-center justify-center w-11 h-11 rounded-full overflow-hidden shrink-0 transition-transform group-hover/daybtn:scale-105",
              isCompleted && !thumbnail
                ? "bg-primary text-primary-foreground shadow-sm" 
                : isToday && !thumbnail
                  ? "border-[2px] border-primary text-foreground" 
                  : "bg-transparent text-muted-foreground/60"
            )}>
              {thumbnail ? (
                <>
                  <img src={thumbnail} alt="Day" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                      <span className="font-semibold text-[15px] text-white drop-shadow-md">
                        {dayNumber}
                      </span>
                    )}
                  </div>
                </>
              ) : isCompleted ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : (
                <span className="font-semibold text-[15px]">
                  {dayNumber}
                </span>
              )}
            </div>
            
            {/* Dot indicator if has text entry but no image */}
            {entryForDay && !thumbnail && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 opacity-70" />
            )}
            {/* To keep height stable when there is no dot */}
            {(!entryForDay || thumbnail) && (
              <div className="w-1.5 h-1.5 mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};
