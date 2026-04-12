import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DailyEntry } from "@/types/bloomelle";
import { isSameDay } from "date-fns";

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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium text-gray-600 lowercase",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between",
        head_cell: "text-gray-400 rounded-md w-9 font-bold text-[10px] uppercase tracking-tighter",
        row: "flex w-full justify-between mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full transition-all flex items-center justify-center overflow-hidden"
        ),
        day_selected: "ring-2 ring-[#E58B8B] ring-offset-1 text-gray-900",
        day_today: "bg-gray-50 text-[#E58B8B] font-bold",
        day_outside: "text-gray-300 opacity-50",
        day_disabled: "text-gray-300 opacity-50",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        DayContent: ({ date }) => {
          const entry = entries.find((e) => isSameDay(new Date(e.date + 'T00:00:00'), date));
          if (entry?.imageUrl) {
            return (
              <img 
                src={entry.imageUrl} 
                alt="" 
                className="w-full h-full object-cover aspect-square" 
              />
            );
          }
          return <span>{date.getDate()}</span>;
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };