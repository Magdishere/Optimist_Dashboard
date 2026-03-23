/* eslint-disable no-undef */
/* eslint-env serviceworker */
// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBrmpi4LoNSOdIA1FZiYlbrJoy_KKImiPE",
  authDomain: "optimist-f04f0.firebaseapp.com",
  projectId: "optimist-f04f0",
  storageBucket: "optimist-f04f0.firebasestorage.app",
  messagingSenderId: "946195402627",
  appId: "1:946195402627:web:1b85b6f90c107de3a370b6"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'optimist_logo_192.png', // Correct brand logo filename
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.onnotificationclick = (event) => {
  event.notification.close();
  
  // Get the sub-path from the current location (e.g., /Optimist_Dashboard/)
  const fullPath = self.location.pathname;
  const subPath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
  
  const urlToOpen = `${self.location.origin}${subPath}#/orders`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
};
