
'use client';

export type FirebaseErrorEvent = 'permission-error';

class FirebaseErrorEmitter extends EventTarget {
  emit(event: FirebaseErrorEvent, detail: any) {
    this.dispatchEvent(new CustomEvent(event, { detail }));
  }

  on(event: FirebaseErrorEvent, callback: (detail: any) => void) {
    const handler = (e: any) => callback(e.detail);
    this.addEventListener(event, handler);
    return () => this.removeEventListener(event, handler);
  }
}

export const errorEmitter = new FirebaseErrorEmitter();
