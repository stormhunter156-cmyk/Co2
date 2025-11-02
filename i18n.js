// Tiny i18n helper (no framework)
const SUPPORTED = ['de', 'en', 'es'];
let current = null;
let dict = {};
const listeners = new Set();


function detect() {
const saved = localStorage.getItem('lang');
if (saved && SUPPORTED.includes(saved)) return saved;
const nav = (navigator.languages?.[0] || navigator.language || 'en').slice(0,2);
return SUPPORTED.includes(nav) ? nav : 'en';
}


function interpolate(str, params={}) {
return str.replace(/\{(.*?)\}/g, (_, k) => params[k] ?? '');
}


async function load(lng) {
const res = await fetch(`/locales/${lng}.json`);
dict = await res.json();
}


function apply() {
document.querySelectorAll('[data-i18n]').forEach(el => {
const key = el.getAttribute('data-i18n');
const val = get(key);
if (!val) return;
if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
if (el.hasAttribute('placeholder')) el.setAttribute('placeholder', val);
} else {
el.textContent = val;
}
});
}


function get(path) {
return path.split('.').reduce((a,k)=> (a && a[k] != null ? a[k] : undefined), dict);
}


export function t(key, params) {
const val = get(key) ?? key;
return typeof val === 'string' ? interpolate(val, params) : val;
}


export async function initI18n() {
current = detect();
await load(current);
document.documentElement.lang = current;
apply();
}


export async function setLang(lng) {
if (!SUPPORTED.includes(lng) || lng === current) return;
current = lng;
localStorage.setItem('lang', lng);
await load(lng);
document.documentElement.lang = lng;
apply();
listeners.forEach(cb => cb(lng));
}


export function getLang() { return current; }
export function onLangChange(cb){ listeners.add(cb); }