"use client";

import React, { useState } from 'react';

const MinimalistCalendar = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
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
        minHeight: '400px' // Garante visibilidade no container
      }}
    >
      <div 
        className="calendar" 
        style={{
          width: '300px',
          margin: '0 auto',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Cabeçalho */}
        <header style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 300, 
            color: '#333', 
            margin: 0,
            textTransform: 'lowercase',
            letterSpacing: '-0.02em'
          }}>
            março 2026
          </h2>
        </header>

        {/* Dias da semana */}
        <div 
          className="weekdays" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            marginBottom: '16px'
          }}
        >
          {weekdays.map((day) => (
            <div 
              key={day} 
              style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: '#999',
                textTransform: 'lowercase'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div 
          className="days" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}
        >
          {days.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={isSelected ? 'selected' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  backgroundColor: isSelected ? '#ff4fa3' : 'transparent',
                  color: isSelected ? 'white' : '#444',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  borderRadius: isSelected ? '8px' : '50%',
                  transition: '0.2s',
                  outline: 'none',
                  // Hover effect via inline style logic (React style)
                  ...(isSelected ? {} : {
                    ':hover': {
                      backgroundColor: 'hsl(var(--primary) / 0.1)'
                    }
                  })
                }}
                // Adicionando hover via onMouseEnter/Leave para simular CSS puro em React
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(183, 110, 121, 0.1)';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MinimalistCalendar;