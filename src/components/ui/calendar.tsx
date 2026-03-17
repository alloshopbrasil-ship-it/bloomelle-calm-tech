"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayProps, useDayRender } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { isSameDay } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DailyEntry } from "@/types/bloomelle";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  entries?: DailyEntry[];
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  entries = [],
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      className={cn("p-3", className)}
      formatters={{
        formatCaption: (date) => {
          const month = date.toLocaleString('pt-BR', { month: 'long' }).toLowerCase();
          const year = date.getFullYear();
          return `${month} ${year}`;
        },
        formatWeekdayName: (date) => {
          return date.toLocaleString('pt-BR', { weekday: 'short' }).slice(0, 3).toLowerCase();
        }
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Day: (dayProps: DayProps) => {
          const { date, displayMonth } = dayProps;
          const buttonRef = React.useRef<HTMLButtonElement>(null);
          const dayRender = useDayRender(date, displayMonth, buttonRef);
          
          if (dayRender.isHidden) return <div className="h-10 w-10" />;

          const entry = entries.find((e) => isSameDay(new Date(e.date + 'T00:00:00'), date));
          const isSelected = dayRender.activeModifiers.selected;
          const isToday = dayRender.activeModifiers.today;

          return (
            <button
              {...dayRender.buttonProps}
              ref={buttonRef}
              className={cn(
                "h-10 w-10 p-0 font-normal flex items-center justify-center rounded-full transition-all relative overflow-hidden group",
                isSelected ? "bg-[#E58B8B] text-white" : "hover:bg-[#F0E6FF] text-gray-700",
                isToday && !isSelected ? "border-2 border-[#E58B8B] text-[#E58B8B]" : "",
                dayRender.activeModifiers.outside ? "opacity-30" : ""
              )}
            >
              {entry?.imageUrl ? (
                <>
                  <img 
                    src={entry.imageUrl} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover rounded-full" 
                  />
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-white rounded-full z-10" />
                  )}
                </>
              ) : (
                <span className="relative z-10">{date.getDate()}</span>
              )}
            </button>
          );
        }
      }}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
        month: "space-y-6",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium text-gray-700",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1 mx-auto",
        head_row: "flex justify-between",
        head_cell: "text-gray-400 w-10 font-normal text-[0.75rem] uppercase tracking-tighter text-center",
        row: "flex w-full mt-2 justify-between",
        cell: "h-10 w-10 text-center text-sm p-0 relative",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };