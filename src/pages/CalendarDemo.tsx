"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

export default function CalendarDemo() {
  // Definindo a data inicial para Março de 2026 para visualização do objetivo
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 2, 16));

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#fafafa] p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-gray-900 mb-2">Seu Calendário</h1>
          <p className="text-sm text-muted-foreground">Escolha um dia para florescer 🌸</p>
        </div>
        
        <Card className="border-none shadow-soft bg-white rounded-[32px] overflow-hidden p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={new Date(2026, 2)}
            className="mx-auto"
          />
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-light uppercase tracking-widest">
            Design Minimalista • Bloomelle
          </p>
        </div>
      </div>
    </div>
  );
}