"use client";

import React, { useState } from 'react';

const ModernCalendar = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = 31;
  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  
  // Março de 2026 começa em um Domingo (index 0)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
        
        {/* Título do Mês */}
        <header className="text-center mb-8">
          <h2 className="text-2xl font-light text-gray-800 lowercase tracking-tight">
            março 2026
          </h2>
        </header>

        {/* Grid de Dias da Semana */}
        <div className="grid grid-cols-7 mb-4">
          {weekdays.map((day) => (
            <div 
              key={day} 
              className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest pb-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de Dias do Mês */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                aspect-square flex items-center justify-center text-sm md:text-base
                rounded-full transition-all duration-200 ease-in-out
                ${selectedDay === day 
                  ? 'bg-[#ff4fa3] text-white shadow-lg scale-105' 
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      <p className="mt-6 text-xs text-gray-400 font-light">
        {selectedDay ? `Dia ${selectedDay} selecionado` : 'Selecione um dia para florescer 🌸'}
      </p>
    </div>
  );
};

export default ModernCalendar;