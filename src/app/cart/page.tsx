'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Pencil, Phone, Loader2, Info, ShieldCheck, User } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalShipping, clearCart, phoneNumber, setPhoneNumber } = useCart();
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEditPhone, setShowEditPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState(phoneNumber || '');
  
  const db = useFirestore();
  const paypalClientId = (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "").trim();

  // جلب الملف الشخصي للمستخدم في حال تسجيل الدخول
  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc<any>(userRef);

  // ملء رقم الهاتف تلقائياً من الملف الشخصي إن لم يكن محدداً في السلة
  useEffect(() => {
    if (profile?.phoneNumber && !phoneNumber) {
      setPhoneNumber(profile.phoneNumber);
    }
  }, [profile, phoneNumber, setPhoneNumber]);

  // حساب رسوم PayPal: 4.9% + 0.30$
  const paypalFee = useMemo(() => {
    const subtotal = totalPrice + totalShipping;
    if (subtotal <= 0) return 0;
    return (subtotal * 0.049) + 0.30;
  }, [totalPrice, totalShipping]);

  const finalTotal = useMemo(() => {
    return totalPrice + totalShipping + paypalFee;
  }, [totalPrice, totalShipping, paypalFee]);

  const saveOrder = async (details: any) => {
    if (!db) return;
    
    const shipping = details?.purchase_units?.[0]?.shipping;
    const address = shipping?.address;
    const payer = details?.payer;
    
    const finalPhone = phoneNumber || profile?.phoneNumber || payer?.phone?.phone_number?.national_number || '';
    const customerName = profile?.displayName || user?.displayName || shipping?.name?.full_name || payer?.name?.given_name || 'عميل مجهول';

    let paymentMethod = 'PayPal';
    if (details?.payment_source?.card) {
      paymentMethod = 'بطاقة ائتمان (فيزا/ماستر)';
    } else if (details?.payment_source?.paypal) {
      paymentMethod = 'حساب PayPal';
    }

    try {
      await addDoc(collection(db, 'orders'), {
        userId: user?.uid || 'guest',
        customerName: customerName,
        customerEmail: user?.email || payer?.email_address || '',
        phoneNumber: finalPhone,
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, shippingPrice: i.shippingPrice })),
        subtotal: totalPrice,
        totalShipping: totalShipping,
        paypalFee: paypalFee,
        totalAmount: finalTotal,
        status: 'جديد',
        paymentMethod: paymentMethod,
        transactionId: details?.id || null,
        shippingAddress: {
          recipientName: shipping?.name?.full_name || '',
          addressLine1: address?.address_line_1 || '',
          addressLine2: address?.address_line_2 || '',
          city: address?.admin_area_2 || '',
          state: address?.admin_area_1 || '',
          postalCode: address?.postal_code || '',
          countryCode: address?.country_code || ''
        },
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  const handleUpdatePhone = () => {
    if (tempPhone.length < 10) {
      toast({ variant: "destructive", title: "رقم غير مكتمل", description: "يرجى إدخال الرقم بالصيغة الدولية (رمز الدولة + الرقم)." });
      return;
    }
    const cleanedPhone = tempPhone.replace('+', '').replace(/\s/g, '');
    setPhoneNumber(cleanedPhone);
    setShowEditPhone(false);
    toast({ title: "تم التحديث", description: "تم تحديث رقم التواصل بنجاح." });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center" dir="rtl">
        <ShoppingBag className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-20" />
        <h1 className="text-3xl font-black mb-4 text-accent">سلة المشتريات فارغة</h1>
        <p className="text-muted-foreground mb-10">يبدو أنك لم تضف أي حلول ذكية بعد!</p>
        <Link href="/products">
          <Button className="rounded-full px-8 h-12 font-bold">تصفح المنتجات الآن</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="mb-10 text-right">
        <h1 className="text-4xl font-black text-accent">سلة المشتريات</h1>
        <p className="text-muted-foreground mt-2">لديك {items.length} منتجات في السلة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Card key={item.id} className="rounded-3xl border-2 overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-24 w-24 relative rounded-2xl overflow-hidden border shrink-0">
                  <img src={item.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt="" className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow text-right space-y-1">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <div className="flex gap-4 justify-end">
                    <p className="text-primary font-black">{item.price} $</p>
                    <p className="text-xs text-secondary font-bold">(شحن: {item.shippingPrice} $)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-full border">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeFromCart(item.id)}><Trash2 className="h-5 w-5" /></Button>
              </CardContent>
            </Card>
          ))}
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 p-0 font-bold" asChild>
            <Link href="/products"><ArrowLeft className="h-4 w-4" /> العودة للتسوق</Link>
          </Button>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-3xl border-2 shadow-xl sticky top-24">
            <CardHeader className="bg-muted/30 text-right py-6">
              <CardTitle className="text-xl font-bold">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between font-bold"><span>المجموع الفرعي:</span><span>{totalPrice.toFixed(2)} $</span></div>
              <div className="flex justify-between text-muted-foreground text-sm"><span>إجمالي الشحن:</span><span>{totalShipping.toFixed(2)} $</span></div>
              
              <div className="flex justify-between text-muted-foreground text-sm items-center">
                <div className="flex items-center gap-1">
                  <span>رسوم الدفع (PayPal):</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help text-muted-foreground/60" />
                      </TooltipTrigger>
                      <TooltipContent className="text-[10px] max-w-[200px] text-right" dir="rtl">
                        يتم إضافة رسوم معالجة بنسبة 4.9% + 0.30$ لتغطية تكاليف بوابات الدفع الدولية.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span>{paypalFee.toFixed(2)} $</span>
              </div>
              
              {phoneNumber ? (
                <div className="flex justify-between items-center bg-primary/5 p-2 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full text-primary hover:bg-primary/20"
                      onClick={() => {
                        setTempPhone(phoneNumber);
                        setShowEditPhone(true);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-bold text-primary" dir="ltr">+{phoneNumber}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">رقم التواصل:</span>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-muted/50 p-2 rounded-xl border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-bold text-primary"
                    onClick={() => {
                      setTempPhone('');
                      setShowEditPhone(true);
                    }}
                  >
                    + إضافة رقم هاتف
                  </Button>
                  <span className="text-xs text-muted-foreground">رقم التواصل:</span>
                </div>
              )}

              {user && (
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/20 p-2 rounded-xl">
                  <span className="font-bold text-accent">{profile?.displayName || user.displayName || user.email}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3 text-primary" /> الحساب المسجل:</span>
                </div>
              )}

              <Separator />
              <div className="flex justify-between text-2xl font-black text-accent"><span>الإجمالي:</span><span>{finalTotal.toFixed(2)} $</span></div>
              
              {/* شعار الموافقة على السياسات */}
              <div className="mt-6 bg-muted/50 p-4 rounded-2xl border-2 border-dashed text-center space-y-2">
                <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  بإتمامك للطلب، أنت تؤكد موافقتك الصريحة على <Link href="/faq" className="text-primary underline hover:text-primary/80">سياسات JocMart</Link> المتعلقة بنظام الشحن الدولي وعدم وجود ضمانات إرجاع ثابتة.
                </p>
                <div className="text-[9px] text-primary/60 font-black uppercase tracking-tighter">
                  Verified Policy Approval
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6">
              <div className="w-full space-y-4">
                {!paypalClientId ? (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-center text-sm font-bold">
                    يرجى ضبط مفتاح PayPal في إعدادات التطبيق لإتمام عملية الدفع.
                  </div>
                ) : (
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "pill", label: "checkout" }}
                    disabled={isProcessing}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [{
                          description: "مشتريات من متجر JocMart",
                          amount: {
                            currency_code: "USD",
                            value: finalTotal.toFixed(2),
                          }
                        }]
                      });
                    }}
                    onApprove={async (data, actions) => {
                      setIsProcessing(true);
                      if (actions.order) {
                        try {
                          const details = await actions.order.capture();
                          await saveOrder(details);
                          toast({ 
                            title: "تم الدفع بنجاح!", 
                            description: user 
                              ? "شكراً لك، تم استلام طلبك ويمكنك متابعة حالته من صفحة 'طلباتي'." 
                              : "شكراً لك، تم استلام طلبك بنجاح." 
                          });
                          clearCart();
                        } catch (e) {
                          toast({ variant: "destructive", title: "خطأ في معالجة الدفع", description: "حدث خطأ أثناء إتمام الطلب، يرجى المحاولة لاحقاً." });
                        } finally {
                          setIsProcessing(false);
                        }
                      }
                    }}
                    onError={(err) => {
                      toast({ 
                        variant: "destructive", 
                        title: "فشل تحميل بوابة الدفع", 
                        description: "تأكد من صحة مفتاح PayPal الخاص بك أو حاول مرة أخرى." 
                      });
                    }}
                  />
                )}
                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> جاري معالجة الطلب...
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={showEditPhone} onOpenChange={setShowEditPhone}>
        <DialogContent className="rounded-3xl border-2 max-w-sm" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black flex items-center gap-2 justify-end">
               تعديل رقم التواصل الدولي <Phone className="h-5 w-5 text-primary" />
            </DialogTitle>
            <DialogDescription>
              يرجى إدخال الرقم بالصيغة الدولية (مثال: 962776573220).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="edit-phone">الرمز الدولي + الرقم</Label>
              <Input 
                id="edit-phone" 
                placeholder="962776573220" 
                type="tel" 
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="text-right h-12 rounded-2xl border-2 focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full rounded-2xl h-12 font-bold" onClick={handleUpdatePhone}>
              حفظ التعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
