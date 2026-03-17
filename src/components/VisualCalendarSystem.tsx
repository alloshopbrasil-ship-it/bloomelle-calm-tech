import React from 'react';
import { Check, Plus } from 'lucide-react';
import { DailyEntry } from '@/types/bloomelle';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisualCalendarProps {
  entries: DailyEntry[];
  onDayClick: (date: Date) => void;
}

export const WeeklyVisualCalendar = ({ entries, onDayClick }: VisualCalendarProps) => {
  const today = new Date();
  const weekDays = eachDayOfInterval({
    start: startOfWeek(today, { weekStartsOn: 0 }),
    end: endOfWeek(today, { weekStartsOn: 0 }),
  });

  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-4 px-2 min-w-max">
        {weekDays.map((day) => {
          const entry = entries.find(e => isSameDay(new Date(e.date), day));
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className="flex flex-col items-center gap-2 group"
            >
              <span className="text-[10px] text-gray-400 lowercase font-medium">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <div className={`
                w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all
                ${isToday ? 'border-[#E58B8B]' : 'border-transparent bg-gray-50'}
                ${!entry && !isToday ? 'hover:bg-[#F0E6FF]' : ''}
              `}>
                {entry?.imageUrl ? (
                  <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : entry?.completed ? (
                  <Check className="w-6 h-6 text-[#E58B8B]" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-300 group-hover:text-[#E58B8B]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const MonthlyVisualGrid = ({ entries, onDayClick }: VisualCalendarProps) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-light text-gray-800 lowercase text-center">
        {format(today, 'MMMM yyyy', { locale: ptBR })}
      </h3>
      <div className="grid grid-cols-7 gap-y-4 justify-items-center">
        {['d', 's', 't', 'q', 'q', 's', 's'].map((d, i) => (
          <span key={i} className="text-[10px] text-gray-300 uppercase font-bold">{d}</span>
        ))}
        {days.map((day) => {
          const entry = entries.find(e => isSameDay(new Date(e.date), day));
          const isToday = isSameDay(day, today);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all overflow-hidden
                ${isToday && !entry ? 'border-2 border-[#E58B8B] text-[#E58B8B]' : 'text-gray-600'}
                ${!entry ? 'hover:bg-[#F0E6FF]' : ''}
              `}
            >
              {entry?.imageUrl ? (
                <img src={entry.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : entry?.completed ? (
                <div className="w-full h-full bg-[#E58B8B] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : (
                format(day, 'd')
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};