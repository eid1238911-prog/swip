'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LockKeyhole, UserPlus, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AuthContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
  const redirectUrl = searchParams.get('redirect') || '/';

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab as 'login' | 'signup');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth || !db) return;
    if (!loginEmail.trim() || !loginPassword) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إدخال البريد الإلكتروني وكلمة المرور." });
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      const user = userCredential.user;

      // فحص صلاحيات المستخدم
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const isAdmin = userDoc.exists() && userDoc.data()?.isAdmin === true;

      toast({ 
        title: "تم تسجيل الدخول بنجاح", 
        description: `أهلاً بك${user.displayName ? `، ${user.displayName}` : ''}!`
      });

      if (isAdmin && redirectUrl === '/') {
        router.push('/admin');
      } else {
        router.push(redirectUrl);
      }
    } catch (error: any) {
      let errorMessage = "حدث خطأ أثناء تسجيل الدخول.";
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' || 
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "تم تجاوز عدد المحاولات المسموح بها، يرجى المحاولة لاحقاً.";
      }
      toast({ 
        variant: "destructive", 
        title: "فشل الدخول", 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth || !db) return;

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تعبئة جميع الحقول المطلوبة." });
      return;
    }

    if (signupPassword.length < 6) {
      toast({ variant: "destructive", title: "كلمة المرور قصيرة", description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({ variant: "destructive", title: "عدم تطابق", description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين." });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const user = userCredential.user;

      // تحديث الاسم في Auth Profile
      await updateProfile(user, {
        displayName: signupName.trim()
      });

      // حفظ المستند في Firestore
      const cleanedPhone = signupPhone.replace('+', '').replace(/\s/g, '');
      await setDoc(doc(db, 'users', user.uid), {
        displayName: signupName.trim(),
        email: signupEmail.trim(),
        phoneNumber: cleanedPhone,
        isAdmin: false,
        createdAt: serverTimestamp()
      });

      toast({ 
        title: "تم إنشاء الحساب بنجاح!", 
        description: "مرحباً بك في عائلة JocMart. نتمنى لك تجربة تسوق ممتعة."
      });

      router.push(redirectUrl);
    } catch (error: any) {
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول بدلاً من ذلك.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "صيغة البريد الإلكتروني غير صحيحة.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور ضعيفة جداً.";
      }
      toast({ 
        variant: "destructive", 
        title: "فشل إنشاء الحساب", 
        description: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center items-center min-h-[75vh]" dir="rtl">
      <Card className="w-full max-w-lg border-2 rounded-3xl overflow-hidden shadow-2xl bg-white">
        <CardHeader className="bg-muted/30 text-center pb-6 pt-8">
          <Link href="/" className="inline-block mx-auto mb-3">
            <div className="bg-primary text-white px-5 py-2 rounded-2xl font-black text-2xl shadow-md hover:scale-105 transition-transform">
              JocMart
            </div>
          </Link>
          <CardTitle className="text-2xl font-black text-accent">بوابتك للحلول الذكية</CardTitle>
          <CardDescription className="text-sm">سجل دخولك أو أنشئ حساباً جديداً للوصول إلى طلباتك وتسهيل مشترياتك</CardDescription>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'login' | 'signup')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-8 h-12 rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="login" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                تسجيل الدخول
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                إنشاء حساب جديد
              </TabsTrigger>
            </TabsList>

            {/* TAB: LOGIN */}
            <TabsContent value="login" className="space-y-4 focus-visible:outline-none">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="email-login" className="font-bold flex items-center gap-1.5 justify-end">
                    البريد الإلكتروني <Mail className="h-4 w-4 text-primary" />
                  </Label>
                  <Input 
                    id="email-login" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                    required
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="password-login" className="font-bold flex items-center gap-1.5 justify-end">
                    كلمة المرور <LockKeyhole className="h-4 w-4 text-primary" />
                  </Label>
                  <Input 
                    id="password-login" 
                    type="password" 
                    placeholder="••••••••"
                    value={loginPassword} 
                    onChange={(e) => setLoginPassword(e.target.value)} 
                    className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full rounded-full h-12 font-bold text-base gap-2 mt-6 bg-primary hover:bg-primary/90 shadow-md" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LockKeyhole className="h-5 w-5" /> تسجيل الدخول</>}
                </Button>
              </form>
            </TabsContent>

            {/* TAB: SIGNUP */}
            <TabsContent value="signup" className="space-y-4 focus-visible:outline-none">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="signup-name" className="font-bold flex items-center gap-1.5 justify-end">
                    الاسم الكامل <User className="h-4 w-4 text-primary" />
                  </Label>
                  <Input 
                    id="signup-name" 
                    placeholder="أحمد علي" 
                    type="text" 
                    value={signupName} 
                    onChange={(e) => setSignupName(e.target.value)} 
                    className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                    required
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="signup-email" className="font-bold flex items-center gap-1.5 justify-end">
                    البريد الإلكتروني <Mail className="h-4 w-4 text-primary" />
                  </Label>
                  <Input 
                    id="signup-email" 
                    placeholder="name@example.com" 
                    type="email" 
                    value={signupEmail} 
                    onChange={(e) => setSignupEmail(e.target.value)} 
                    className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                    required
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="signup-phone" className="font-bold flex items-center gap-1.5 justify-end">
                    رقم الهاتف (بالصيغة الدولية) <Phone className="h-4 w-4 text-primary" />
                  </Label>
                  <Input 
                    id="signup-phone" 
                    placeholder="962776573220" 
                    type="tel" 
                    value={signupPhone} 
                    onChange={(e) => setSignupPhone(e.target.value)} 
                    className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-password" className="font-bold">كلمة المرور</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••"
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                      required
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label htmlFor="signup-confirm-password" className="font-bold">تأكيد كلمة المرور</Label>
                    <Input 
                      id="signup-confirm-password" 
                      type="password" 
                      placeholder="••••••••"
                      value={signupConfirmPassword} 
                      onChange={(e) => setSignupConfirmPassword(e.target.value)} 
                      className="text-right rounded-2xl h-12 border-2 focus:border-primary focus-visible:ring-0" 
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full rounded-full h-12 font-bold text-base gap-2 mt-6 bg-primary hover:bg-primary/90 shadow-md" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><UserPlus className="h-5 w-5" /> إنشاء الحساب الآن</>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="bg-muted/10 justify-between items-center py-4 px-6 border-t">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-bold">
            <ArrowLeft className="h-3.5 w-3.5" /> العودة للرئيسية
          </Link>
          <span className="text-xs text-muted-foreground">تسوق آمن ومحمي 100%</span>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
