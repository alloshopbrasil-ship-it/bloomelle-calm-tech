import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DailyEntry } from '@/types/bloomelle';

interface HorizontalWeeklyCalendarProps {
  entries: DailyEntry[];
  selectedDate: Date;
  onDayClick: (date: Date) => void;
}

export const HorizontalWeeklyCalendar = ({ entries, selectedDate, onDayClick }: HorizontalWeeklyCalendarProps) => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="flex justify-between items-center w-full py-4 px-2 overflow-x-auto no-scrollbar">
      {weekDays.map((day) => {
        const entry = entries.find((e) => isSameDay(new Date(e.date + 'T00:00:00'), day));
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());

        return (
          <button
            key={day.toString()}
            onClick={() => onDayClick(day)}
            className="flex flex-col items-center space-y-2 min-w-[50px] transition-all"
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              {format(day, 'eee', { locale: ptBR }).slice(0, 3).toLowerCase()}
            </span>
            
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center relative transition-all duration-300",
              isSelected ? "ring-2 ring-[#E58B8B] ring-offset-2" : "",
              !entry?.imageUrl && !isSelected ? "bg-gray-50 border border-gray-100" : "",
              isToday && !entry?.imageUrl && !isSelected ? "border-[#E58B8B]/30 bg-[#F0E6FF]/20" : ""
            )}>
              {entry?.imageUrl ? (
                <img 
                  src={entry.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-[#E58B8B]" : "text-gray-400",
                  isToday ? "text-[#E58B8B]" : ""
                )}>
                  {format(day, 'd')}
                </span>
              )}
              
              {isToday && !entry?.imageUrl && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#E58B8B] rounded-full animate-pulse" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};