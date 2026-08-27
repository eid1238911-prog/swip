
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseInstance, setFirebaseInstance] = useState<{
    app: FirebaseApp;
    db: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
  } | null>(null);

  useEffect(() => {
    const { app, auth, db, storage } = initializeFirebase();
    setFirebaseInstance({ app, auth, db, storage });
  }, []);

  return (
    <FirebaseProvider 
      app={firebaseInstance?.app ?? null} 
      db={firebaseInstance?.db ?? null} 
      auth={firebaseInstance?.auth ?? null}
      storage={firebaseInstance?.storage ?? null}
    >
      {children}
    </FirebaseProvider>
  );
};
