'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  LogOut, 
  LayoutDashboard, 
  User as UserIcon, 
  Package, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminPage = pathname?.startsWith('/admin');

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc<any>(userRef);
  const isAdmin = profile?.isAdmin === true;

  const handleSignOut = () => {
    if (auth) {
      signOut(auth).then(() => {
        toast({ title: "تم تسجيل الخروج", description: "نتمنى رؤيتك قريباً في JocMart." });
        router.push('/');
      });
    }
  };

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'حسابي';

  return (
    <header dir="rtl" className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {!mounted ? (
            <Skeleton className="h-10 w-24 rounded-lg" />
          ) : (
            <div className="bg-primary text-white p-2 rounded-lg font-bold text-xl shadow-sm hover:shadow-md transition-shadow">
              JocMart
            </div>
          )}
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/' ? 'text-primary font-bold' : 'text-foreground'}`}
          >
            الرئيسية
          </Link>
          <Link 
            href="/products" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/products' ? 'text-primary font-bold' : 'text-foreground'}`}
          >
            المنتجات
          </Link>
          <Link 
            href="/about" 
            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/about' ? 'text-primary font-bold' : 'text-foreground'}`}
          >
            عن المتجر
          </Link>
        </nav>

        {/* User & Cart Actions */}
        <div className="flex items-center gap-3">
          {!mounted || loading ? (
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full gap-2 px-3 border-2 border-primary/20 hover:border-primary/50 transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {displayName[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-xs max-w-[100px] truncate hidden sm:inline">{displayName}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2 text-right">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-right justify-start gap-2">
                    <Link href="/profile">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span>الملف الشخصي</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-right justify-start gap-2">
                    <Link href="/profile?tab=orders">
                      <Package className="h-4 w-4 text-primary" />
                      <span>طلباتي</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2 text-right justify-start gap-2 text-primary font-bold">
                      <Link href="/admin">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        <span>لوحة التحكم</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="rounded-xl cursor-pointer py-2 text-destructive focus:bg-destructive/10 focus:text-destructive text-right justify-start gap-2 font-bold"
                  >
                    <LogOut className="h-4 w-4 text-destructive" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-4 font-bold text-xs gap-1.5 border-2 border-primary/30 hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <UserIcon className="h-4 w-4" />
                <span>دخول / تسجيل</span>
              </Button>
            </Link>
          )}
          
          {mounted && !isAdminPage && (
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative rounded-full border-2 hover:border-primary/50 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-primary">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}