nerCloseimport { initI18n, t, setLang, getLang, onLangChange } from './i18n.js';
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
btnWA.href = `https://wa.me/?text=${encodeURIComponent(t('share.prefix')+': '+formatLine(last)+'
'+lastShareURL)}`;
btnMail.href = `mailto:?subject=${encodeURIComponent(t('share.subject'))}&body=${encodeURIComponent(formatLine(last)+'
'+lastShareURL)}`;
}


function formatLine(obj){
return t('result.text', { km: Number(obj.km).toFixed(1), mode: t(`modes.${obj.mode}`), kg: Number(obj.kg).toFixed(2) });
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


// On submit → calculate & update share links and comparison
form.addEventListener('submit', (e) => {
e.preventDefault();
const km = parseFloat(document.getElementById('distance').value);
const mode = document.getElementById('mode').value;
if (!Number.isFinite(km) || km <= 0) return;
const grams = km * (EF[mode] ?? 0);
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


ban?.addEventListener('click', ()=>{ banner.hidden = true; });
