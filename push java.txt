// Push via Firebase Cloud Messaging (kostenloses Free Tier)
// 1) Firebase Web-App anlegen -> Config hier einfügen
const firebaseConfig = {
apiKey: 'YOUR_API_KEY',
authDomain: 'YOUR_PROJECT.firebaseapp.com',
projectId: 'YOUR_PROJECT_ID',
storageBucket: 'YOUR_PROJECT.appspot.com',
messagingSenderId: 'YOUR_SENDER_ID',
appId: 'YOUR_APP_ID',
measurementId: 'G-XXXXXXX'
};
const vapidKey = 'YOUR_PUBLIC_VAPID_KEY'; // Firebase Messaging -> Web Push Zertifikate


const btnPush = document.getElementById('btn-push');
const out = document.getElementById('push-status');


async function loadFirebase() {
// dynamisch laden, keine Bundler nötig
const [{ initializeApp }, { getMessaging, getToken, onMessage }] = await Promise.all([
import('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js'),
import('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging.js'),
]);
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
return { getToken, onMessage, messaging };
}


btnPush?.addEventListener('click', async () => {
try {
if (!('Notification' in window)) throw new Error('Browser unterstützt Notifications nicht');
const perm = await Notification.requestPermission();
if (perm !== 'granted') throw new Error('Benachrichtigungen nicht erlaubt');


const { getToken, onMessage, messaging } = await loadFirebase();
// Service Worker für FCM muss unter /public/firebase-messaging-sw.js liegen
const reg = await navigator.serviceWorker.register('/public/firebase-messaging-sw.js');


const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: reg });
out.textContent = 'FCM Token:\n' + token + '\n\n(Sende Test-Push über Firebase Console / Server)';


onMessage(messaging, (payload) => {
console.log('FG message', payload);
out.textContent = 'Nachricht empfangen (Foreground):\n' + JSON.stringify(payload, null, 2);
});
} catch (e) {
out.textContent = 'Fehler: ' + e.message;
}
});