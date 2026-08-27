'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  ChevronDown 
} from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(12));
  }, [db]);

  const { data: products, loading: productsLoading } = useCollection<any>(productsQuery);

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'categories'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: dbCategories, loading: catsLoading } = useCollection<any>(categoriesQuery);

  const categories = useMemo(() => {
    const list = ['الكل'];
    if (dbCategories) {
      dbCategories.forEach(cat => list.push(cat.name));
    }
    return list;
  }, [dbCategories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'الكل' || product.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const displayedProducts = useMemo(() => {
    if (activeCategory === 'الكل' && !searchTerm) {
      return filteredProducts.slice(0, 6);
    }
    return filteredProducts;
  }, [filteredProducts, activeCategory, searchTerm]);

  const showMoreButton = activeCategory === 'الكل' && !searchTerm && filteredProducts.length > 6;
  const isInitialLoading = productsLoading && catsLoading;

  return (
    <div className="flex flex-col font-sans" dir="rtl">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-muted/30 to-background py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs md:text-sm animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span>الحلول الذكية تبدأ من هنا</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-accent tracking-tight leading-tight">
            مرحباً بك في <span className="text-primary">JocMart</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            وجهتكم الأولى لاكتشاف وتسوّق أحدث المنتجات المبتكرة والحلول الذكية التي تحل تحديات الحياة اليومية بأسلوب عصري وأنيق.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4 flex-wrap">
            <a href="#products-section">
              <Button size="lg" className="rounded-full px-8 h-14 font-bold text-base bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all gap-2">
                تصفح المنتجات الآن <ChevronDown className="h-5 w-5" />
              </Button>
            </a>
            <Link href="/about">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 font-bold text-base border-2 hover:bg-muted/50 transition-all">
                عن المتجر
              </Button>
            </Link>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-right">
            <div className="bg-white/80 backdrop-blur p-5 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-accent">شحن دولي مباشر</h4>
                <p className="text-xs text-muted-foreground">توصيل من الموردين لعنوانك</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur p-5 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-accent">دفع آمن 100%</h4>
                <p className="text-xs text-muted-foreground">حماية كاملة عبر PayPal</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur p-5 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-accent">دعم عبر الواتساب</h4>
                <p className="text-xs text-muted-foreground">مساعدة فورية ومتابعة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCTS & SEARCH SECTION */}
      <section id="products-section" className="pt-12 pb-20 bg-background">
        <div className="container mx-auto px-4">
          
          {/* Search & Categories Bar */}
          <div className="max-w-2xl mx-auto mb-16 space-y-6">
            {isInitialLoading ? (
              <Skeleton className="w-full h-14 rounded-full shadow-sm" />
            ) : (
              <div className="relative group">
                <Input 
                  type="text" 
                  placeholder="ابحث عن منتج أو حل ذكي..." 
                  className="w-full h-14 rounded-full border-2 pr-12 pl-6 text-right focus:border-primary focus-visible:ring-0 transition-all shadow-sm group-hover:shadow-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
            )}

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {catsLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
                ))
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-6 py-2 rounded-full border-2 text-sm font-bold whitespace-nowrap transition-all duration-300",
                      activeCategory === cat 
                        ? "bg-primary border-primary text-white shadow-md scale-105" 
                        : "bg-white border-muted text-muted-foreground hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    {cat}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productsLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-4">
                  <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-6 w-3/4 ml-auto" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                  </div>
                </div>
              ))
            ) : displayedProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground font-bold">
                  {searchTerm ? 'عذراً، لم نجد نتائج تطابق بحثك.' : 'لا توجد منتجات منشورة حالياً في هذه الفئة.'}
                </p>
                <Button 
                  variant="link" 
                  onClick={() => {setSearchTerm(''); setActiveCategory('الكل');}}
                  className="mt-2 text-primary"
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              displayedProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id}>
                  <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-muted/20 rounded-3xl h-full cursor-pointer flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={product.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        data-ai-hint="smart product"
                      />
                      <Badge className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg">
                        {product.category || 'حل ذكي'}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2 text-right">
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-right flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-4 border-t border-muted/30 mt-auto">
                      <div className="flex flex-col text-right">
                        <span className="text-xl font-black text-accent">{product.price} $</span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">شامل الضريبة</span>
                      </div>
                      <Button size="sm" className="gap-2 rounded-full px-5 bg-accent hover:bg-primary transition-all duration-300 shadow-md hover:shadow-lg">
                        <ShoppingCart className="h-4 w-4" /> أضف للسلة
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            )}
          </div>
          
          {!productsLoading && showMoreButton && (
            <div className="mt-16 text-center">
              <Link href="/products">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full px-12 h-14 font-black text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all group gap-3 shadow-sm hover:shadow-md"
                >
                  عرض جميع المنتجات <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
