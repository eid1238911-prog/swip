'use client';

import React, { useMemo } from 'react';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/cart-context';
import { usePathname } from 'next/navigation';
import { WhatsAppFloat } from '@/components/whatsapp-float';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  /**
   * يتم استدعاء مفتاح PayPal من متغيرات البيئة.
   * تم إضافة .trim() لضمان إزالة أي مسافات قد تسبب فشل تحميل السكربت.
   */
  const paypalClientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "").trim();

  // تثبيت خيارات PayPal لمنع إعادة تحميل السكربت بشكل متكرر
  const paypalOptions = useMemo(() => ({ 
    "client-id": paypalClientId || "test", // استخدام test كقيمة افتراضية لمنع الخطأ البرمجي إذا كان المفتاح مفقوداً
    currency: "USD",
    intent: "capture",
    "data-sdk-integration-source": "button-factory"
  }), [paypalClientId]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>JocMart | متجر الحلول والمنتجات الذكية</title>
        <meta name="description" content="متجر متخصص في توفير منتجات إبداعية وذكية تحل التحديات اليومية بأسلوب عصري وأنيق." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased bg-white flex flex-col min-h-screen">
        <PayPalScriptProvider options={paypalOptions}>
          <FirebaseClientProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              {!isAdminPage && <Footer />}
              <WhatsAppFloat />
              <Toaster />
            </CartProvider>
          </FirebaseClientProvider>
        </PayPalScriptProvider>
      </body>
    </html>
  );
}
