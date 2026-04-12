import React, { useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export interface JournalEntryLite {
  id: string;
  created_at: string;
  images?: string[] | null;
}

interface JournalHorizontalCalendarProps {
  entries: JournalEntryLite[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
  startDate?: Date; // Define how many days or weeks to show. Default to 2 weeks ago
}

export const JournalHorizontalCalendar = ({ 
  entries, 
  selectedDate = new Date(), 
  onSelectDate,
  startDate = addDays(new Date(), -14)
}: JournalHorizontalCalendarProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Create an array of 30 days starting from `startDate`
  const days = Array.from({ length: 30 }).map((_, i) => addDays(startDate, i));

  // Auto-scroll to selected date on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const selectedElement = scrollContainerRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDate]);

  return (
    <div className="relative w-full mb-6 group">
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-3 pb-2 pt-1 px-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          // Find if there's an entry for this day
          const entryForDay = entries.find(e => isSameDay(new Date(e.created_at), day));
          const hasImage = entryForDay?.images && entryForDay.images.length > 0;
          const thumbnail = hasImage ? entryForDay.images![0] : null;
          
          const dayLetter = format(day, 'E', { locale: ptBR }).charAt(0).toUpperCase();
          const dayNumber = format(day, 'd');
          
          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              data-selected={isSelected}
              className={cn(
                "relative flex flex-col items-center justify-center snap-center transition-all min-w-[64px] rounded-[24px] py-3 px-2 border-2",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md scale-105 z-10" 
                  : isCurrentDay
                    ? "border-primary/50 hover:bg-muted"
                    : "border-transparent hover:bg-muted"
              )}
            >
              <span className={cn(
                "text-[11px] font-bold mb-3 uppercase tracking-wider",
                isSelected || isCurrentDay ? "text-primary" : "text-muted-foreground/60"
              )}>
                {dayLetter}
              </span>
              
              <div className={cn(
                "relative flex items-center justify-center w-14 h-14 rounded-full overflow-hidden shrink-0",
                isSelected && !thumbnail ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                isSelected && thumbnail && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}>
                {thumbnail ? (
                  <>
                    <img 
                      src={thumbnail} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <span className="font-bold text-white text-lg drop-shadow-md">
                        {dayNumber}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className={cn(
                    "font-bold text-lg",
                    isSelected ? "text-primary-foreground" : "text-foreground/70"
                  )}>
                    {dayNumber}
                  </span>
                )}
              </div>
              
              {/* Dot indicator if has text entry but no image */}
              {entryForDay && !hasImage && (
                <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Gradients to indicate scrollable area */}
      <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};
