'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Printer, Package, MapPin, Hash, User, Calendar, CreditCard } from 'lucide-react';
import Loading from '@/app/loading';

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userRef);

  const orderRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'orders', id);
  }, [db, id]);

  const { data: order, loading: orderLoading } = useDoc<any>(orderRef);

  // تحديث عنوان الصفحة ليكون معرف الطلب فقط (يظهر عند الطباعة كاسم للملف)
  useEffect(() => {
    if (order && order.id) {
      document.title = order.id;
    }
    return () => {
      document.title = 'JocMart Admin';
    };
  }, [order]);

  if (authLoading || profileLoading || orderLoading) return <Loading />;

  if (!user || !profile || profile.isAdmin !== true) {
    router.replace('/');
    return null;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">الطلب غير موجود</h1>
        <Button onClick={() => router.push('/admin')} className="rounded-none">العودة للوحة التحكم</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const createdAt = order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString('ar-JO') : 'غير متوفر';
  const address = order.shippingAddress;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold">
          <ArrowRight className="h-5 w-5" /> العودة
        </Button>
        <div className="flex gap-2">
          <Button onClick={handlePrint} className="gap-2 font-bold rounded-none">
            <Printer className="h-5 w-5" /> طباعة الطلب
          </Button>
        </div>
      </div>

      <div className="space-y-8 print:space-y-6">
        <div className="flex justify-between items-start border-b-2 border-accent pb-6">
          <div className="text-right flex-grow">
            <h1 className="text-4xl font-black mb-2">تفاصيل الطلب</h1>
            <div className="flex items-center gap-2 justify-end text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>تاريخ الطلب: {createdAt}</span>
            </div>
            <div className="flex items-center gap-2 justify-end text-accent font-bold mt-2">
              <Hash className="h-4 w-4" />
              <span>معرف الطلب: {order.id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-none border-2 shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2 justify-end">
                بيانات التواصل <User className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-right space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">اسم العميل:</p>
                <p className="font-bold text-lg">{order.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">رقم الهاتف:</p>
                <p className="font-bold text-lg dir-ltr">{order.phoneNumber}</p>
              </div>
              {order.customerEmail && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">البريد الإلكتروني:</p>
                  <p className="font-bold">{order.customerEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border-2 shadow-none overflow-hidden">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2 justify-end">
                عنوان الشحن <MapPin className="h-5 w-5 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-right space-y-2">
              {address ? (
                <>
                  <p className="font-bold text-lg mb-2">{address.recipientName}</p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-primary font-bold">{address.countryCode}</p>
                </>
              ) : (
                <p className="text-muted-foreground italic">لا يوجد عنوان شحن مسجل لهذا الطلب.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none border-2 shadow-none overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2 justify-end">
              المنتجات المطلوبة <Package className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b text-xs font-bold uppercase text-muted-foreground">
                  <th className="p-4">المنتج</th>
                  <th className="p-4 text-center">الكمية</th>
                  <th className="p-4 text-left">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="p-4 font-bold">
                      <Link 
                        href={`/product/${item.id}`} 
                        className="text-primary hover:underline hover:text-primary/80 transition-colors"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="p-4 text-center font-black">x{item.quantity}</td>
                    <td className="p-4 text-left font-black">{item.price?.toFixed(2)} $</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-6">
          <div className="w-full md:w-1/2 space-y-3 bg-muted/20 p-8 rounded-none border-2 border-accent/10">
            <div className="flex justify-between items-center text-sm border-b border-accent/10 pb-2">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{order.subtotal?.toFixed(2) || order.totalPrice?.toFixed(2)} $</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-accent/10 pb-2">
              <span>إجمالي الشحن:</span>
              <span className="font-bold">{order.totalShipping?.toFixed(2)} $</span>
            </div>
            {order.paypalFee > 0 && (
              <div className="flex justify-between items-center text-sm border-b border-accent/10 pb-2">
                <span>رسوم PayPal (4.9% + 0.3$):</span>
                <span className="font-bold">{order.paypalFee?.toFixed(2)} $</span>
              </div>
            )}
            <div className="flex justify-between items-center text-3xl font-black pt-2 text-accent">
              <span>الإجمالي النهائي:</span>
              <span>{order.totalAmount?.toFixed(2)} $</span>
            </div>
            
            <div className="mt-6 pt-6 border-t border-accent/10 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                <CreditCard className="h-3 w-3" />
                <span>وسيلة الدفع: {order.paymentMethod || 'PayPal'}</span>
              </div>
              {order.transactionId && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold">
                  <Hash className="h-3 w-3" />
                  <span>معرف PayPal: {order.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          .container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .card {
            border: 1px solid #eee !important;
            box-shadow: none !important;
          }
          .bg-accent {
            background-color: white !important;
            color: black !important;
            border: 2px solid black !important;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
