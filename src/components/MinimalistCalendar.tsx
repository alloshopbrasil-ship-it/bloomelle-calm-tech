"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

const MinimalistCalendar = () => {
  // Data de exemplo: 16 de Março de 2026
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 2, 16));

  return (
    <div className="flex items-center justify-center w-full min-h-[450px] bg-white p-8">
      <div className="w-full max-w-[320px]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          showOutsideDays={true}
          className="p-0"
        />
      </div>
    </div>
  );
};

export default MinimalistCalendar;