'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, collection, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Package, 
  LogOut, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Truck, 
  AlertCircle,
  Hash,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import Loading from '../loading';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function ProfileContent() {
  const { user, loading: authLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'orders' ? 'orders' : 'info';

  const [activeTab, setActiveTab] = useState<'info' | 'orders'>(defaultTab as 'info' | 'orders');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // جلب وثيقة الملف الشخصي للمستخدم
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  // مزامنة الحقول عند اكتمال جلب البيانات
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setPhoneNumber(profile.phoneNumber || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [profile, user]);

  // جلب طلبات المستخدم
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user?.uid]);

  const { data: orders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    if (!displayName.trim()) {
      toast({ variant: "destructive", title: "حقل مطلوب", description: "يرجى إدخال اسمك الكامل." });
      return;
    }

    setIsSaving(true);
    try {
      const cleanedPhone = phoneNumber.replace('+', '').replace(/\s/g, '');
      
      // تحديث ملف Auth
      await updateProfile(user, {
        displayName: displayName.trim()
      });

      // تحديث بيانات Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        phoneNumber: cleanedPhone
      });

      toast({ 
        title: "تم حفظ التعديلات", 
        description: "تم تحديث بيانات ملفك الشخصي بنجاح." 
      });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "خطأ أثناء الحفظ", 
        description: "حدث خطأ أثناء حفظ التعديلات، يرجى المحاولة لاحقاً." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => {
        toast({ title: "تم تسجيل الخروج", description: "نتمنى رؤيتك قريباً في JocMart." });
        router.push('/');
      });
    }
  };

  if (authLoading) return <Loading />;

  // توجيه غير المسجلين لصفحة الدخول
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/auth?redirect=/profile');
    }
    return null;
  }

  const createdAtFormatted = profile?.createdAt?.seconds
    ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString('ar-JO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'عضو حديث';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'جديد':
        return <Badge className="bg-primary text-white border-none font-bold">طلب جديد</Badge>;
      case 'قيد التنفيذ':
        return <Badge className="bg-amber-500 text-white border-none font-bold">قيد التجهيز</Badge>;
      case 'تم الشحن':
        return <Badge className="bg-blue-600 text-white border-none font-bold">تم الشحن 🚚</Badge>;
      case 'تم التوصيل':
        return <Badge className="bg-green-600 text-white border-none font-bold">تم الاستلام ✓</Badge>;
      case 'ملغي':
        return <Badge className="bg-destructive text-white border-none font-bold">ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-5xl" dir="rtl">
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-accent/5 via-muted/30 to-primary/5 rounded-3xl p-6 md:p-10 border-2 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-right w-full md:w-auto">
          <div className="h-20 w-20 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
            {(profile?.displayName || user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-accent">
                {profile?.displayName || user.displayName || 'عميل JocMart'}
              </h1>
              {profile?.isAdmin && (
                <Badge className="bg-primary text-white text-[10px] font-bold">مسؤول المتجر</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 justify-start">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1.5 justify-start">
              <Calendar className="h-3.5 w-3.5" /> انضم في: {createdAtFormatted}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {profile?.isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="rounded-full font-bold border-2 gap-2 text-primary border-primary hover:bg-primary hover:text-white">
                <ShieldCheck className="h-4 w-4" /> لوحة التحكم
              </Button>
            </Link>
          )}
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="rounded-full font-bold text-destructive hover:bg-destructive/10 gap-2"
          >
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Profile & Orders Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'info' | 'orders')} className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8 h-14 rounded-2xl bg-muted/60 p-1">
          <TabsTrigger value="info" className="rounded-xl font-bold text-base gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <User className="h-4 w-4" /> بياناتي الشخصية
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl font-bold text-base gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="h-4 w-4" /> طلباتي ({orders?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PERSONAL INFO */}
        <TabsContent value="info" className="focus-visible:outline-none">
          <Card className="rounded-3xl border-2 shadow-sm overflow-hidden bg-white max-w-2xl mx-auto">
            <CardHeader className="bg-muted/20 border-b p-6 md:p-8 text-right">
              <CardTitle className="text-xl font-black">تعديل البيانات الشخصية</CardTitle>
              <CardDescription>حافظ على بياناتك محدثة لضمان سرعة معالجة وتوصيل طلباتك</CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              {profileLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="profile-name" className="font-bold flex items-center gap-1.5 justify-end">
                      الاسم الكامل <User className="h-4 w-4 text-primary" />
                    </Label>
                    <Input 
                      id="profile-name" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)} 
                      className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                      required
                    />
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="profile-email" className="font-bold flex items-center gap-1.5 justify-end">
                      البريد الإلكتروني <Mail className="h-4 w-4 text-primary" />
                    </Label>
                    <Input 
                      id="profile-email" 
                      value={user.email || ''} 
                      disabled
                      className="text-right rounded-2xl h-12 border-2 bg-muted cursor-not-allowed text-muted-foreground" 
                    />
                    <span className="text-[11px] text-muted-foreground">البريد الإلكتروني مرتبط بحسابك ولا يمكن تعديله مباشرة.</span>
                  </div>

                  <div className="space-y-2 text-right">
                    <Label htmlFor="profile-phone" className="font-bold flex items-center gap-1.5 justify-end">
                      رقم الهاتف (بالصيغة الدولية) <Phone className="h-4 w-4 text-primary" />
                    </Label>
                    <Input 
                      id="profile-phone" 
                      placeholder="962776573220" 
                      type="tel"
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                    />
                    <span className="text-[11px] text-muted-foreground">يستخدم للتواصل وتأكيد عمليات الشحن من قبل المناديب.</span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full rounded-full h-12 font-bold text-base bg-primary hover:bg-primary/90 mt-4 shadow-md"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "حفظ التعديلات"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MY ORDERS */}
        <TabsContent value="orders" className="focus-visible:outline-none">
          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-44 w-full rounded-3xl" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-3xl border-2 border-dashed p-8">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-2xl font-black text-accent mb-2">لا توجد طلبات سابقة</h3>
              <p className="text-muted-foreground mb-6">لم تقم بأي عملية شراء بعد. تصفح حلولنا الذكية الآن!</p>
              <Link href="/products">
                <Button className="rounded-full px-8 h-12 font-bold">
                  تصفح المنتجات الآن
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const dateStr = order.createdAt?.seconds 
                  ? new Date(order.createdAt.seconds * 1000).toLocaleString('ar-JO', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'تاريخ غير محدد';

                return (
                  <Card key={order.id} className="rounded-3xl border-2 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 border-b p-6 flex flex-row items-center justify-between flex-wrap gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-black text-accent">طلب #{order.id.slice(0, 8)}</CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {dateStr}
                        </p>
                      </div>
                      <div className="text-left">
                        <span className="text-2xl font-black text-primary">{order.totalAmount?.toFixed(2)} $</span>
                        <p className="text-[10px] text-muted-foreground font-bold">وسيلة الدفع: {order.paymentMethod || 'PayPal'}</p>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 text-right space-y-4">
                      {/* Item list */}
                      <div className="divide-y border rounded-2xl overflow-hidden bg-white">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-muted/40 border flex items-center justify-center font-bold text-xs text-muted-foreground shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <Link 
                                  href={`/product/${item.id}`} 
                                  className="font-bold text-sm hover:text-primary transition-colors line-clamp-1"
                                >
                                  {item.name}
                                </Link>
                                <span className="text-xs text-muted-foreground">الكمية: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-black text-sm text-accent">{(item.price * item.quantity).toFixed(2)} $</span>
                          </div>
                        ))}
                      </div>

                      {/* Details row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground bg-muted/20 p-4 rounded-2xl">
                        {order.shippingAddress && (
                          <div>
                            <span className="font-bold text-accent block mb-1">عنوان التوصيل:</span>
                            <p>{order.shippingAddress.recipientName} - {order.shippingAddress.addressLine1} {order.shippingAddress.city} ({order.shippingAddress.countryCode})</p>
                          </div>
                        )}
                        {order.transactionId && (
                          <div className="flex items-center gap-1.5 justify-start md:justify-end">
                            <Hash className="h-4 w-4 text-primary" />
                            <span>معرف العملية: <span className="font-mono text-accent font-bold">{order.transactionId}</span></span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfileContent />
    </Suspense>
  );
}
