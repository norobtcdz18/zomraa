// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyANXo96l5_hP1iTH_K8TaYixdGHJwr6x-0",
  authDomain: "blod-6a25b.firebaseapp.com",
  projectId: "blod-6a25b",
  storageBucket: "blod-6a25b.firebasestorage.app",
  messagingSenderId: "766563585970",
  appId: "1:766563585970:web:ad99353f2dbcbf759a1eab"
});

const messaging = firebase.messaging();

// When a push notification arrives while app is in background
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Background message:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Zomraa';
  const body = payload.notification?.body || payload.data?.body || 'لديك إشعار جديد';

  const options = {
    body: body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    dir: 'rtl',
    tag: payload.data?.tag || 'default',
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(title, options);
});

// When user clicks the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
