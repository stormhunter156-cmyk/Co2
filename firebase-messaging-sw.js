// Läuft im Service Worker Kontext für FCM
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');


firebase.initializeApp({
apiKey: 'YOUR_API_KEY',
authDomain: 'YOUR_PROJECT.firebaseapp.com',
projectId: 'YOUR_PROJECT_ID',
storageBucket: 'YOUR_PROJECT.appspot.com',
messagingSenderId: 'YOUR_SENDER_ID',
appId: 'YOUR_APP_ID'
});


const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
const { title = 'Push', body = '', icon = '/public/icons/icon-192.png' } = payload?.notification || {};
self.registration.showNotification(title, { body, icon });
});