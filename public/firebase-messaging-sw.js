
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCp4UxBu_1or_39yLRotUbvGPlu4MxVjks",
  authDomain: "hallha2026.firebaseapp.com",
  projectId: "hallha2026",
  storageBucket: "hallha2026.firebasestorage.app",
  messagingSenderId: "211959017523",
  appId: "1:211959017523:web:1e9c03a80470ba6830f346"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico',
    data: payload.data,
    badge: '/favicon.ico',
    dir: 'rtl'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
