import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Flame } from "lucide-react";
import { format, startOfWeek, addDays, isPast, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak?: number;
  longestStreak?: number;
  startDate?: Date;
  activeDaysThisWeek?: number[]; // Array of indices (0-6) of active days this week
}

export const StreakModal = ({ 
  isOpen, 
  onClose,
  currentStreak = 0,
  longestStreak = 0,
  startDate = new Date(),
  activeDaysThisWeek = []
}: StreakModalProps) => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const today = new Date();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/40 shadow-xl rounded-[32px]">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center flex-shrink-0 shadow-inner mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-orange-200/20 rounded-full animate-pulse-slow"></div>
            <Flame className="w-12 h-12 text-orange-500 relative z-10 fill-orange-500 animate-float" strokeWidth={1.5} />
          </div>

          <h2 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 mb-2">
            {currentStreak}
          </h2>
          <p className="text-lg font-medium text-muted-foreground mb-8">Dias de Ofensiva</p>

          <div className="w-full flex justify-between items-center py-4 border-y border-border/40 mb-8">
            <div className="flex-1 text-center">
              <p className="font-semibold text-foreground">{format(startDate, "dd MMM, yyyy", { locale: ptBR })}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Início</p>
            </div>
            <div className="w-px h-10 bg-border/60 mx-4"></div>
            <div className="flex-1 text-center">
              <p className="font-semibold text-foreground">{longestStreak}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Recorde</p>
            </div>
          </div>

          <div className="w-full bg-muted/30 rounded-2xl p-5 border border-border/40">
            <p className="text-sm font-medium text-left mb-4 px-1 text-foreground/80">Nesta semana</p>
            <div className="flex justify-between items-center">
              {weekDays.map((day, index) => {
                const isActive = activeDaysThisWeek.includes(index);
                const isFutureDay = !isSameDay(day, today) && !isPast(day);
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {format(day, 'E', { locale: ptBR }).charAt(0)}
                    </span>
                    
                    {isActive ? (
                      <Flame className="w-6 h-6 text-orange-500 fill-orange-500 drop-shadow-sm" />
                    ) : isFutureDay ? (
                      <div className="w-6 h-6 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center">
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
