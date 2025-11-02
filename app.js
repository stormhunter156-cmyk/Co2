import { initI18n, t, setLang, getLang, onLangChange } from './i18n.js';

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

let last = null;        // {km, mode, kg}
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
  const r = b64urlEncode(JSON.stringify(payload));
  const url = new URL(location.href);
  url.searchParams.set('r', r);
  return url.toString();
}
function parseFromLocation(){
  try{
    const r = new URL(location.href).searchParams.get('r');
    if(!r) return null;
    return JSON.parse(b64urlDecode(r));
  }catch{ return null; }
}

function updateShareLinks(){
  if(!last){ btnShare.disabled = true; return; }
  lastShareURL = buildShareURL(last);
  btnShare.disabled = false;
  btnWA.href = `https://wa.me/?text=${encodeURIComponent(t('share.prefix')+': '+formatLine(last)+'\\n'+lastShareURL)}`;
  btnMail.href = `mailto:?subject=${encodeURIComponent(t('share.subject'))}&body=${encodeURIComponent(formatLine(last)+'\\n'+lastShareURL)}`;
}

function formatLine(obj){
  return t('result.text', { km: Number(obj.km).toFixed(1), mode: t(\`modes.\${obj.mode}\`), kg: Number(obj.kg).toFixed(2) });
}

function renderCompare(friend){
  if(last){ youResult.textContent = formatLine(last); } else { youResult.textContent = '—'; }
  if(friend || currentFriend){ friendResult.textContent = formatLine(friend || currentFriend); }
  const me = last; const fr = friend || currentFriend;
  if(me && fr){
    const d = (me.kg - fr.kg);
    const sign = d===0 ? '' : (d>0 ? '+' : '');
    const pct = fr.kg ? (d / fr.kg * 100) : 0;
    compareOut.textContent = t('compare.delta', { diff: (sign + d.toFixed(2)), pct: pct.toFixed(1) });
  }
}

// ---- FIX: robust number parsing for commas etc. ----
function parseKm() {
  const el = document.getElementById('distance');
  const n = el.valueAsNumber;
  if (Number.isFinite(n)) return n;
  const txt = (el.value || '').replace(/\\s+/g,'').replace(',', '.');
  const f = parseFloat(txt);
  return Number.isFinite(f) ? f : NaN;
}

// On submit → calculate & update share links and comparison
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const km = parseKm();
  const mode = document.getElementById('mode').value;
  if (!Number.isFinite(km) || km <= 0) {
    resultEl.textContent = 'Bitte gültige Strecke eingeben';
    return;
  }
  const factor = EF[mode];
  if (!factor) return;
  const grams = km * factor;
  const kg = grams / 1000;
  last = { km, mode, kg };
  const txt = formatLine(last);
  resultEl.textContent = txt + ' ' + t('result.note');
  updateShareLinks();
  renderCompare();
});

// Native share button → include link with encoded result
btnShare.addEventListener('click', async () => {
  try {
    if (!last) return;
    if (navigator.share) {
      await navigator.share({ title: t('share.subject'), text: formatLine(last), url: lastShareURL || buildShareURL(last) });
    } else {
      alert(t('share.noNative'));
    }
  } catch (e) { console.warn('Share canceled/failed', e); }
});

// Load friend result from pasted URL
btnLoadFriend?.addEventListener('click', () => {
  const val = friendUrlInput?.value?.trim();
  try{
    const data = val ? JSON.parse(b64urlDecode(new URL(val).searchParams.get('r'))) : null;
    if(!data) throw new Error();
    currentFriend = { km: Number(data.km), mode: data.mode, kg: Number(data.kg) };
    renderCompare(currentFriend);
  }catch{ alert(t('compare.invalid')); }
});

// If opened from a shared link → show banner & preload friend's result
(function initFromQuery(){
  const data = parseFromLocation();
  if(!data) return;
  currentFriend = { km:Number(data.km), mode:data.mode, kg:Number(data.kg) };
  bannerText.textContent = t('compare.banner');
  banner.hidden = false;
  renderCompare(currentFriend);
})();

bannerClose?.addEventListener('click', ()=>{ banner.hidden = true; });
