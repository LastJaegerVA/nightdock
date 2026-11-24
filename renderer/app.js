'use strict';
/* global hub */

// ───────────────────────── icons ─────────────────────────
const ICONS = {
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".6"/><circle cx="4" cy="12" r=".6"/><circle cx="4" cy="18" r=".6"/>',
  star: '<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.2A9.7 9.7 0 0 1 12 5c5 0 8.5 4.6 9.5 7-.4 1-1.2 2.3-2.3 3.5M6.4 6.5C4.4 7.8 3 9.8 2.5 12c1 2.4 4.5 7 9.5 7 1.7 0 3.2-.5 4.5-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  eye: '<path d="M2.5 12C3.5 9.6 7 5 12 5s8.5 4.6 9.5 7c-1 2.4-4.5 7-9.5 7s-8.5-4.6-9.5-7z"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
  sort: '<path d="M7 4v16M3.5 7.5L7 4l3.5 3.5M17 20V4M13.5 16.5L17 20l3.5-3.5"/>',
  more: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>',
  play: '<path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  folder: '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h3.6l2 2.2h7.4a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4.5h6V7"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-9.5 9"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16M20 20v-4h-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  rocket: '<path d="M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
  alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5M12 16h.01"/>',
};
const svg = (n) => `<svg viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;
const ic = (n) => `<i data-icon="${n}">${svg(n)}</i>`;
function paintIcons(root = document) { root.querySelectorAll('i[data-icon]:empty').forEach((el) => { el.innerHTML = svg(el.dataset.icon); }); }

// ───────────────────────── state ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let cfg = null; let detected = []; let platform = 'linux';
let view = 'library';
const iconCache = new Map();

const THEMES = [
  { id: 'midnight', name: 'Midnight', light: false, bg: '#0b0d12', a: '#10131a', b: '#7c8cff', accent: '#7c8cff' },
  { id: 'graphite', name: 'Graphite', light: false, bg: '#111111', a: '#161616', b: '#5b8cff', accent: '#5b8cff' },
  { id: 'oled', name: 'Pure black', light: false, bg: '#000000', a: '#050505', b: '#7c8cff', accent: '#7c8cff' },
  { id: 'nord', name: 'Nord', light: false, bg: '#1d222c', a: '#232936', b: '#81a1c1', accent: '#81a1c1' },
  { id: 'dusk', name: 'Dusk', light: false, bg: '#120e1a', a: '#171223', b: '#b36bff', accent: '#b36bff' },
  { id: 'dracula', name: 'Dracula', light: false, bg: '#191a21', a: '#21222c', b: '#bd93f9', accent: '#bd93f9' },
  { id: 'catppuccin', name: 'Catppuccin', light: false, bg: '#11111b', a: '#181825', b: '#cba6f7', accent: '#cba6f7' },
  { id: 'tokyo', name: 'Tokyo Night', light: false, bg: '#13141c', a: '#1a1b26', b: '#7aa2f7', accent: '#7aa2f7' },
  { id: 'rosepine', name: 'Rosé Pine', light: false, bg: '#191724', a: '#1f1d2e', b: '#ebbcba', accent: '#ebbcba' },
  { id: 'gruvbox', name: 'Gruvbox', light: false, bg: '#1d2021', a: '#282828', b: '#fabd2f', accent: '#fabd2f' },
  { id: 'synthwave', name: 'Synthwave', light: false, bg: '#140a24', a: '#1c0f33', b: '#ff2fb3', accent: '#ff2fb3' },
  { id: 'ocean', name: 'Ocean', light: false, bg: '#06141d', a: '#0a1d29', b: '#22b8cf', accent: '#22b8cf' },
  { id: 'forest', name: 'Forest', light: false, bg: '#0c140f', a: '#111b15', b: '#4cc76a', accent: '#4cc76a' },
  { id: 'ember', name: 'Ember', light: false, bg: '#150c0a', a: '#1d110e', b: '#ff6b35', accent: '#ff6b35' },
  { id: 'light', name: 'Light', light: true, bg: '#eef0f6', a: '#ffffff', b: '#5b6cff', accent: '#5b6cff' },
  { id: 'solarized', name: 'Solarized', light: true, bg: '#fdf6e3', a: 'rgba(255,251,240,.96)', b: '#268bd2', accent: '#268bd2' },
  { id: 'sakura', name: 'Sakura', light: true, bg: '#fdf1f4', a: '#ffffff', b: '#e8559a', accent: '#e8559a' },
  { id: 'arctic', name: 'Arctic', light: true, bg: '#eef5fa', a: '#ffffff', b: '#2f7bff', accent: '#2f7bff' },
  // Themes that come with a matching wallpaper (renderer/wallpapers/<id>.svg)
  { id: 'nordlys', name: 'Nordlys', light: false, accent: '#3ddc97', wallpaper: 'nordlys' },
  { id: 'fjord', name: 'Fjord', light: false, accent: '#ffad7a', wallpaper: 'fjord' },
  { id: 'neoncity', name: 'Neon City', light: false, accent: '#3fe8ff', wallpaper: 'neoncity' },
  { id: 'deepspace', name: 'Deep Space', light: false, accent: '#b36bff', wallpaper: 'deepspace' },
  { id: 'dunes', name: 'Dunes', light: false, accent: '#ff9a5a', wallpaper: 'dunes' },
  { id: 'lava', name: 'Lava', light: false, accent: '#ff5a2b', wallpaper: 'lava' },
  { id: 'blossom', name: 'Blossom', light: true, accent: '#e0508f', wallpaper: 'blossom' },
  { id: 'glacier', name: 'Glacier', light: true, accent: '#2f7fc4', wallpaper: 'glacier' },
];
const WALLPAPERS = THEMES.filter((t) => t.wallpaper).map((t) => ({ id: t.wallpaper, name: t.name }));
const wallUrl = (id) => `wallpapers/${id}.svg`;
const ACCENTS = ['#7c8cff', '#5b8cff', '#2fb8ff', '#22c3a6', '#4cc76a', '#f5b83d', '#ff8a3d', '#ff5f6d', '#ff5fa8', '#b36bff'];
const TILE_COLORS = ['#2a475e', '#0a6cff', '#7c3aed', '#e0457b', '#ff4747', '#f08c00', '#e0a000', '#2fa36b', '#0f9fb5', '#4b5563'];
const tr = (k, v) => window.i18n.t(k, v);
const lowerFirst = (s) => (s ? s[0].toLocaleLowerCase(document.documentElement.lang) + s.slice(1) : s);
const themeName = (th) => (th.id === 'light' ? tr('theme.light') : th.id === 'oled' ? tr('theme.oled') : th.name);
const pickImage = (kind) => hub.pickImage(kind, { title: tr(kind === 'bg' ? 'dlg.bg' : 'dlg.icon'), images: tr('dlg.images') });

// Language: the user's choice, or the computer's language when set to automatic.
let systemLocales = [];
function applyLanguage() {
  const pref = cfg.settings.language;
  window.i18n.setLanguage(pref && pref !== 'auto' ? pref : window.i18n.matchLanguage(systemLocales));
  window.i18n.translatePage();
  $('#mHint').innerHTML = esc(tr('modal.hint', { code: '\u0000' })).replace('\u0000', '<code>steam://open/main</code>');
}
function openLanguageMenu(anchor) {
  const r = anchor.getBoundingClientRect();
  const auto = window.i18n.LANGUAGES.find((l) => l.code === window.i18n.matchLanguage(systemLocales));
  const cur = cfg.settings.language || 'auto';
  const items = [{ icon: 'globe', label: tr('set.lang.auto', { lang: auto.name }), on: cur === 'auto', fn: () => setLang('auto') }, '-'];
  for (const l of window.i18n.LANGUAGES) items.push({ icon: 'globe', label: l.name, on: cur === l.code, fn: () => setLang(l.code) });
  showMenu(items, r.left, r.bottom + 6);
}
function setLang(code) {
  cfg.settings.language = code;
  applyLanguage(); save(); render();
  const l = window.i18n.LANGUAGES.find((x) => x.code === window.i18n.getLanguage());
  toast(tr('toast.lang', { lang: l.name }), 'ok', 'globe');
}
const SORT_KEYS = { manual: 'sort.manual', recent: 'sort.recent', most: 'sort.most', name: 'sort.name' };

const save = () => hub.saveConfig(cfg);

// ───────────────────────── entries ─────────────────────────
function allEntries() {
  const meta = cfg.meta || {};
  const det = detected.map((d) => ({ ...d, ...(meta[d.id] || {}), source: 'detected', base: d }));
  const cus = cfg.custom.map((c) => ({ ...c, ...(meta[c.id] || {}), source: 'custom' }));
  return [...det, ...cus];
}
const byId = (id) => allEntries().find((e) => e.id === id);

function sorted(list) {
  const s = cfg.settings.sort;
  const used = cfg.lastUsed; const count = cfg.launchCount;
  const name = (a, b) => a.name.localeCompare(b.name);
  if (s === 'recent') return list.sort((a, b) => (used[b.id] || 0) - (used[a.id] || 0) || name(a, b));
  if (s === 'most') return list.sort((a, b) => (count[b.id] || 0) - (count[a.id] || 0) || name(a, b));
  if (s === 'name') return list.sort(name);
  const idx = new Map(cfg.order.map((id, i) => [id, i]));
  return list.sort((a, b) => (idx.has(a.id) ? idx.get(a.id) : 1e6) - (idx.has(b.id) ? idx.get(b.id) : 1e6) || name(a, b));
}

function visibleEntries() {
  const q = $('#search').value.trim().toLowerCase();
  let list = allEntries();
  if (view === 'hidden') list = list.filter((e) => e.hidden);
  else list = list.filter((e) => !e.hidden);
  if (view === 'favorites') list = list.filter((e) => e.favorite);
  if (view === 'recent') list = list.filter((e) => cfg.lastUsed[e.id]).sort((a, b) => cfg.lastUsed[b.id] - cfg.lastUsed[a.id]);
  else list = sorted(list);
  if (q) list = list.filter((e) => e.name.toLowerCase().includes(q) || (e.subtitle || '').toLowerCase().includes(q));
  return list;
}

// ───────────────────────── helpers ─────────────────────────
function ago(ts) {
  if (!ts) return tr('ago.never');
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return tr('ago.now');
  if (s < 3600) return tr('ago.min', { n: Math.floor(s / 60) });
  if (s < 86400) return tr('ago.h', { n: Math.floor(s / 3600) });
  if (s < 172800) return tr('ago.yesterday');
  if (s < 86400 * 30) return tr('ago.days', { n: Math.floor(s / 86400) });
  return new Date(ts).toLocaleDateString(document.documentElement.lang);
}
const initials = (n) => (String(n).split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
function subtitleOf(e) {
  if (e.subtitle === 'via Lutris') return tr('sub.lutris');
  if (e.subtitle === 'Flatpak') return tr('sub.flatpak');
  if (e.subtitle) return e.subtitle;
  if (e.source === 'custom') return tr('sub.custom');
  return tr('sub.installed');
}

function iconKey(e) { return `${e.id}|${e.icon || ''}|${e.target}`; }
async function iconUrl(e) {
  const k = iconKey(e);
  if (!iconCache.has(k)) iconCache.set(k, hub.getIcon({ id: e.id, icon: e.icon, target: e.target, themeIcons: e.themeIcons }).catch(() => null));
  return iconCache.get(k);
}
// Returns an element that becomes an image icon or a coloured letter tile.
function iconEl(e, cls) {
  const el = document.createElement('div');
  el.className = `${cls} letter`;
  el.style.setProperty('--c', e.color || '#4b5563');
  el.innerHTML = `<b>${esc(initials(e.name))}</b>`;
  iconUrl(e).then((url) => {
    if (!url) return;
    el.className = `${cls} img-ico`;
    el.innerHTML = '';
    el.style.backgroundImage = `url("${url}")`;
  });
  return el;
}

function toast(msg, kind = 'ok', icon) {
  const t = document.createElement('div');
  t.className = `toast ${kind === 'error' ? 'error' : ''}`;
  t.innerHTML = `${ic(icon || (kind === 'error' ? 'alert' : 'check'))}<span>${esc(msg)}</span>`;
  $('#toasts').append(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, kind === 'error' ? 5000 : 2600);
}

// ───────────────────────── apply settings ─────────────────────────
// Dark text on light accent colours, white text on dark ones.
function onAccent(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
  if (!m) return '#fff';
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lin(parseInt(m[1], 16)) + 0.7152 * lin(parseInt(m[2], 16)) + 0.0722 * lin(parseInt(m[3], 16));
  return (1.05 / (L + 0.05)) >= ((L + 0.05) / 0.05) ? '#ffffff' : '#14161d';
}

function applyAppearance() {
  const s = cfg.settings;
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty('--accent', s.accent);
  document.documentElement.style.setProperty('--card', `${s.cardSize}px`);
  document.body.dataset.bg = s.background;
  const th = THEMES.find((t) => t.id === s.theme) || THEMES[0];
  document.body.toggleAttribute('data-theme-light', !!th.light);
  document.documentElement.style.setProperty('--on-accent', onAccent(s.accent));
  document.body.classList.toggle('no-subs', !s.showSubtitles);
  document.body.classList.toggle('no-anim', !s.animations);
  $('#bg').style.setProperty('--dim', String((s.background === 'wallpaper' ? s.wallDim : s.bgDim) / 100));
  const pic = $('#bg .bg-image');
  if (s.background === 'wallpaper') {
    const w = WALLPAPERS.find((x) => x.id === s.wallpaper) || WALLPAPERS[0];
    pic.style.backgroundImage = `url("${wallUrl(w.id)}")`;
  } else if (s.background === 'image' && s.bgImage) {
    hub.fileUrl(s.bgImage).then((u) => { pic.style.backgroundImage = u ? `url("${u}")` : ''; });
  }
}

// ───────────────────────── rendering ─────────────────────────
const VIEW_INFO = {
  library: ['view.library.t', 'view.library.s'],
  favorites: ['view.favorites.t', 'view.favorites.s'],
  recent: ['view.recent.t', 'view.recent.s'],
  hidden: ['view.hidden.t', 'view.hidden.s'],
};

function render() {
  const all = allEntries();
  const shown = all.filter((e) => !e.hidden);
  $('#countAll').textContent = shown.length || '';
  $('#countFav').textContent = shown.filter((e) => e.favorite).length || '';
  $('#countHidden').textContent = all.filter((e) => e.hidden).length || '';
  $$('.nav[data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  renderQuick(shown);

  if (view === 'settings') { $('#libraryView').hidden = true; $('#settingsView').hidden = false; renderSettings(); return; }
  $('#libraryView').hidden = false; $('#settingsView').hidden = true;

  const [title, sub] = VIEW_INFO[view];
  $('#viewTitle').textContent = tr(title);
  $('#viewSub').textContent = tr(sub);
  $('#sortLabel').textContent = tr(SORT_KEYS[cfg.settings.sort]);
  $('#sortBtn').hidden = view === 'recent';
  $$('#viewSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === cfg.settings.view));

  const q = $('#search').value.trim();
  const list = visibleEntries();
  renderHero(q ? null : (view === 'library' ? shown : null));

  const canDrag = view === 'library' && cfg.settings.sort === 'manual' && !q && cfg.settings.view === 'grid';
  $('#sectionHead').hidden = !list.length;
  $('#sectionHead span').textContent = q ? tr('lib.results', { q }) : (view === 'library' ? tr('lib.all') : tr('lib.count', { n: list.length }));
  $('#dragHint').hidden = !canDrag || list.length < 2;

  const grid = $('#grid');
  grid.className = `grid ${cfg.settings.view === 'list' ? 'list' : ''}`;
  grid.innerHTML = '';
  list.forEach((e, i) => grid.append(cfg.settings.view === 'list' ? rowEl(e, i === 0 && !!q) : tileEl(e, i === 0 && !!q, canDrag)));

  const empty = $('#empty');
  empty.hidden = list.length > 0;
  if (!list.length) {
    const msgs = {
      library: q ? [tr('empty.noMatch.t'), tr('empty.noMatch.s', { q }), true]
                 : [tr('empty.none.t'), tr('empty.none.s'), true],
      favorites: [tr('empty.fav.t'), tr('empty.fav.s'), false],
      recent: [tr('empty.recent.t'), tr('empty.recent.s'), false],
      hidden: [tr('empty.hidden.t'), tr('empty.hidden.s'), false],
    };
    const [h, p, add] = msgs[view];
    empty.innerHTML = `<div class="big">${ic(view === 'favorites' ? 'star' : 'rocket')}</div><h3>${esc(h)}</h3><p>${esc(p)}</p>${add ? `<button class="btn primary" id="emptyAdd">${ic('plus')}<span>${esc(tr('side.add'))}</span></button>` : ''}`;
    $('#emptyAdd')?.addEventListener('click', () => openEditor());
  }
}

function renderQuick(shown) {
  const box = $('#quick');
  const favs = sorted(shown.filter((e) => e.favorite));
  const recent = shown.filter((e) => cfg.lastUsed[e.id] && !e.favorite).sort((a, b) => cfg.lastUsed[b.id] - cfg.lastUsed[a.id]);
  const list = [...favs, ...recent].slice(0, 7);
  box.innerHTML = '';
  if (!list.length) { box.innerHTML = `<div class="none">${esc(tr('quick.none'))}</div>`; return; }
  for (const e of list) {
    const b = document.createElement('button');
    b.title = `${tr('menu.open')}: ${e.name}`;
    b.append(iconEl(e, 'qi'));
    b.insertAdjacentHTML('beforeend', `<span>${esc(e.name)}</span>`);
    b.addEventListener('click', () => doLaunch(e));
    b.addEventListener('contextmenu', (ev) => { ev.preventDefault(); openCardMenu(e, ev.clientX, ev.clientY); });
    box.append(b);
  }
  hub.trayNames(Object.fromEntries(shown.map((e) => [e.id, e.name])), { open: tr('tray.open'), quit: tr('tray.quit') });
}

function renderHero(shown) {
  const hero = $('#hero');
  const last = shown && shown.filter((e) => cfg.lastUsed[e.id]).sort((a, b) => cfg.lastUsed[b.id] - cfg.lastUsed[a.id])[0];
  if (!last) { hero.hidden = true; return; }
  hero.hidden = false;
  hero.style.setProperty('--c', last.color || 'var(--accent)');
  const n = cfg.launchCount[last.id] || 0;
  hero.innerHTML = `<div class="htext"><div class="eyebrow">${esc(tr('hero.eyebrow'))}</div><h2>${esc(last.name)}</h2>
    <div class="meta">${esc(tr('hero.meta', { ago: lowerFirst(ago(cfg.lastUsed[last.id])), n }))}</div></div>
    <button class="btn primary">${ic('play')}<span>${esc(tr('btn.open'))}</span></button>`;
  hero.prepend(iconEl(last, 'hico'));
  $('.btn.primary', hero).addEventListener('click', () => doLaunch(last, hero));
}

function tileEl(e, first, canDrag) {
  const t = document.createElement('button');
  t.className = `tile${first ? ' first' : ''}`;
  t.dataset.id = e.id;
  t.style.setProperty('--c', e.color || '#4b5563');
  t.title = e.target;
  t.innerHTML = `<span class="fav ${e.favorite ? 'on' : ''}" title="${esc(tr('tile.fav'))}">${ic('star')}</span>
    <span class="more" title="${esc(tr('tile.more'))}">${ic('more')}</span>
    <div class="name">${esc(e.name)}</div><div class="sub">${esc(subtitleOf(e))}</div>
    <div class="launching"><div><div class="spinner"></div>${esc(tr('tile.opening'))}</div></div>`;
  t.insertBefore(iconEl(e, 'ico'), $('.name', t));
  t.addEventListener('click', (ev) => {
    if (ev.target.closest('.fav')) { ev.stopPropagation(); toggleFav(e); return; }
    if (ev.target.closest('.more')) { ev.stopPropagation(); const r = ev.target.closest('.more').getBoundingClientRect(); openCardMenu(e, r.left, r.bottom + 6); return; }
    doLaunch(e, t);
  });
  t.addEventListener('contextmenu', (ev) => { ev.preventDefault(); openCardMenu(e, ev.clientX, ev.clientY); });
  if (canDrag) addDrag(t);
  return t;
}

function rowEl(e, first) {
  const r = document.createElement('div');
  r.className = `row-item${first ? ' first' : ''}`;
  r.tabIndex = 0;
  r.dataset.id = e.id;
  const n = cfg.launchCount[e.id] || 0;
  r.innerHTML = `<div class="txt"><div class="name">${esc(e.name)}</div><div class="sub">${esc(subtitleOf(e))} · ${esc(e.target)}</div></div>
    <div class="stat">${esc(ago(cfg.lastUsed[e.id]))}${n ? `<br>${esc(tr('row.launches', { n }))}` : ''}</div>
    <button class="fav ${e.favorite ? 'on' : ''}" title="${esc(tr('tile.fav'))}">${ic('star')}</button>
    <button class="icon-btn more" title="${esc(tr('tile.more'))}">${ic('more')}</button>
    <button class="btn small primary open">${ic('play')}<span>${esc(tr('btn.open'))}</span></button>`;
  r.prepend(iconEl(e, 'ico'));
  r.addEventListener('click', (ev) => {
    if (ev.target.closest('.fav')) return toggleFav(e);
    if (ev.target.closest('.more')) { const b = ev.target.closest('.more').getBoundingClientRect(); return openCardMenu(e, b.left - 150, b.bottom + 6); }
    if (ev.target.closest('.open')) return doLaunch(e, r);
  });
  r.addEventListener('dblclick', (ev) => { if (!ev.target.closest('button')) doLaunch(e, r); });
  r.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') doLaunch(e, r); });
  r.addEventListener('contextmenu', (ev) => { ev.preventDefault(); openCardMenu(e, ev.clientX, ev.clientY); });
  return r;
}

// ───────────────────────── drag to reorder ─────────────────────────
let dragId = null;
function addDrag(t) {
  t.draggable = true;
  t.addEventListener('dragstart', (ev) => { dragId = t.dataset.id; t.classList.add('dragging'); ev.dataTransfer.effectAllowed = 'move'; });
  t.addEventListener('dragend', () => { dragId = null; $$('.tile').forEach((x) => x.classList.remove('dragging', 'drop-before', 'drop-after')); });
  t.addEventListener('dragover', (ev) => {
    if (!dragId || dragId === t.dataset.id) return;
    ev.preventDefault();
    const r = t.getBoundingClientRect();
    const after = ev.clientX > r.left + r.width / 2;
    t.classList.toggle('drop-after', after); t.classList.toggle('drop-before', !after);
  });
  t.addEventListener('dragleave', () => t.classList.remove('drop-before', 'drop-after'));
  t.addEventListener('drop', (ev) => {
    ev.preventDefault();
    if (!dragId || dragId === t.dataset.id) return;
    const after = t.classList.contains('drop-after');
    const ids = $$('#grid .tile').map((x) => x.dataset.id).filter((id) => id !== dragId);
    let at = ids.indexOf(t.dataset.id) + (after ? 1 : 0);
    ids.splice(at, 0, dragId);
    const rest = cfg.order.filter((id) => !ids.includes(id));
    cfg.order = [...ids, ...rest];
    save(); render();
  });
}

// ───────────────────────── actions ─────────────────────────
function setMeta(id, patch) {
  cfg.meta[id] = { ...(cfg.meta[id] || {}), ...patch };
  for (const k of Object.keys(cfg.meta[id])) if (cfg.meta[id][k] === undefined || cfg.meta[id][k] === false) delete cfg.meta[id][k];
}
function toggleFav(e) { setMeta(e.id, { favorite: !e.favorite }); save(); render(); }

async function doLaunch(e, el) {
  el?.classList.add('is-launching');
  const res = await hub.launch(e);
  setTimeout(() => el?.classList.remove('is-launching'), 900);
  if (!res.ok) { toast(tr('toast.cantOpen', { name: e.name, error: res.code ? tr(res.code, res.vars) : res.error }), 'error'); return; }
  cfg.lastUsed = res.config.lastUsed; cfg.launchCount = res.config.launchCount;
  toast(tr('toast.opening', { name: e.name }), 'ok', 'rocket');
  $('#search').value = '';
  setTimeout(render, 950);
}

function openCardMenu(e, x, y) {
  const items = [
    { icon: 'play', label: tr('menu.open'), fn: () => doLaunch(e, $(`[data-id="${CSS.escape(e.id)}"]`)) },
    { icon: 'star', label: e.favorite ? tr('menu.fav.remove') : tr('menu.fav.add'), fn: () => toggleFav(e) },
    { icon: 'edit', label: tr('menu.edit'), fn: () => openEditor(e) },
    { icon: 'image', label: tr('menu.icon'), fn: async () => { const r = await pickImage('icon'); if (!r) return; applyEdit(e, { icon: r.path }); } },
  ];
  if (/[\\/]/.test(e.target) && !/^\w+:\/\//.test(e.target)) items.push({ icon: 'folder', label: tr('menu.location'), fn: () => hub.showInFolder(e.target) });
  items.push('-');
  items.push(e.hidden ? { icon: 'eye', label: tr('menu.unhide'), fn: () => { setMeta(e.id, { hidden: false }); save(); render(); toast(tr('toast.unhid', { name: e.name })); } }
                      : { icon: 'eyeOff', label: tr('menu.hide'), fn: () => { setMeta(e.id, { hidden: true }); save(); render(); toast(tr('toast.hid', { name: e.name }), 'ok', 'eyeOff'); } });
  if (e.source === 'custom') items.push({ icon: 'trash', label: tr('menu.remove'), danger: true, fn: () => removeCustom(e) });
  showMenu(items, x, y);
}

function showMenu(items, x, y) {
  const m = $('#menu');
  m.innerHTML = '';
  for (const it of items) {
    if (it === '-') { m.append(document.createElement('hr')); continue; }
    const b = document.createElement('button');
    if (it.danger) b.className = 'danger';
    if (it.on) b.classList.add('on');
    b.innerHTML = `${ic(it.icon)}<span>${esc(it.label)}</span>${it.on ? `<span class="check">${svg('check').replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"')}</span>` : ''}`;
    b.addEventListener('click', () => { hideMenu(); it.fn(); });
    m.append(b);
  }
  m.hidden = false;
  const r = m.getBoundingClientRect();
  m.style.left = `${Math.max(8, Math.min(x, innerWidth - r.width - 8))}px`;
  m.style.top = `${Math.max(8, Math.min(y, innerHeight - r.height - 8))}px`;
}
const hideMenu = () => { $('#menu').hidden = true; };

function removeCustom(e) {
  cfg.custom = cfg.custom.filter((c) => c.id !== e.id);
  delete cfg.meta[e.id];
  cfg.order = cfg.order.filter((id) => id !== e.id);
  save(); render();
  toast(tr('toast.removed', { name: e.name }), 'ok', 'trash');
}

function applyEdit(e, patch) {
  if (e.source === 'custom') {
    const c = cfg.custom.find((x) => x.id === e.id);
    Object.assign(c, patch);
  } else {
    setMeta(e.id, patch);
  }
  save(); render();
}

// ───────────────────────── editor ─────────────────────────
let editing = null; let draft = null;
function openEditor(e = null) {
  editing = e;
  draft = e ? { name: e.name, target: e.target, args: e.args || '', icon: e.icon || '', color: e.color || TILE_COLORS[0] }
            : { name: '', target: '', args: '', icon: '', color: TILE_COLORS[Math.floor(Math.random() * TILE_COLORS.length)] };
  $('#modalTitle').textContent = e ? tr('modal.edit', { name: e.name }) : tr('modal.add');
  $('#mName').value = draft.name; $('#mTarget').value = draft.target; $('#mArgs').value = draft.args;
  $('#mTarget').placeholder = platform === 'win32' ? 'C:\\Program Files (x86)\\Ubisoft\\…\\UbisoftConnect.exe' : '/usr/bin/steam  ·  flatpak run …';
  $('#mDelete').hidden = !(e && e.source === 'custom');
  $('#mReset').hidden = !(e && e.source === 'detected' && cfg.meta[e.id] && Object.keys(cfg.meta[e.id]).some((k) => !['favorite', 'hidden'].includes(k)));
  renderColorSwatches(); updatePreview();
  $('#modal').hidden = false;
  setTimeout(() => $('#mName').focus(), 50);
}
function closeEditor() { $('#modal').hidden = true; editing = null; }

function renderColorSwatches() {
  const box = $('#mColors');
  box.innerHTML = '';
  const custom = !TILE_COLORS.includes(draft.color);
  for (const c of TILE_COLORS) {
    const b = document.createElement('button');
    b.className = `sw ${draft.color === c ? 'on' : ''}`; b.style.setProperty('--s', c); b.type = 'button';
    b.addEventListener('click', () => { draft.color = c; renderColorSwatches(); updatePreview(); });
    box.append(b);
  }
  const lab = document.createElement('label');
  lab.className = `sw-custom ${custom ? 'on' : ''}`; lab.title = tr('modal.customColor');
  lab.innerHTML = `<input type="color" value="${custom ? draft.color : '#888888'}">`;
  $('input', lab).addEventListener('input', (ev) => { draft.color = ev.target.value; updatePreview(); });
  $('input', lab).addEventListener('change', () => renderColorSwatches());
  box.append(lab);
}

function updatePreview() {
  const p = $('#mIconPreview');
  draft.name = $('#mName').value; draft.target = $('#mTarget').value;
  const temp = { id: editing?.id || 'new', name: draft.name || '?', icon: draft.icon, target: draft.target, color: draft.color,
                 themeIcons: editing?.themeIcons };
  const el = iconEl(temp, 'icon-preview');
  el.id = 'mIconPreview';
  p.replaceWith(el);
  $('#mIconReset').hidden = !draft.icon;
}

function saveEditor() {
  const name = $('#mName').value.trim(); const target = $('#mTarget').value.trim(); const args = $('#mArgs').value.trim();
  if (!name || !target) { toast(tr('toast.needName'), 'error'); (name ? $('#mTarget') : $('#mName')).focus(); return; }
  const patch = { name, target, args, icon: draft.icon || undefined, color: draft.color };
  if (!editing) {
    const id = `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    cfg.custom.push({ id, ...patch });
    cfg.order.push(id);
    toast(tr('toast.added', { name }));
  } else if (editing.source === 'custom') {
    applyEdit(editing, patch);
  } else {
    const b = editing.base; const m = {};
    for (const k of ['name', 'target', 'args', 'icon', 'color']) if ((patch[k] || '') !== (b[k] || '')) m[k] = patch[k];
    const keep = { favorite: cfg.meta[editing.id]?.favorite, hidden: cfg.meta[editing.id]?.hidden };
    cfg.meta[editing.id] = m; setMeta(editing.id, keep);
  }
  closeEditor(); save(); render();
}

// ───────────────────────── settings page ─────────────────────────
function setRange(el, v) {
  el.value = v;
  el.style.setProperty('--p', `${((v - el.min) / (el.max - el.min)) * 100}%`);
}
function renderSettings() {
  const s = cfg.settings;
  const themes = $('#themes');
  themes.innerHTML = '';
  for (const t of THEMES) {
    const b = document.createElement('button');
    b.className = `theme ${s.theme === t.id ? 'on' : ''}`;
    const tname = themeName(t);
    b.title = `${tname}${t.light ? ' ' + tr('theme.lightSuffix') : ''}`;
    b.innerHTML = t.wallpaper
      ? `<div class="pv wp" style="background-image:url('${wallUrl(t.wallpaper)}')"><i style="background:${t.accent}"></i></div><span class="tn">${esc(tname)}</span>`
      : `<div class="pv" style="background:${t.bg}"><i style="background:${t.a}"></i><i style="background:${t.a}; opacity:.7"></i><i style="background:${t.b}"></i></div><span class="tn">${esc(tname)}</span>`;
    b.addEventListener('click', () => {
      // A wallpaper theme brings its wallpaper along; leaving one goes back to the glow.
      const wasOwnWall = s.background === 'wallpaper' && THEMES.some((x) => x.id === s.theme && x.wallpaper === s.wallpaper);
      s.theme = t.id; s.accent = t.accent;
      if (t.wallpaper) { s.background = 'wallpaper'; s.wallpaper = t.wallpaper; } else if (wasOwnWall) s.background = 'aurora';
      commitSettings();
    });
    themes.append(b);
  }
  const acc = $('#accentSwatches');
  acc.innerHTML = '';
  for (const c of ACCENTS) {
    const b = document.createElement('button');
    b.className = `sw ${s.accent === c ? 'on' : ''}`; b.style.setProperty('--s', c);
    b.addEventListener('click', () => { s.accent = c; commitSettings(); });
    acc.append(b);
  }
  const lab = document.createElement('label');
  lab.className = `sw-custom ${ACCENTS.includes(s.accent) ? '' : 'on'}`; lab.title = tr('modal.customColor');
  lab.innerHTML = `<input type="color" value="${s.accent}">`;
  $('input', lab).addEventListener('input', (ev) => { s.accent = ev.target.value; applyAppearance(); });
  $('input', lab).addEventListener('change', () => commitSettings());
  acc.append(lab);

  $$('#bgSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === s.background));
  $$('#afterSeg button').forEach((b) => b.classList.toggle('on', b.dataset.v === s.afterLaunch));
  $('#bgImageRow').hidden = s.background !== 'image';
  $('#bgDimRow').hidden = s.background !== 'image' && s.background !== 'wallpaper';
  $('#wallRow').hidden = s.background !== 'wallpaper';
  const walls = $('#walls');
  walls.innerHTML = '';
  for (const w of WALLPAPERS) {
    const b = document.createElement('button');
    b.className = `wall ${s.wallpaper === w.id ? 'on' : ''}`; b.title = w.name; b.setAttribute('aria-label', w.name);
    b.style.backgroundImage = `url('${wallUrl(w.id)}')`;
    b.addEventListener('click', () => { s.background = 'wallpaper'; s.wallpaper = w.id; commitSettings(); });
    walls.append(b);
  }
  $('#bgImageName').textContent = s.bgImage ? tr('set.bgPic.chosen') : tr('set.bgPic.none');
  setRange($('#bgDim'), s.background === 'wallpaper' ? s.wallDim : s.bgDim);
  setRange($('#cardSize'), s.cardSize);
  for (const k of ['showSubtitles', 'animations', 'closeToTray', 'startWithSystem', 'startHidden']) $(`#${k}`).checked = !!s[k];
  $('#about').textContent = `Nightdock ${window.__version || ''} · ${platform === 'win32' ? 'Windows' : 'Linux'} · ${tr('lib.count', { n: allEntries().length })}`;
  const lang = window.i18n.LANGUAGES.find((l) => l.code === window.i18n.getLanguage());
  $('#langLabel').textContent = cfg.settings.language && cfg.settings.language !== 'auto' ? lang.name : tr('set.lang.auto', { lang: lang.name });
}
function commitSettings() { applyAppearance(); save(); render(); }

// ───────────────────────── wiring ─────────────────────────
function wire() {
  paintIcons();
  $$('[data-win]').forEach((b) => b.addEventListener('click', () => hub.win(b.dataset.win)));
  hub.onMaximized((m) => { $('#maxBtn').innerHTML = m ? '<svg viewBox="0 0 12 12"><rect x="2" y="4" width="6" height="6" rx="1"/><path d="M4 4V2.8A.8.8 0 0 1 4.8 2H9.2a.8.8 0 0 1 .8.8v4.4a.8.8 0 0 1-.8.8H8"/></svg>' : '<svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1.2"/></svg>'; });
  hub.onLaunchId((id) => { const e = byId(id); if (e) doLaunch(e); });
  $('.titlebar').addEventListener('dblclick', (ev) => { if (!ev.target.closest('.win-controls')) hub.win('max'); });

  $$('.nav[data-view]').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; $('#search').value = ''; $('#main').scrollTop = 0; render(); }));
  $('#addBtn').addEventListener('click', () => openEditor());
  $('#sideAdd').addEventListener('click', () => openEditor());
  $('#search').addEventListener('input', render);
  $('#search').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { const f = visibleEntries()[0]; if (f) doLaunch(f, $(`[data-id="${CSS.escape(f.id)}"]`)); }
    if (ev.key === 'ArrowDown') { ev.preventDefault(); $('#grid > *')?.focus(); }
  });
  $('#sortBtn').addEventListener('click', (ev) => {
    const r = ev.currentTarget.getBoundingClientRect();
    showMenu(Object.entries(SORT_KEYS).map(([k, key]) => ({ icon: 'sort', label: tr(key), on: cfg.settings.sort === k, fn: () => { cfg.settings.sort = k; save(); render(); } })), r.left, r.bottom + 6);
  });
  $$('#viewSeg button').forEach((b) => b.addEventListener('click', () => { cfg.settings.view = b.dataset.v; save(); render(); }));

  // editor
  $$('#modal [data-close]').forEach((b) => b.addEventListener('click', closeEditor));
  $('#modal').addEventListener('mousedown', (ev) => { if (ev.target.id === 'modal') closeEditor(); });
  $('#mSave').addEventListener('click', saveEditor);
  $('#mBrowse').addEventListener('click', async () => {
    const p = await hub.pickProgram({ title: tr('dlg.program'), programs: tr('dlg.programs'), all: tr('dlg.all') });
    if (!p) return;
    $('#mTarget').value = p;
    if (!$('#mName').value.trim()) $('#mName').value = p.split(/[\\/]/).pop().replace(/\.(exe|lnk|url|bat|AppImage|sh|desktop)$/i, '');
    updatePreview();
  });
  $('#mIconPick').addEventListener('click', async () => { const r = await pickImage('icon'); if (r) { draft.icon = r.path; updatePreview(); } });
  $('#mIconReset').addEventListener('click', () => { draft.icon = ''; updatePreview(); });
  let pt; ['#mName', '#mTarget'].forEach((s) => $(s).addEventListener('input', () => { clearTimeout(pt); pt = setTimeout(updatePreview, 250); }));
  $('#modal').addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') saveEditor(); });
  $('#mDelete').addEventListener('click', () => { const e = editing; closeEditor(); removeCustom(e); });
  $('#mReset').addEventListener('click', () => {
    const keep = { favorite: cfg.meta[editing.id]?.favorite, hidden: cfg.meta[editing.id]?.hidden };
    cfg.meta[editing.id] = {}; setMeta(editing.id, keep);
    closeEditor(); save(); render(); toast(tr('toast.reset'));
  });

  // settings
  $$('#bgSeg button').forEach((b) => b.addEventListener('click', async () => {
    cfg.settings.background = b.dataset.v;
    if (b.dataset.v === 'image' && !cfg.settings.bgImage) {
      const r = await pickImage('bg');
      if (r) cfg.settings.bgImage = r.path; else cfg.settings.background = 'aurora';
    }
    commitSettings();
  }));
  $('#bgPick').addEventListener('click', async () => { const r = await pickImage('bg'); if (r) { cfg.settings.bgImage = r.path; commitSettings(); } });
  $$('#afterSeg button').forEach((b) => b.addEventListener('click', () => { cfg.settings.afterLaunch = b.dataset.v; commitSettings(); }));
  const live = (id, key) => {
    $(`#${id}`).addEventListener('input', (ev) => { cfg.settings[key] = +ev.target.value; setRange(ev.target, +ev.target.value); applyAppearance(); });
    $(`#${id}`).addEventListener('change', () => save());
  };
  $('#bgDim').addEventListener('input', (ev) => {
    cfg.settings[cfg.settings.background === 'wallpaper' ? 'wallDim' : 'bgDim'] = +ev.target.value; setRange(ev.target, +ev.target.value); applyAppearance();
  });
  $('#bgDim').addEventListener('change', () => save());
  live('cardSize', 'cardSize');
  for (const k of ['showSubtitles', 'animations', 'closeToTray', 'startWithSystem', 'startHidden']) {
    $(`#${k}`).addEventListener('change', (ev) => { cfg.settings[k] = ev.target.checked; commitSettings(); });
  }
  $('#rescanBtn').addEventListener('click', async () => {
    detected = await hub.rescan(); iconCache.clear(); render();
    toast(tr('toast.found', { n: detected.length }), 'ok', 'refresh');
  });
  $('#resetOrder').addEventListener('click', () => { cfg.order = []; save(); render(); toast(tr('toast.orderReset')); });
  $('#openCfg').addEventListener('click', () => hub.openConfigFolder());
  $('#langBtn').addEventListener('click', (ev) => openLanguageMenu(ev.currentTarget));

  // global
  document.addEventListener('mousedown', (ev) => { if (!ev.target.closest('#menu')) hideMenu(); });
  window.addEventListener('blur', hideMenu);
  document.addEventListener('keydown', (ev) => {
    const inInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if (ev.key === 'Escape') {
      if (!$('#menu').hidden) return hideMenu();
      if (!$('#modal').hidden) return closeEditor();
      if ($('#search').value) { $('#search').value = ''; render(); }
      return;
    }
    if (!$('#modal').hidden) return;
    if (ev.ctrlKey && ev.key.toLowerCase() === 'f') { ev.preventDefault(); goLibraryIfNeeded(); $('#search').focus(); $('#search').select(); }
    else if (ev.ctrlKey && ev.key.toLowerCase() === 'n') { ev.preventDefault(); openEditor(); }
    else if (ev.ctrlKey && ev.key === ',') { ev.preventDefault(); view = 'settings'; render(); }
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(ev.key) && !inInput) moveFocus(ev);
    else if (!inInput && !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.key.length === 1 && /\S/.test(ev.key) && view !== 'settings') {
      $('#search').focus();
    }
  });
}
function goLibraryIfNeeded() { if (view === 'settings') { view = 'library'; render(); } }

function moveFocus(ev) {
  const items = $$('#grid > *');
  if (!items.length) return;
  const cur = items.indexOf(document.activeElement);
  if (cur < 0) { items[0].focus(); ev.preventDefault(); return; }
  const top0 = items[0].offsetTop;
  const cols = Math.max(1, items.filter((x) => x.offsetTop === top0).length);
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[ev.key];
  const next = items[cur + step];
  if (next) { next.focus(); ev.preventDefault(); }
  else if (ev.key === 'ArrowUp') { $('#search').focus(); ev.preventDefault(); }
}

(async function init() {
  const st = await hub.getState();
  cfg = st.config; detected = st.detected; platform = st.platform; window.__version = st.version;
  systemLocales = st.locales || [];
  applyLanguage();
  document.body.dataset.platform = platform;
  wire();
  applyAppearance();
  render();
})();
