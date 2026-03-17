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
    <div className="flex justify-between items-center w-full py-2">
      {weekDays.map((day) => {
        const entry = entries.find((e) => isSameDay(new Date(e.date + 'T00:00:00'), day));
        const isSelected = isSameDay(day, selectedDate);
        
        return (
          <button
            key={day.toString()}
            onClick={() => onDayClick(day)}
            className="flex flex-col items-center space-y-2 flex-1"
          >
            <span className="text-[10px] font-bold text-gray-400 lowercase">
              {format(day, 'eee', { locale: ptBR }).slice(0, 1)}
            </span>
            
            <div className={cn(
              "aspect-square w-11 h-11 rounded-full flex items-center justify-center relative transition-all duration-300 overflow-hidden",
              isSelected ? "ring-2 ring-[#E58B8B] ring-offset-2" : "border border-gray-100 bg-gray-50"
            )}>
              {entry?.imageUrl ? (
                <img 
                  src={entry.imageUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className={cn(
                  "text-xs font-medium",
                  isSelected ? "text-[#E58B8B]" : "text-gray-400"
                )}>
                  {format(day, 'd')}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};