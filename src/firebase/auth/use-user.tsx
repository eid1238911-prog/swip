'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (!auth) return;
    
    return onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false });
    });
  }, [auth]);

  return useMemo(() => state, [state.user, state.loading]);
}
