'use client';

import React from 'react';
import { Mail } from 'lucide-react';

export default function DnnextjsPage() {
  const email = "Dnnextjs@gmail.com";
  const subject = encodeURIComponent("طلب استشارة لبناء موقع إلكتروني");
  const body = encodeURIComponent("مرحباً Dnnextjs، أرغب في الاستفسار عن خدمات بناء المواقع والمتاجر الإلكترونية الخاصة بكم...");
  const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-20 px-4" dir="rtl">
      <div className="max-w-2xl w-full text-center space-y-12">
        
        {/* Header Section */}
        <div className="space-y-6">
          <h1 className="text-7xl font-black text-accent tracking-tighter sm:text-9xl">
            Dn<span className="text-primary">nextjs</span>
          </h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full" />
          <p className="text-2xl text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            نحن نصمم ونبني تجارب رقمية استثنائية وبسيطة باستخدام أحدث التقنيات.
          </p>
        </div>

        {/* Primary Contact Section */}
        <div className="space-y-8 pt-10">
          <div className="flex flex-col items-center gap-6">
            <a 
              href={mailtoUrl} 
              className="flex items-center gap-3 text-sm font-bold hover:scale-105 transition-transform bg-accent text-white px-6 py-3 rounded-full shadow-xl"
            >
              <Mail className="h-4 w-4" />
              {email}
            </a>
            <p className="text-muted-foreground font-bold opacity-60 text-xs">تواصل معنا لتبدأ مشروعك القادم برسالة فورية.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
