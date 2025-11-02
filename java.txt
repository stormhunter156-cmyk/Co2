// --- PWA Installation prompt handling ---
let deferredPrompt;
const installBtn = document.getElementById('btn-install');
window.addEventListener('beforeinstallprompt', (e) => {
e.preventDefault();
deferredPrompt = e;
installBtn.hidden = false;
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


// --- CO2 calculation ---
const EF = {
car: 171, // g CO2 / km (Durchschnitt, vereinfacht)
bus: 104, // g CO2 / km
train: 41, // g CO2 / km (Fernverkehr ca.)
plane: 255, // g CO2 / km (Kurzstrecke, stark vereinfacht)
};


const form = document.getElementById('form-co2');
const resultEl = document.getElementById('result');
const btnShare = document.getElementById('btn-share');
const btnWA = document.getElementById('btn-wa');
const btnMail = document.getElementById('btn-mail');


let lastText = '';


form.addEventListener('submit', (e) => {
e.preventDefault();
const km = parseFloat(document.getElementById('distance').value);
const mode = document.getElementById('mode').value;
if (!Number.isFinite(km) || km <= 0) return;
const grams = km * (EF[mode] ?? 0);
const kg = grams / 1000;
lastText = `Für ${km.toFixed(1)} km per ${mode} fallen ca. ${kg.toFixed(2)} kg CO₂ an.`;
resultEl.textContent = lastText + ' (vereinfachte Schätzung)';
btnShare.disabled = false;
// Set share links
btnWA.href = `https://wa.me/?text=${encodeURIComponent(lastText)}`;
btnMail.href = `mailto:?subject=${encodeURIComponent('Mein CO₂‑Ergebnis')}&body=${encodeURIComponent(lastText)}`;
});


// --- Web Share API (native share sheet) ---
btnShare.addEventListener('click', async () => {
try {
if (navigator.share) {
await navigator.share({ title: 'CO₂‑Ergebnis', text: lastText, url: location.href });
} else {
alert('Teilen wird von diesem Browser nicht nativ unterstützt. Nutze WhatsApp/E‑Mail.');
}
} catch (e) {
console.warn('Share canceled/failed', e);
}
});