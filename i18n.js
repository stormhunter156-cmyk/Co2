// i18n.js – alles direkt eingebaut, kein fetch

const DICTS = {
  de: {
    app: { title: "CO₂ Rechner PWA", heading: "CO₂-Rechner" },
    lang: { label: "Sprache" },
    calc: { title: "Berechnung", distance: "Strecke (km)", mode: "Verkehrsmittel", submit: "Berechnen" },
    modes: {
      car: "Auto",
      bus: "Bus",
      train: "Bahn",
      plane: "Flugzeug (Kurzstrecke)"
    },
    result: {
      text: "Für {km} km per {mode} fallen ca. {kg} kg CO₂ an.",
      note: "(vereinfachte Schätzung)"
    },
    share: {
      native: "Teilen",
      whatsapp: "WhatsApp",
      email: "E-Mail",
      subject: "Mein CO₂-Ergebnis",
      noNative: "Teilen wird nicht unterstützt. Nutze WhatsApp/E-Mail.",
      prefix: "Mein CO₂-Ergebnis"
    },
    compare: {
      title: "Vergleich mit Freunden",
      desc: "Schicke deinen Link oder füge den Link deines Freundes ein.",
      load: "Freundes-Ergebnis laden",
      you: "Dein Ergebnis",
      friend: "Freundes-Ergebnis",
      deltaTitle: "Vergleich",
      delta: "Differenz: {diff} kg CO₂ ({pct}%)",
      invalid: "Ungültiger Link."
    },
    footer: { note: "Offline-fähig • Datenschutz: Alle Berechnungen im Browser" }
  },
  en: {
    app: { title: "CO₂ Calculator PWA", heading: "CO₂ Calculator" },
    lang: { label: "Language" },
    calc: { title: "Calculation", distance: "Distance (km)", mode: "Transport mode", submit: "Calculate" },
    modes: {
      car: "Car",
      bus: "Bus",
      train: "Train",
      plane: "Plane (short haul)"
    },
    result: {
      text: "For {km} km by {mode} about {kg} kg CO₂.",
      note: "(simplified estimate)"
    },
    share: {
      native: "Share",
      whatsapp: "WhatsApp",
      email: "E-mail",
      subject: "My CO₂ result",
      noNative: "Sharing not supported. Use WhatsApp/E-mail.",
      prefix: "My CO₂ result"
    },
    compare: {
      title: "Compare with friends",
      desc: "Send your link or paste your friend's link.",
      load: "Load friend's result",
      you: "Your result",
      friend: "Friend's result",
      deltaTitle: "Comparison",
      delta: "Difference: {diff} kg CO₂ ({pct}%)",
      invalid: "Invalid link."
    },
    footer: { note: "Works offline • Privacy: all calculations in your browser" }
  },
  es: {
    app: { title: "PWA Calculadora de CO₂", heading: "Calculadora de CO₂" },
    lang: { label: "Idioma" },
    calc: { title: "Cálculo", distance: "Distancia (km)", mode: "Medio de transporte", submit: "Calcular" },
    modes: {
      car: "Coche",
      bus: "Autobús",
      train: "Tren",
      plane: "Avión (corta distancia)"
    },
    result: {
      text: "Para {km} km en {mode} se producen aprox. {kg} kg de CO₂.",
      note: "(estimación simplificada)"
    },
    share: {
      native: "Compartir",
      whatsapp: "WhatsApp",
      email: "Correo",
      subject: "Mi resultado de CO₂",
      noNative: "Compartir no está soportado.",
      prefix: "Mi resultado de CO₂"
    },
    compare: {
      title: "Comparar con amigos",
      desc: "Envía tu enlace o pega el enlace de tu amigo.",
      load: "Cargar resultado del amigo",
      you: "Tu resultado",
      friend: "Resultado del amigo",
      deltaTitle: "Comparación",
      delta: "Diferencia: {diff} kg de CO₂ ({pct}%)",
      invalid: "Enlace no válido."
    },
    footer: { note: "Funciona sin conexión • Privacidad: todo en tu navegador" }
  }
};

let currentLang = 'de';
const langListeners = new Set();

function interpolate(str, params = {}) {
  return str.replace(/\{(.*?)\}/g, (_, k) => params[k] ?? '');
}

function get(path) {
  return path.split('.').reduce((obj, key) => (obj && obj[key] != null ? obj[key] : undefined), DICTS[currentLang]);
}

function applyDOM() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = get(key);
    if (!val) return;
    el.textContent = val;
  });
  document.title = get('app.title') || document.title;
  document.documentElement.lang = currentLang;
}

export function t(key, params) {
  const val = get(key) || key;
  return typeof val === 'string' ? interpolate(val, params) : val;
}

export function setLang(lang) {
  if (!DICTS[lang]) return;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyDOM();
  langListeners.forEach((cb) => cb(lang));
}

export function getLang() {
  return currentLang;
}

export function onLangChange(cb) {
  langListeners.add(cb);
}

export function initI18n() {
  const saved = localStorage.getItem('lang');
  const browser = (navigator.language || 'de').slice(0, 2);
  const start = saved || (DICTS[browser] ? browser : 'de');
  currentLang = start;
  applyDOM();
}
