"use client";

import React from 'react';
import ModernCalendar from '@/components/ModernCalendar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ModernCalendarPage = () => {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-light text-gray-900 mb-4">Design Minimalista</h1>
            <p className="text-gray-500">Um exemplo de interface limpa e funcional para o seu bem-estar.</p>
          </div>
          <ModernCalendar />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModernCalendarPage;