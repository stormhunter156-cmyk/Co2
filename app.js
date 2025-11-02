nerCloseimport { initI18n, t, setLang, getLang, onLangChange } from './i18n.js';


// --- PWA Installation prompt handling ---
let deferredPrompt;
const installBtn = document.getElementById('btn-install');
window.addEventListener('beforeinstallprompt', (e) => {
e.preventDefault();
deferredPrompt = e;
if (installBtn) installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
installBtn.hidden = true;
await deferredPrompt?.prompt();
deferredPrompt = null;
});


// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('/public/sw.js');
}


// --- CO2 calculation factors (simplified) ---
const EF = { car: 171, bus: 104, train: 41, plane: 255 };


const form = document.getElementById('form-co2');
const resultEl = document.getElementById('result');
const btnShare = document.getElementById('btn-share');
const btnWA = document.getElementById('btn-wa');
const btnMail = document.getElementById('btn-mail');
const langSelect = document.getElementById('lang');


// Compare elements
const youResult = document.getElementById('you-result');
const friendResult = document.getElementById('friend-result');
const compareOut = document.getElementById('compare-out');
const friendUrlInput = document.getElementById('friend-url');
const btnLoadFriend = document.getElementById('btn-load-friend');


// Banner
const banner = document.getElementById('share-banner');
const bannerText = document.getElementById('share-banner-text');
const bannerClose = document.getElementById('share-banner-close');


let last = null; // {km, mode, kg}
let lastShareURL = null; // shareable URL with encoded data
let currentFriend = null; // friend payload decoded from ?r=


// i18n init + UI language select
await initI18n();
langSelect.value = getLang();
langSelect.addEventListener('change', (e) => setLang(e.target.value));
onLangChange((lng) => { document.documentElement.lang = lng; updateShareLinks(); renderCompare(); });


// --- Share URL helpers ---
function b64urlEncode(str){
return btoa(unescape(encodeURIComponent(str))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
function b64urlDecode(str){
str = str.replaceAll('-','+').replaceAll('_','/');
while (str.length % 4) str += '=';
return decodeURIComponent(escape(atob(str)));
}
function buildShareURL(obj){
const payload = { ...obj, v:1, lang:getLang(), ts:Date.now() };
ban?.addEventListener('click', ()=>{ banner.hidden = true; });
