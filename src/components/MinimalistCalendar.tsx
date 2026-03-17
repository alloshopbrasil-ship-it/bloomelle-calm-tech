"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MinimalistCalendar = () => {
  // Definindo o dia 16 como selecionado por padrão para igualar a imagem
  const [selectedDay, setSelectedDay] = useState<number | null>(16);

  const daysInMarch = Array.from({ length: 31 }, (_, i) => i + 1);
  const nextMonthDays = [1, 2, 3, 4];
  const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

  return (
    <div 
      className="calendar-wrapper" 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        minHeight: '500px',
        padding: '20px',
        backgroundColor: '#fff'
      }}
    >
      <div 
        className="calendar" 
        style={{
          width: '300px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Cabeçalho com Setas */}
        <header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '30px'
        }}>
          <button style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#fcfcfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ccc'
          }}>
            <ChevronLeft size={18} />
          </button>

          <h2 style={{ 
            fontSize: '1.1rem', 
            fontWeight: 500, 
            color: '#444', 
            margin: 0,
            textTransform: 'lowercase'
          }}>
            março 2026
          </h2>

          <button style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#fcfcfc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ccc'
          }}>
            <ChevronRight size={18} />
          </button>
        </header>

        {/* Dias da semana */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: '15px'
        }}>
          {weekdays.map((day) => (
            <div 
              key={day} 
              style={{
                fontSize: '0.85rem',
                color: '#999',
                textTransform: 'lowercase',
                paddingBottom: '10px'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de Dias */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          rowGap: '8px'
        }}>
          {/* Dias de Março */}
          {daysInMarch.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <div 
                key={`march-${day}`}
                style={{
                  position: 'relative',
                  aspectRatio: '1/1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? '#e8e1f5' : 'transparent', // Fundo quadrado lavanda
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedDay(day)}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: isSelected ? '#d6828c' : 'transparent', // Círculo rosa
                  color: isSelected ? '#white' : '#555',
                  fontSize: '0.9rem',
                  fontWeight: isSelected ? '500' : '400',
                  transition: 'all 0.2s'
                }}>
                  {day}
                </div>
              </div>
            );
          })}

          {/* Dias do Próximo Mês (Abril) */}
          {nextMonthDays.map((day) => (
            <div 
              key={`april-${day}`}
              style={{
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ddd', // Cor clara para dias fora do mês
                fontSize: '0.9rem'
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinimalistCalendar;