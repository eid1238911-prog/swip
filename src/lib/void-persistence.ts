export const VOID_STORAGE_KEY = 'nuqta_session_data';

export interface VoidSession {
  startTime: number;
  lastActive: number;
  totalDuration: number;
}

export const getSessionData = (): VoidSession => {
  if (typeof window === 'undefined') return { startTime: Date.now(), lastActive: Date.now(), totalDuration: 0 };
  const data = localStorage.getItem(VOID_STORAGE_KEY);
  if (!data) {
    const newSession = { startTime: Date.now(), lastActive: Date.now(), totalDuration: 0 };
    localStorage.setItem(VOID_STORAGE_KEY, JSON.stringify(newSession));
    return newSession;
  }
  return JSON.parse(data);
};

export const updateSessionData = () => {
  if (typeof window === 'undefined') return;
  const current = getSessionData();
  const now = Date.now();
  const diff = now - current.lastActive;
  
  const updated: VoidSession = {
    ...current,
    lastActive: now,
    totalDuration: current.totalDuration + diff
  };
  
  localStorage.setItem(VOID_STORAGE_KEY, JSON.stringify(updated));
};

export const resetSessionData = () => {
  if (typeof window === 'undefined') return;
  const newSession = { startTime: Date.now(), lastActive: Date.now(), totalDuration: 0 };
  localStorage.setItem(VOID_STORAGE_KEY, JSON.stringify(newSession));
};