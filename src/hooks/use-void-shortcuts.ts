'use client';

import { useEffect } from 'react';
import { resetSessionData, getSessionData } from '@/lib/void-persistence';

export const useVoidShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // All shortcuts are non-visual and perform background actions
      
      // Shortcut: 'C' - Log invisible session status to console (developer peek)
      if (e.key.toLowerCase() === 'c') {
        const session = getSessionData();
        console.log(`Nuqta: Current session duration: ${Math.floor(session.totalDuration / 1000)}s`);
      }

      // Shortcut: 'R' - Reset session invisibly
      if (e.key.toLowerCase() === 'r') {
        resetSessionData();
        console.log('Nuqta: Void reset.');
      }

      // Shortcut: 'Q' - Log help to console
      if (e.key === '?') {
        console.log('Nuqta Zero-Element Navigation:');
        console.log('[C] Check duration');
        console.log('[R] Reset void');
        console.log('[?] This menu');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};