'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "ما هو نظام العمل في JocMart؟",
      answer: "نحن في JocMart نعمل بنظام الـ Drop Shipping، حيث نختار لكم أفضل المنتجات من موردين عالميين. نحن لا نقوم بتخزين المنتجات مسبقاً، بل نقوم بشراء السلعة فور طلبك لها من الموقع وتنسيق شحنها إليك مباشرة."
    },
    {
      question: "ماذا لو لم تعجبني السلعة أو حدث خلاف؟",
      answer: "نحن نسعى دائماً لتقديم الأفضل، ولكن يرجى العلم أنه لا توجد ضمانات استرجاع أو استبدال ثابتة. في حال حدوث خلاف، يتم دراسة كل حالة على حدة والتواصل معكم حسب الظروف المتاحة للنظر في إمكانية رد المبلغ أو التوصل لحل يرضي الطرفين."
    },
    {
      question: "كيف يمكنني التواصل مع الدعم الفني؟",
      answer: "يمكنكم التواصل معنا عبر القنوات المتاحة، ولكن يرجى العلم أن سرعة الاستجابة ونوعية التواصل تعتمد على الظروف المتاحة وضغط العمل وقت الطلب."
    },
    {
      question: "ما هي طرق الدفع المتاحة في JocMart؟",
      answer: "نوفر لكم حالياً خيار الدفع الآمن والسريع عبر PayPal لكافة المشتريات، مما يضمن حماية بياناتكم البنكية وتجربة تسوق عالمية بامتياز."
    },
    {
      question: "كيف يتم حساب تكلفة الشحن؟",
      answer: "لا توجد رسوم شحن ثابتة في JocMart. يتم احتساب تكلفة الشحن بناءً على وزن المنتج، موقع المورد، ووجهة التوصيل، وتظهر التكلفة النهائية بدقة في ملخص الطلب قبل إتمام الدفع."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-20" dir="rtl">
      <div className="max-w-3xl mx-auto text-right">
        <h1 className="text-5xl font-black text-accent mb-6">الأسئلة الشائعة</h1>
        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
          لديك استفسار؟ قد تجد الإجابة هنا. نحن نؤمن بالشفافية الكاملة في طريقة عملنا لضمان رضاكم.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-2 rounded-2xl px-6 bg-white overflow-hidden shadow-sm">
              <AccordionTrigger className="text-lg font-bold hover:no-underline text-right py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-md leading-relaxed pb-6 pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
