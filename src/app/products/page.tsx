'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Search, Filter, LayoutGrid, Loader2, Plus } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import Loading from '../loading';

export default function AllProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [fetchLimit, setFetchLimit] = useState(3);
  
  const db = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    
    let baseQuery = collection(db, 'products');
    let queryConstraints = [orderBy('createdAt', 'desc'), limit(fetchLimit)];
    
    return query(baseQuery, ...queryConstraints);
  }, [db, fetchLimit]);

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
    return products?.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'الكل' || product.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    }) || [];
  }, [products, searchQuery, activeCategory]);

  useEffect(() => {
    setFetchLimit(3);
  }, [activeCategory, searchQuery]);

  const handleLoadMore = () => {
    setFetchLimit(prev => prev + 3);
  };

  const loading = productsLoading || catsLoading;

  if (loading && filteredProducts.length === 0) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-12" dir="rtl">
      <div className="bg-white p-6 rounded-3xl border shadow-sm mb-12 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative w-full md:w-1/3">
          <Input 
            type="text" 
            placeholder="ابحث عن حل لمشكلتك..." 
            className="pr-12 pl-4 h-12 rounded-full border-2 focus:border-primary focus-visible:ring-0 text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth w-full md:w-auto md:mr-auto">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              className={`rounded-full px-6 transition-all flex-shrink-0 whitespace-nowrap ${activeCategory === cat ? 'bg-primary text-white shadow-md' : 'hover:border-primary hover:text-primary'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-accent">المعروض حالياً</h2>
        </div>
        {activeCategory !== 'الكل' && (
          <Badge variant="secondary" className="px-4 py-1 rounded-full bg-secondary/10 text-secondary border-secondary/20">
            فئة: {activeCategory}
          </Badge>
        )}
      </div>

      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-muted/20 rounded-2xl h-full cursor-pointer flex flex-col">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.imageUrl || 'https://picsum.photos/seed/placeholder/600/400'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary text-white px-2 py-0.5 rounded-full text-[10px] font-bold">حل ذكي</Badge>
                  </div>
                  <CardHeader className="pb-2 text-right">
                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-right flex-grow">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center pt-4 border-t border-muted/30 mt-auto">
                    <div className="flex flex-col text-right">
                      <span className="text-lg font-black text-accent">{product.price} $</span>
                    </div>
                    <Button size="sm" className="rounded-full bg-accent hover:bg-primary transition-colors gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      أضف
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
          
          {products?.length === fetchLimit && (
            <div className="mt-12 text-center">
              <Button 
                onClick={handleLoadMore}
                className="rounded-full px-10 h-12 font-black border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white transition-all gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>جلب المزيد من المنتجات <Plus className="h-5 w-5" /></>}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-bold text-muted-foreground">عذراً، لم نجد حلولاً تطابق بحثك</h3>
          <Button variant="link" onClick={() => { setSearchQuery(''); setActiveCategory('الكل'); }} className="mt-2 text-primary">
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}
    </div>
  );
}
