"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR, enUS, es, fr, de } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const localeMap: Record<Language, any> = {
  pt: ptBR,
  en: enUS,
  es: es,
  fr: fr,
  de: de,
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents,
  ...props
}: CalendarProps) {
  const { language } = useLanguage();
  const locale = localeMap[language as Language] || ptBR;

  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4 w-full justify-center",
    month: "w-full space-y-4 flex flex-col items-center",
    month_caption: "relative flex h-10 items-center justify-center z-20 w-full mb-4",
    caption_label: "text-base md:text-xl font-medium",
    nav: "absolute top-0 flex w-full justify-between z-10 px-2",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-10 md:size-12 text-muted-foreground/80 hover:text-foreground p-0 rounded-full",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-10 md:size-12 text-muted-foreground/80 hover:text-foreground p-0 rounded-full",
    ),
    month_grid: "w-full border-collapse max-w-4xl mx-auto",
    weekdays: "flex w-full justify-between",
    weekday: "flex-1 p-0 text-xs md:text-sm font-medium text-muted-foreground/80 text-center uppercase tracking-wider",
    week: "flex w-full mt-2 justify-between",
    day: "flex-1 group p-0 text-sm md:text-base text-center relative flex justify-center",
    day_button: cn(
      "relative flex aspect-square w-full max-w-[60px] items-center justify-center whitespace-nowrap rounded-xl p-0 text-foreground outline-offset-2 transition-all duration-200",
      "size-9 sm:size-11 md:size-14 lg:size-16", // Tamanho cresce conforme a tela
      "hover:bg-primary/20 focus:outline-none focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70",
      "group-data-[selected]:bg-primary group-data-[selected]:text-primary-foreground group-data-[selected]:shadow-bloom group-data-[selected]:scale-110",
      "group-data-[disabled]:pointer-events-none group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through",
      "group-data-[outside]:text-foreground/30"
    ),
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today: cn(
      "relative after:pointer-events-none after:absolute after:bottom-2 after:start-1/2 after:z-10 after:size-[5px] after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-colors",
      "group-data-[selected]:after:bg-white"
    ),
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
  };

  const mergedClassNames: any = Object.keys(defaultClassNames).reduce(
    (acc, key) => ({
      ...acc,
      [key]: classNames?.[key as keyof typeof classNames]
        ? cn(
            defaultClassNames[key as keyof typeof defaultClassNames],
            classNames[key as keyof typeof classNames],
          )
        : defaultClassNames[key as keyof typeof defaultClassNames],
    }),
    {} as any,
  );

  const defaultComponents = {
    Chevron: (props: any) => {
      if (props.orientation === "left") {
        return <ChevronLeft className="size-5 md:size-6" strokeWidth={2} {...props} aria-hidden="true" />;
      }
      return <ChevronRight className="size-5 md:size-6" strokeWidth={2} {...props} aria-hidden="true" />;
    },
  };

  const mergedComponents = {
    ...defaultComponents,
    ...userComponents,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full flex justify-center", className)}
      classNames={mergedClassNames}
      components={mergedComponents}
      locale={locale}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };