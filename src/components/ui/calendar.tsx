"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
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
        cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-full transition-colors hover:bg-gray-50"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#E58B8B] text-white hover:bg-[#E58B8B] hover:text-white focus:bg-[#E58B8B] focus:text-white rounded-full shadow-sm",
        day_today: "text-primary font-bold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };