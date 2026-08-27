'use client';

import React from 'react';

export default function JocMartBrandingPage() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-white" dir="rtl">
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
        
        {/* Logo Branding */}
        <div className="flex flex-col items-center gap-6">
          <div className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black text-6xl md:text-8xl shadow-2xl shadow-primary/20 transition-transform hover:scale-105 duration-500">
            JocMart
          </div>
          <div className="h-1.5 w-24 bg-primary rounded-full opacity-50" />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <p className="text-2xl md:text-3xl font-bold text-accent tracking-wide">
            الحلول الذكية تبدأ من هنا
          </p>
          <p className="text-muted-foreground font-medium text-sm md:text-base">
            Simple . Smart . Modern
          </p>
        </div>

      </div>
    </div>
  );
}
