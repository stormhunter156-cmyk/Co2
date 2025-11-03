import { initI18n, t, setLang, getLang, onLangChange } from './i18n.js';

// i18n starten
initI18n();

// Elemente holen
const form = document.getElementById('form-co2');
const resultEl = document.getElementById('result');
const langSelect = document.getElementById('lang');
const btnShare = document.getElementById('btn-share');
const btnWA = document.getElementById('btn-wa');
const btnMail = document.getElementById('btn-mail');

const youResult = document.getElementById('you-result');
const friendResult = document.getElementById('friend-result');
const compareOut = document.getElementById('compare-out');

const friendUrlInput = document.getElementById('friend-url');
const btnLoadFriend = document.getElementById('btn-load-friend');

// Emissionsfaktoren in g CO2 / km
const EF = {
  car: 171,
  bus: 104,
  train: 41,
  plane: 255
};

let myResult = null;
let friendData = null;
let lastShareUrl = null;

// Sprach-Select initial setzen
langSelect.value = getLang();
langSelect.addEventListener('change', (e) => {
  setLang(e.target.value);
  updateShareButtons();   // damit Betreff / Text zur Sprache passt
  renderCompare();
});
onLangChange(() => {
  // falls wir später noch Dinge updaten müssen
  updateShareButtons();
  renderCompare();
});

// Hilfen
function parseKm() {
  const raw = document.getElementById('distance').value.trim();
  if (!raw) return NaN;
  const txt = raw.replace(',', '.').replace(/\s+/g, '');
  const num = parseFloat(txt);
  return Number.isFinite(num) ? num : NaN;
}

function formatResult(obj) {
  return t('result.text', {
    km: obj.km.toFixed(1),
    mode: t(`modes.${obj.mode}`),
    kg: obj.kg.toFixed(2)
  });
}

function buildShareURL(obj) {
  const payload = {
    km: obj.km,
    mode: obj.mode,
    kg: obj.kg,
    lang: getLang()
  };
  const encoded = btoa(JSON.stringify(payload));
  const url = new URL(window.location.href);
  url.searchParams.set('r', encoded);
  return url.toString();
}

function readSharedFromUrl() {
  const url = new URL(window.location.href);
  const r = url.searchParams.get('r');
  if (!r) return null;
  try {
    return JSON.parse(atob(r));
  } catch (e) {
    return null;
  }
}

function updateShareButtons() {
  if (!myResult) {
    btnShare.disabled = true;
    return;
  }
  lastShareUrl = buildShareURL(myResult);
  btnShare.disabled = false;
  const text = formatResult(myResult);
  btnWA.href = `https://wa.me/?text=${encodeURIComponent(text + '\n' + lastShareUrl)}`;
  btnMail.href = `mailto:?subject=${encodeURIComponent(t('share.subject'))}&body=${encodeURIComponent(text + '\n' + lastShareUrl)}`;
}

function renderCompare() {
  youResult.textContent = myResult ? formatResult(myResult) : '—';
  friendResult.textContent = friendData ? formatResult(friendData) : '—';

  if (myResult && friendData) {
    const diff = myResult.kg - friendData.kg;
    const pct = friendData.kg ? (diff / friendData.kg) * 100 : 0;
    compareOut.textContent = t('compare.delta', {
      diff: diff.toFixed(2),
      pct: pct.toFixed(1)
    });
  } else {
    compareOut.textContent = '—';
  }
}

// Formular: CO2 berechnen
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const km = parseKm();
  const mode = document.getElementById('mode').value;
  if (!Number.isFinite(km) || km <= 0) {
    resultEl.textContent = 'Bitte gültige Strecke eingeben';
    return;
  }
  const factor = EF[mode];
  const grams = km * factor;
  const kg = grams / 1000;
  myResult = { km, mode, kg };
  resultEl.textContent = formatResult(myResult) + ' ' + t('result.note');
  updateShareButtons();
  renderCompare();
});

// Native share
btnShare.addEventListener('click', async () => {
  if (!myResult) return;
  const text = formatResult(myResult);
  const url = lastShareUrl || buildShareURL(myResult);
  if (navigator.share) {
    await navigator.share({
      title: t('share.subject'),
      text,
      url
    });
  } else {
    alert(t('share.noNative'));
  }
});

// Freundes-Link laden
btnLoadFriend.addEventListener('click', () => {
  const val = friendUrlInput.value.trim();
  try {
    const u = new URL(val);
    const r = u.searchParams.get('r');
    if (!r) throw new Error();
    const data = JSON.parse(atob(r));
    friendData = {
      km: Number(data.km),
      mode: data.mode,
      kg: Number(data.kg)
    };
    renderCompare();
  } catch (e) {
    alert(t('compare.invalid'));
  }
});

// Falls Seite über geteilten Link geöffnet wurde
const shared = readSharedFromUrl();
if (shared) {
  friendData = {
    km: Number(shared.km),
    mode: shared.mode,
    kg: Number(shared.kg)
  };
  renderCompare();
}
