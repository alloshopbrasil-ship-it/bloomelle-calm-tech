"use client";

import React from 'react';
import MinimalistCalendar from '@/components/MinimalistCalendar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ModernCalendarPage = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-20 flex flex-col">
        <div className="container mx-auto px-6 flex-1 flex flex-col">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Calendário Minimalista</h1>
            <p className="text-gray-500">Estrutura centralizada e design limpo para Março de 2026.</p>
          </div>
          
          {/* Container que deve centralizar o calendário */}
          <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <MinimalistCalendar />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModernCalendarPage;