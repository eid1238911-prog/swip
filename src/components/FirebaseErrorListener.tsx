
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * A central listener for Firebase related errors.
 * In development, these are surfaced as uncaught exceptions to trigger the Next.js error overlay.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // Throwing the error here will trigger the Next.js development error overlay
      // providing rich context for debugging Security Rules.
      throw error;
    });

    return () => unsubscribe();
  }, []);

  return null;
}
