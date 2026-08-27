'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Target, ShieldCheck, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-20" dir="rtl">
      <div className="max-w-4xl mx-auto text-right">
        <h1 className="text-5xl font-black text-accent mb-6">عن JocMart</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          نحن في "JocMart" نؤمن أن الحياة يجب أن تكون أبسط وأكثر متعة. انطلقنا لنقدم حلولاً مبتكرة ومنتجات ذكية تحل تحديات الحياة اليومية الصغيرة بأسلوب عصري وأنيق. نحن نعتمد نموذج الـ Drop Shipping لنقدم لكم حلولاً عالمية مختارة بعناية، حيث نقوم بشراء المنتج مباشرة من المورد فور إتمامكم للطلب وتنسيق شحنه إليكم.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <Card className="rounded-3xl border-2 overflow-hidden bg-muted/20">
            <CardContent className="p-8 space-y-4">
              <div className="h-14 w-14 bg-primary text-white rounded-2xl flex items-center justify-center">
                <Lightbulb className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">رؤيتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                أن نكون الوجهة الأولى لكل من يبحث عن الإبداع والحلول الذكية، وأن نغير المفهوم التقليدي للتسوق عبر تقديم تجربة فريدة تركز على القيمة والأثر الحقيقي في حياة عملائنا.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 overflow-hidden bg-muted/20">
            <CardContent className="p-8 space-y-4">
              <div className="h-14 w-14 bg-secondary text-white rounded-2xl flex items-center justify-center">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold">مهمتنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                توفير منتجات عالية الجودة، مختارة بعناية لتناسب احتياجاتكم العصرية من خلال شراكاتنا مع موردين عالميين، مع تقديم دعم فني وتسهيلات تسوق تناسب الجميع.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-8 bg-accent text-white p-12 rounded-[3rem] shadow-xl">
          <h2 className="text-3xl font-black text-center mb-8">لماذا تختار JocMart؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-start gap-4">
              <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h4 className="font-bold text-xl mb-2">شفافية ووضوح</h4>
                <p className="text-sm opacity-80">نحن نعمل كوسيط موثوق؛ نشتري المنتج لك فور طلبك. نلتزم بالشفافية التامة في التعامل وتوضيح كافة تفاصيل المنتج قبل الشراء.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-secondary shrink-0" />
              <div>
                <h4 className="font-bold text-xl mb-2">مجتمعنا أولاً</h4>
                <p className="text-sm opacity-80">نحن لسنا مجرد متجر، نحن فريق شغوف يسعى لخدمتك بأفضل وجه عبر نظام شحن عالمي متطور، مع مراعاة كافة الظروف لضمان وصول المنتج إليك.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
