'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // توجيه المستخدم بعيداً عن هذه الصفحة لأن الميزة تم إلغاؤها
    router.replace('/');
  }, [router]);

  return null;
}
