'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Clock, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-20" dir="rtl">
      <div className="max-w-4xl mx-auto text-right">
        <h1 className="text-5xl font-black text-accent mb-6">سياسة الشحن والتوصيل</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          نحرص في متجر JocMart على وصول طلباتكم بأفضل حال ممكنة. إليكم كافة التفاصيل المتعلقة بعمليات الشحن الدولي والمحلي.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="rounded-3xl border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 border-b px-8 py-6">
              <MapPin className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-bold">رسوم التوصيل</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                لا توجد أسعار محددة أو ثابتة لرسوم الشحن. التكلفة متغيرة وتعتمد كلياً على وزن الطرد وموقع المورد والمنطقة المراد التوصيل إليها.
              </p>
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 text-center">
                <span className="font-bold text-primary">تظهر التكلفة النهائية عند إتمام الطلب</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 border-b px-8 py-6">
              <Clock className="h-6 w-6 text-secondary" />
              <CardTitle className="text-xl font-bold">وقت التوصيل والتواصل</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed">
                يتم العمل على طلبكم فور استلامه. وقت التوصيل يختلف حسب الظروف اللوجستية، كما أن التواصل معكم لتنسيق الاستلام يتم بناءً على الظروف المتاحة لشركات الشحن والمناديب.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 mb-12">
          <CardContent className="p-8 flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-bold text-xl mb-2">ملاحظات هامة</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>يرجى التأكد من دقة رقم الهاتف والعنوان لضمان سهولة التواصل عند توفر الظروف المناسبة.</li>
                <li>لا توجد ضمانات استرجاع أو استبدال ثابتة بعد إتمام الشحن.</li>
                <li>في حال وجود أي استفسار، سيتم التعامل معه حسب الموقف والظروف المتاحة.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
