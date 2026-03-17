"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <Card className="w-full max-w-sm mx-auto rounded-2xl border-border/40 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg"
        />
        <p
          className="mt-4 text-center text-xs text-muted-foreground"
          role="region"
          aria-live="polite"
        >
          Calendário Bloomelle — Selecione uma data 🌸
        </p>
      </CardContent>
    </Card>
  );
}