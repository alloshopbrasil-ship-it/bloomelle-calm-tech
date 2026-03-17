"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const MinimalistCalendar = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 2, 16));

  return (
    <div className="flex items-center justify-center w-full min-h-[500px] bg-white p-4">
      <div className="w-[320px]">
        <style dangerouslySetInnerHTML={{ __html: `
          /* Customização do Header */
          .rdp-caption_label {
            text-transform: lowercase !important;
            font-weight: 500 !important;
            font-size: 1.1rem !important;
            color: #444 !important;
          }
          
          /* Customização dos Dias da Semana */
          .rdp-head_cell {
            text-transform: lowercase !important;
            font-weight: 400 !important;
            color: #999 !important;
            font-size: 0.85rem !important;
            padding-bottom: 1.5rem !important;
          }

          /* Grid e Espaçamento */
          .rdp-month {
            margin: 0 !important;
          }
          .rdp-table {
            max-width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 8px !important;
          }

          /* Estilização do Dia Selecionado (O "Expert" Touch) */
          .rdp-day_selected {
            background-color: #F0E6FF !important; /* Quadrado Lilás Pálido */
            color: white !important;
            position: relative !important;
            border-radius: 0 !important; /* Mantém o fundo quadrado */
          }

          .rdp-day_selected::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 34px;
            height: 34px;
            background-color: #E58B8B !important; /* Círculo Coral/Rosa */
            border-radius: 50% !important;
            z-index: 1;
          }

          /* Garante que o número fique acima do círculo */
          .rdp-day_selected .rdp-day_button {
            position: relative !important;
            z-index: 2 !important;
            color: white !important;
          }

          /* Dias fora do mês */
          .rdp-day_outside {
            color: #ddd !important;
            opacity: 1 !important;
          }

          /* Botões de Navegação */
          .rdp-nav_button {
            background-color: #fcfcfc !important;
            border: none !important;
            color: #ccc !important;
          }
          .rdp-nav_button:hover {
            background-color: #f5f5f5 !important;
          }
        `}} />
        
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          showOutsideDays={true}
          className={cn(
            "rounded-none border-none p-0",
            "font-sans"
          )}
          classNames={{
            day: "h-11 w-11 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-50 rounded-none transition-colors",
            day_today: "bg-transparent text-foreground",
            nav: "flex items-center justify-between absolute w-full px-1",
            caption: "flex justify-center items-center pt-1 relative mb-8",
          }}
        />
      </div>
    </div>
  );
};

export default MinimalistCalendar;