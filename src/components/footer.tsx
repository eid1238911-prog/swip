'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer dir="rtl" className="mt-auto py-12 border-t bg-white text-accent">
      <div className="container mx-auto px-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-end">
              <div className="bg-primary text-white p-1.5 rounded-md font-bold text-xl">JocMart</div>
            </div>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              متجر متخصص في توفير منتجات إبداعية وذكية تحل التحديات اليومية الصغيرة بأسلوب عصري وأنيق لكل الباحثين عن التميز.
            </p>
            <div className="flex items-center gap-2 justify-end pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full border border-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">سياسات معتمدة وشفافة</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-light">
              <li><Link href="/about" className="hover:text-primary transition-colors">عن المتجر</Link></li>
              <li><Link href="/shipping" className="hover:text-primary transition-colors">سياسة الشحن</Link></li>
              <li><Link href="/faq" className="hover:text-primary transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-primary">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground font-light">
              <li>baraaalabadijob305@gmail.com</li>
              <li dir="ltr">+962 7 7657 3220</li>
              <li>عمان، الأردن</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-muted text-center text-xs text-muted-foreground font-light flex flex-col items-center gap-2">
          <p>© {new Date().getFullYear()} JocMart. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
