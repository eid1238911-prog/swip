
'use client';

import { useMemo } from 'react';

/**
 * A utility hook to stabilize Firebase references (Collection, Query, Document).
 * This prevents infinite re-renders caused by creating new object instances on every render.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
