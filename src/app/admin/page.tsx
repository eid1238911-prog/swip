'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, addDoc, deleteDoc, query, orderBy, serverTimestamp, updateDoc, limit, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle, Plus, ArrowRight, ShoppingBag, Images, Hash, ExternalLink, Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Loading from '../loading';

type AdminView = 'menu' | 'products' | 'categories' | 'orders' | 'order-history' | 'dashboard';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentView, setCurrentView] = useState<AdminView>('menu');
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<string | null>(null);
  
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDeleteId, setCategoryToDeleteId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [ordersLimit, setOrdersLimit] = useState(4);

  const initialProductState = {
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrls: '',
    shippingPrice: '0',
    shippingNote: 'يتم احتساب رسوم الشحن عند إتمام الطلب.',
    supportNote: 'دعم فني متخصص عبر الواتساب'
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc<any>(userRef);

  const productsQuery = useMemoFirebase(() => {
    if (!db || currentView !== 'products' || !selectedCategoryForProducts) return null;
    return query(
      collection(db, 'products'), 
      where('category', '==', selectedCategoryForProducts),
      orderBy('createdAt', 'desc')
    );
  }, [db, currentView, selectedCategoryForProducts]);

  const { data: products } = useCollection<any>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: categories } = useCollection<any>(categoriesQuery);

  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(ordersLimit));
  }, [db, ordersLimit]);

  const { data: orders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  const activeOrders = useMemo(() => {
    return orders?.filter(o => o.status === 'جديد' || o.status === 'قيد التنفيذ') || [];
  }, [orders]);

  const historicalOrders = useMemo(() => {
    return orders?.filter(o => o.status === 'تم الشحن' || o.status === 'تم التوصيل' || o.status === 'ملغي' || o.status === 'مسترجع') || [];
  }, [orders]);

  useEffect(() => {
    if (selectedCategoryForProducts && isAddProductDialogOpen) {
      setNewProduct(prev => ({ ...prev, category: selectedCategoryForProducts }));
    }
  }, [selectedCategoryForProducts, isAddProductDialogOpen]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!db) return;
    const orderRef = doc(db, 'orders', orderId);
    updateDoc(orderRef, { status: newStatus }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'update' }));
    });
    toast({ title: "تم التحديث", description: `تم تغيير حالة الطلب إلى ${newStatus}` });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.imageUrls) {
      toast({ variant: "destructive", title: "خطأ", description: "يرجى ملء الحقول الأساسية ووضع رابط صورة واحد على الأقل" });
      return;
    }
    if (!db) return;
    setIsProcessing(true);
    
    const images = newProduct.imageUrls.split('\n').map(url => url.trim()).filter(url => url !== '');
    
    try {
      const data = {
        ...newProduct,
        imageUrl: images[0] || '',
        images: images,
        price: Number(newProduct.price),
        shippingPrice: Number(newProduct.shippingPrice) || 0,
        createdAt: serverTimestamp()
      };
      delete (data as any).imageUrls;
      
      await addDoc(collection(db, 'products'), data);
      toast({ title: "تم النجاح", description: "تم نشر المنتج الجديد بنجاح" });
      setIsAddProductDialogOpen(false);
      setNewProduct(initialProductState);
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'products', operation: 'create' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditProductClick = (product: any) => {
    setProductToEdit({
      ...product,
      imageUrls: product.images ? product.images.join('\n') : (product.imageUrl || ''),
      price: product.price?.toString() || '',
      shippingPrice: product.shippingPrice?.toString() || '0'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!productToEdit || !productToEdit.id || !db) return;
    setIsProcessing(true);
    
    const images = productToEdit.imageUrls.split('\n').map((url: string) => url.trim()).filter((url: string) => url !== '');

    try {
      const docRef = doc(db, 'products', productToEdit.id);
      const { id, imageUrls, ...updateData } = productToEdit;
      
      await updateDoc(docRef, {
        ...updateData,
        imageUrl: images[0] || '',
        images: images,
        price: Number(productToEdit.price),
        shippingPrice: Number(productToEdit.shippingPrice) || 0,
        updatedAt: serverTimestamp()
      });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات المنتج بنجاح" });
      setIsEditDialogOpen(false);
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `products/${productToEdit.id}`, operation: 'update' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteProduct = () => {
    if (!db || !productToDeleteId) return;
    const docRef = doc(db, 'products', productToDeleteId);
    deleteDoc(docRef).then(() => {
      toast({ title: "تم الحذف", description: "تم إزالة المنتج من المتجر" });
      setIsDeleteProductDialogOpen(false);
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (!db) return;
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategoryName('');
      setIsAddCategoryDialogOpen(false);
      toast({ title: "تمت الإضافة", description: "تم إضافة الفئة بنجاح" });
    } catch (err: any) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'categories', operation: 'create' }));
    }
  };

  const confirmDeleteCategory = async () => {
    if (!db || !categoryToDeleteId) return;
    const docRef = doc(db, 'categories', categoryToDeleteId);
    deleteDoc(docRef).then(() => {
      toast({ title: "تم الحذف", description: "تم حذف الفئة بنجاح" });
      setIsDeleteCategoryDialogOpen(false);
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    });
  };

  if (authLoading || profileLoading) return <Loading />;

  if (!user || !profile || profile.isAdmin !== true) {
    return (
      <div className="container mx-auto px-4 py-20 text-center" dir="rtl">
        <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-black mb-4">وصول غير مصرح به</h1>
        <Button onClick={() => router.push('/')} className="rounded-none px-8">العودة للرئيسية</Button>
      </div>
    );
  }

  const handleLoadMoreOrders = () => {
    setOrdersLimit(prev => prev + 4);
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen" dir="rtl">
      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {(currentView !== 'menu' || selectedCategoryForProducts) && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (selectedCategoryForProducts) {
                  setSelectedCategoryForProducts(null);
                } else {
                  setCurrentView('menu');
                }
              }} 
              className="rounded-none border-2"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-3xl font-black text-accent">
            {currentView === 'products' && selectedCategoryForProducts ? `منتجات ${selectedCategoryForProducts}` : 'لوحة التحكم'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {currentView === 'products' && selectedCategoryForProducts && (
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-2 border-primary text-primary">
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] rounded-none overflow-y-auto max-h-[90vh]" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="text-2xl font-black">إضافة منتج لـ {selectedCategoryForProducts}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4 text-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">اسم المنتج</Label>
                      <Input id="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="text-right rounded-none" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">الفئة</Label>
                      <select id="category" disabled value={newProduct.category} className="flex h-10 w-full rounded-none border border-input bg-muted px-3 py-2 text-sm cursor-not-allowed">
                        <option value={selectedCategoryForProducts}>{selectedCategoryForProducts}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">السعر ($)</Label>
                      <Input id="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="text-right rounded-none" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shippingPrice">سعر الشحن ($)</Label>
                      <Input id="shippingPrice" type="number" value={newProduct.shippingPrice} onChange={(e) => setNewProduct({...newProduct, shippingPrice: e.target.value})} className="text-right rounded-none" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrls" className="flex items-center gap-2">
                      روابط الصور (رابط واحد في كل سطر) <Images className="h-4 w-4" />
                    </Label>
                    <Textarea 
                      id="imageUrls" 
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      value={newProduct.imageUrls} 
                      onChange={(e) => setNewProduct({...newProduct, imageUrls: e.target.value})} 
                      className="text-right h-32 rounded-none font-mono text-xs" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">الوصف</Label>
                    <Textarea id="desc" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="text-right h-24 rounded-none" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full rounded-none font-bold h-12" onClick={handleAddProduct} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : "نشر المنتج"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {currentView === 'categories' && (
            <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-2 border-primary text-primary">
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-none" dir="rtl">
                <DialogHeader className="text-right">
                  <DialogTitle className="text-2xl font-black">إضافة فئة جديدة</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-right">
                  <div className="grid gap-2">
                    <Label htmlFor="cat-name">اسم الفئة</Label>
                    <Input id="cat-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="text-right rounded-none h-12" />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full rounded-none font-bold h-12" onClick={handleAddCategory}>تأكيد الإضافة</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {currentView === 'menu' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <NavCard title="إدارة الطلبات" desc="متابعة الطلبات النشطة والجديدة." onClick={() => setCurrentView('orders')} />
          <NavCard title="إدارة المنتجات" desc="أضف منتجاتك عبر اختيار الفئة أولاً." onClick={() => { setCurrentView('products'); setSelectedCategoryForProducts(null); }} />
          <NavCard title="إدارة الفئات" desc="إدارة وتعديل الفئات الرئيسية للمتجر." onClick={() => setCurrentView('categories')} />
          <NavCard title="سجل الطلبات" desc="الطلبات المكتملة والمشحونة والملغاة." onClick={() => setCurrentView('order-history')} />
          <NavCard title="إحصائيات المتجر" desc="عرض ملخص شامل للأداء." onClick={() => setCurrentView('dashboard')} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard title="إجمالي المنتجات" value={products?.length || 0} />
              <StatCard title="إجمالي الطلبات" value={orders?.length || 0} />
            </div>
          )}

          {currentView === 'products' && (
            <div>
              {!selectedCategoryForProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories?.map((cat: any) => (
                    <Card 
                      key={cat.id} 
                      className="rounded-none border-2 border-accent/20 overflow-hidden shadow-none transition-all cursor-pointer bg-white hover:bg-muted/50 flex flex-col items-center justify-center p-8 text-center space-y-3"
                      onClick={() => setSelectedCategoryForProducts(cat.name)}
                    >
                      <Folder className="h-10 w-10 text-primary" />
                      <h3 className="text-xl font-bold text-accent">{cat.name}</h3>
                      <p className="text-xs text-muted-foreground">عرض وإدارة منتجات هذه الفئة</p>
                    </Card>
                  ))}
                  {categories?.length === 0 && (
                    <p className="col-span-full text-center py-20 text-muted-foreground">لا توجد فئات حالياً. يرجى إضافة فئة أولاً من قسم إدارة الفئات.</p>
                  )}
                </div>
              ) : (
                <Card className="rounded-none border-2 overflow-hidden shadow-none">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {products?.map((product) => (
                        <div key={product.id} className="flex items-center gap-6 p-6 text-right">
                          <div className="h-20 w-20 relative rounded-none overflow-hidden border bg-white shrink-0">
                            <img src={product.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt="" className="object-cover w-full h-full" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-lg">{product.name}</p>
                              {product.images && product.images.length > 1 && (
                                <Badge variant="outline" className="text-[10px] rounded-none">+{product.images.length - 1} صور</Badge>
                              )}
                            </div>
                            <p className="text-sm font-black text-primary">{product.price} $</p>
                            <div className="flex gap-4 mt-2">
                              <button onClick={() => handleEditProductClick(product)} className="text-xs text-primary font-bold hover:underline">تعديل</button>
                              <button onClick={() => { setProductToDeleteId(product.id); setIsDeleteProductDialogOpen(true); }} className="text-xs text-destructive font-bold hover:underline">حذف</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {products?.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                           <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة حالياً.</p>
                           <Button 
                             onClick={() => setIsAddProductDialogOpen(true)}
                             className="rounded-none gap-2"
                           >
                             <Plus className="h-4 w-4" /> إضافة أول منتج
                           </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentView === 'categories' && (
            <Card className="rounded-none border-2 overflow-hidden shadow-none">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {categories?.map((cat: any) => (
                    <div key={cat.id} className="p-6 flex justify-between items-center text-right">
                      <span className="font-bold text-lg">{cat.name}</span>
                      <button onClick={() => { setCategoryToDeleteId(cat.id); setIsDeleteCategoryDialogOpen(true); }} className="text-xs text-destructive font-bold hover:underline">حذف الفئة</button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(currentView === 'orders' || currentView === 'order-history') && (
            <div className="grid gap-6">
              {(currentView === 'orders' ? activeOrders : historicalOrders).length === 0 ? (
                <p className="text-center py-10">
                  {currentView === 'orders' ? 'لا توجد طلبات نشطة حالياً.' : 'سجل الطلبات فارغ.'}
                </p>
              ) : (
                (currentView === 'orders' ? activeOrders : historicalOrders).map((order: any) => (
                  <OrderCard key={order.id} order={order} onAction={handleUpdateOrderStatus} type={currentView === 'orders' ? 'active' : 'history'} />
                ))
              )}

              {orders?.length === ordersLimit && (
                <div className="mt-8 text-center pb-10">
                  <Button 
                    onClick={handleLoadMoreOrders} 
                    className="rounded-none min-w-[200px] h-12 font-bold"
                    variant="outline"
                    disabled={ordersLoading}
                  >
                    {ordersLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "عرض المزيد من الطلبات"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-none overflow-y-auto max-h-[90vh]" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-2xl font-black">تعديل المنتج</DialogTitle>
          </DialogHeader>
          {productToEdit && (
            <div className="grid gap-6 py-4 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">اسم المنتج</Label>
                  <Input id="edit-name" value={productToEdit.name} onChange={(e) => setProductToEdit({...productToEdit, name: e.target.value})} className="text-right rounded-none" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">الفئة</Label>
                  <select id="edit-category" value={productToEdit.category} onChange={(e) => setProductToEdit({...productToEdit, category: e.target.value})} className="flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm">
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">السعر الحالي ($)</Label>
                  <Input id="edit-price" type="number" value={productToEdit.price} onChange={(e) => setProductToEdit({...productToEdit, price: e.target.value})} className="text-right rounded-none" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-shippingPrice">سعر الشحن ($)</Label>
                  <Input id="edit-shippingPrice" type="number" value={productToEdit.shippingPrice} onChange={(e) => setProductToEdit({...productToEdit, shippingPrice: e.target.value})} className="text-right rounded-none" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrls" className="flex items-center gap-2">
                  روابط الصور (رابط واحد في كل سطر) <Images className="h-4 w-4" />
                </Label>
                <Textarea 
                  id="edit-imageUrls" 
                  value={productToEdit.imageUrls} 
                  onChange={(e) => setProductToEdit({...productToEdit, imageUrls: e.target.value})} 
                  className="text-right h-32 rounded-none font-mono text-xs" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">الوصف</Label>
                <Textarea id="edit-desc" value={productToEdit.description} onChange={(e) => setProductToEdit({...productToEdit, description: e.target.value})} className="text-right h-24 rounded-none" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full rounded-none font-bold h-12" onClick={handleUpdateProduct} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteProductDialogOpen} onOpenChange={setIsDeleteProductDialogOpen}>
        <AlertDialogContent className="rounded-none text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المنتج</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذا المنتج وجميع صوره نهائياً من المتجر.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none">تأكيد الحذف</AlertDialogAction>
            <AlertDialogCancel className="rounded-none">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent className="rounded-none text-right">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الفئة</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذه الفئة نهائياً. لن تتأثر المنتجات المرتبطة بها ولكنها قد تظهر بدون فئة.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-none">تأكيد الحذف</AlertDialogAction>
            <AlertDialogCancel className="rounded-none">إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NavCard({ title, desc, onClick }: { title: string, desc: string, onClick: () => void }) {
  return (
    <Card className="rounded-none border-2 border-accent/20 overflow-hidden shadow-none transition-all cursor-pointer bg-white hover:bg-muted/50" onClick={onClick}>
      <CardContent className="p-8 flex flex-col items-center text-center space-y-3">
        <h3 className="text-xl font-bold text-accent">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function OrderCard({ order, onAction, type }: { order: any, onAction: (id: string, status: string) => void, type: 'active' | 'history' }) {
  return (
    <Card className={cn("rounded-none border-2 border-accent/20 overflow-hidden shadow-none", type === 'history' ? 'opacity-70' : '')}>
      <CardHeader className="bg-muted/30 border-b p-6 flex flex-row justify-between items-center">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{new Date(order.createdAt?.seconds * 1000).toLocaleString('ar-JO')}</p>
          <CardTitle className="text-lg font-bold mt-1 flex items-center gap-2">
            {order.status === 'جديد' && <ShoppingBag className="h-4 w-4 text-primary animate-bounce" />}
            طلب #{order.id.slice(0, 6)}
          </CardTitle>
          {order.transactionId && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
              <Hash className="h-3 w-3" />
              <span>معرف PayPal: {order.transactionId}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={cn("rounded-none px-4 py-1 border-none font-bold", order.status === 'جديد' ? 'bg-primary animate-pulse' : 'bg-secondary')}>
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-right space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-grow">
            <p className="font-bold text-lg">{order.customerName}</p>
            <p className="text-sm text-muted-foreground dir-ltr text-right">+{order.phoneNumber}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
           <Link href={`/admin/order/${order.id}`}>
            <Button variant="outline" size="sm" className="h-8 text-[10px] gap-1 rounded-none border-primary text-primary hover:bg-primary hover:text-white">
              <ExternalLink className="h-3 w-3" /> عرض التفاصيل الكاملة
            </Button>
          </Link>
          <p className="text-2xl font-black text-primary">{order.totalAmount?.toFixed(1)} $</p>
        </div>
        
        {type === 'active' && (
          <div className="flex gap-3 justify-end pt-4 border-t border-accent/5">
            {order.status === 'جديد' && <Button size="sm" className="rounded-none" onClick={() => onAction(order.id, 'قيد التنفيذ')}>بدء التجهيز</Button>}
            {order.status === 'قيد التنفيذ' && <Button size="sm" className="rounded-none bg-secondary" onClick={() => onAction(order.id, 'تم الشحن')}>تم الشحن</Button>}
            <Button size="sm" variant="outline" className="rounded-none text-destructive" onClick={() => onAction(order.id, 'ملغي')}>إلغاء</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, onClick }: { title: string, value: string | number, onClick?: () => void }) {
  return (
    <Card className={cn("rounded-none border-2 border-accent/20 overflow-hidden shadow-none bg-white", onClick ? "cursor-pointer hover:bg-muted/50" : "")} onClick={onClick}>
      <CardContent className="p-8 text-right">
        <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">{title}</p>
        <h3 className="text-3xl font-black text-accent">{value}</h3>
      </CardContent>
    </Card>
  );
}
