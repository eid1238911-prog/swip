'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, Clock, Phone, Truck } from 'lucide-react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/context/cart-context';
import { cn } from '@/lib/utils';
import Loading from '../../loading';
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const db = useFirestore();
  const { toast } = useToast();
  const { addToCart, phoneNumber, setPhoneNumber } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy' | null>(null);

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, loading } = useDoc<any>(productRef);

  if (loading) return <Loading />;

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
        <Button onClick={() => router.push('/')} className="rounded-full">العودة للرئيسية</Button>
      </div>
    );
  }

  const executeAction = (action: 'cart' | 'buy') => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      shippingPrice: product.shippingPrice || 0,
      imageUrl: product.imageUrl,
      quantity: 1
    });
    
    if (action === 'cart') {
      toast({ title: "تمت الإضافة للسلة", description: `تم إضافة ${product.name} بنجاح.` });
    } else {
      router.push('/cart');
    }
  };

  const handleActionClick = (action: 'cart' | 'buy') => {
    if (!phoneNumber) {
      setPendingAction(action);
      setShowPhoneDialog(true);
    } else {
      executeAction(action);
    }
  };

  const handlePhoneSubmit = () => {
    if (tempPhone.length < 10) {
      toast({ variant: "destructive", title: "رقم غير مكتمل", description: "يرجى إدخال الرقم بالصيغة الدولية (رمز الدولة + الرقم)." });
      return;
    }
    
    const cleanedPhone = tempPhone.replace('+', '').replace(/\s/g, '');
    setPhoneNumber(cleanedPhone);
    setShowPhoneDialog(false);
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  };
  
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl || 'https://picsum.photos/seed/placeholder/800/800'];

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Button variant="ghost" className="mb-8 gap-2 hover:text-primary p-0" onClick={() => router.back()}><ArrowRight className="h-4 w-4" /> العودة للتسوق</Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted/20 border shadow-sm">
            <Image src={galleryImages[activeImage]} alt={product.name} fill className="object-cover transition-opacity duration-300" priority />
            <Badge className="absolute top-6 right-6 bg-primary text-white px-4 py-1 rounded-full font-bold">حل ذكي</Badge>
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar" dir="rtl">
              {galleryImages.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={cn("relative h-20 w-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0", activeImage === idx ? "border-primary scale-95 shadow-inner" : "border-transparent opacity-70 hover:opacity-100")}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col text-right">
          <Badge className="w-fit mr-0 ml-auto mb-4 bg-primary text-white border-none rounded-full px-4 flex items-center gap-2">
             شحن: {product.shippingPrice || 0} $ <Truck className="h-3 w-3" />
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-accent mb-4">{product.name}</h1>
          <div className="flex items-center justify-end gap-2 mb-8">
            {product.originalPrice && <span className="text-sm text-muted-foreground line-through">{Number(product.originalPrice).toFixed(1)} $</span>}
            <span className="text-3xl font-black text-primary">{Number(product.price).toFixed(1)} $</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">{product.description}</p>
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-end gap-3 text-sm font-semibold">{product.supportNote || 'دعم فني متخصص عبر الواتساب'} <Clock className="h-5 w-5 text-secondary" /></div>
          </div>
          <div className="space-y-4 mt-auto">
            <div className="grid grid-cols-1 gap-4">
              <Button size="lg" className="rounded-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 gap-3" onClick={() => handleActionClick('cart')}><ShoppingCart className="h-6 w-6" /> أضف إلى السلة</Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 text-lg font-bold border-2" onClick={() => handleActionClick('buy')}>شراء عبر الموقع</Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="rounded-3xl border-2 max-w-sm" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-xl font-black flex items-center gap-2 justify-end">
               رقم التواصل الدولي <Phone className="h-5 w-5 text-primary" />
            </DialogTitle>
            <DialogDescription>
              يرجى إدخال رقم الهاتف بالصيغة الدولية (مثال: 962776573220).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2 text-right">
              <Label htmlFor="phone">الرمز الدولي + رقم الهاتف</Label>
              <Input 
                id="phone" 
                placeholder="962776573220" 
                type="tel" 
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                className="text-right h-12 rounded-2xl border-2 focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full rounded-2xl h-12 font-bold" onClick={handlePhoneSubmit}>
              تأكيد ومتابعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
