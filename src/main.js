const { app, BrowserWindow, ipcMain, shell, dialog, Tray, Menu, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { pathToFileURL } = require('url');
const { spawn } = require('child_process');
const { detectLaunchers, findThemeIcon, IS_WIN } = require('./detect');

app.setName('Nightdock');
if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

const USER = app.getPath('userData');
// Keep settings from the app's earlier names (Hangar, Launch Hub).
try {
  if (!fs.existsSync(path.join(USER, 'config.json'))) {
    for (const old of ['Hangar', 'Launch Hub']) {
      const dir = path.join(app.getPath('appData'), old);
      if (fs.existsSync(path.join(dir, 'config.json'))) {
        fs.mkdirSync(USER, { recursive: true });
        for (const f of ['config.json', 'icons', 'backgrounds']) {
          const src = path.join(dir, f);
          if (fs.existsSync(src)) fs.cpSync(src, path.join(USER, f), { recursive: true });
        }
        const cfgPath = path.join(USER, 'config.json');
        const esc = (s) => JSON.stringify(s).slice(1, -1); // paths as written inside JSON
        fs.writeFileSync(cfgPath, fs.readFileSync(cfgPath, 'utf8').split(esc(dir)).join(esc(USER)));
        break;
      }
    }
  }
} catch (e) { console.error('settings migration failed', e); }
const CONFIG = path.join(USER, 'config.json');
const ICON_PATH = path.join(__dirname, '..', 'build', 'icon.png');

// ─────────────────────────── config ───────────────────────────
const DEFAULTS = {
  custom: [],          // user-added launchers
  meta: {},            // per-launcher overrides: name, icon, color, hidden, favorite
  order: [],           // manual order (ids)
  lastUsed: {},
  launchCount: {},
  settings: {
    language: 'auto', theme: 'midnight', accent: '#7c8cff', background: 'aurora', bgImage: '', bgDim: 55, wallpaper: 'nordlys', wallDim: 20,
    cardSize: 180, view: 'grid', sort: 'manual', showSubtitles: true, animations: true,
    afterLaunch: 'minimize', closeToTray: false, startWithSystem: false, startHidden: false,
  },
};

function loadConfig() {
  try {
    const c = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    return { ...DEFAULTS, ...c, settings: { ...DEFAULTS.settings, ...(c.settings || {}) } };
  } catch { return JSON.parse(JSON.stringify(DEFAULTS)); }
}
let config = loadConfig();
function saveConfig() {
  fs.mkdirSync(USER, { recursive: true });
  const tmp = CONFIG + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2));
  fs.renameSync(tmp, CONFIG);
}

// ─────────────────────────── launching ───────────────────────────
function cleanEnv() {
  const env = { ...process.env };
  if (!IS_WIN && env.APPDIR) {
    // Don't leak the AppImage's libraries into launched programs (breaks Steam etc.)
    for (const k of ['LD_LIBRARY_PATH', 'PATH', 'XDG_DATA_DIRS', 'GSETTINGS_SCHEMA_DIR', 'QT_PLUGIN_PATH', 'PERLLIB', 'PYTHONPATH']) {
      if (env[k]) env[k] = env[k].split(':').filter((p) => p && !p.startsWith(env.APPDIR)).join(':');
      if (env[k] === '') delete env[k];
    }
    for (const k of ['APPDIR', 'APPIMAGE', 'ARGV0', 'OWD']) delete env[k];
  }
  delete env.ELECTRON_RUN_AS_NODE;
  delete env.CHROME_DESKTOP;
  return env;
}

function splitArgs(s) {
  const out = []; let cur = ''; let q = null; let has = false;
  for (const ch of s || '') {
    if (q) { if (ch === q) q = null; else cur += ch; }
    else if (ch === '"' || ch === "'") { q = ch; has = true; }
    else if (/\s/.test(ch)) { if (cur || has) out.push(cur); cur = ''; has = false; }
    else cur += ch;
  }
  if (cur || has) out.push(cur);
  return out;
}

function spawnDetached(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    let child;
    try {
      child = spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false, env: cleanEnv(), ...opts });
    } catch (e) { return reject(e); }
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); resolve(); });
  });
}

const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

// Errors carry a translation key so the window can show them in the user's language.
function coded(code, vars = {}) { const e = new Error(code); e.code = code; e.vars = vars; return e; }

// Give a clear error when the program was moved or uninstalled.
function onPath(bin) {
  const exts = IS_WIN ? ['', ...(process.env.PATHEXT || '.EXE;.BAT;.CMD').split(';')] : [''];
  return (process.env.PATH || '').split(path.delimiter).some((d) => d && exts.some((x) => isFile(path.join(d, bin + x))));
}
function checkExists(target) {
  if (isFile(target)) return;
  const looksLikePath = IS_WIN ? /^[a-z]:[\\/]|^\\\\/i.test(target) : target.startsWith('/') || target.startsWith('~');
  const first = splitArgs(target)[0] || '';
  if (looksLikePath || /[\\/]/.test(first)) {
    if (!isFile(first)) throw coded('err.notFound');
    return;
  }
  if (!IS_WIN && first && !onPath(first)) throw coded('err.notInstalled', { cmd: first });
}

async function launch(entry) {
  const target = String(entry.target || '').trim();
  const args = String(entry.args || '').trim();
  if (!target) throw coded('err.noProgram');
  if (/^[a-z][\w+.-]*:\/\//i.test(target)) { await shell.openExternal(target); return; }
  checkExists(target);

  if (IS_WIN) {
    if (isFile(target)) {
      const ext = path.extname(target).toLowerCase();
      if (!args || ext === '.lnk' || ext === '.url') {
        const err = await shell.openPath(target); // handles shortcuts + admin (UAC) prompts
        if (err) throw new Error(err);
        return;
      }
      try { await spawnDetached(target, splitArgs(args), { cwd: path.dirname(target) }); }
      catch { const err = await shell.openPath(target); if (err) throw new Error(err); }
    } else {
      await spawnDetached(`${target} ${args}`, [], { shell: true });
    }
  } else if (isFile(target)) {
    await spawnDetached(target, splitArgs(args), { cwd: path.dirname(target) });
  } else if (/\.desktop$/.test(target)) {
    await spawnDetached('gio', ['launch', target]);
  } else {
    await spawnDetached('/bin/sh', ['-c', `${target} ${args}`]);
  }
}

// ─────────────────────────── icons ───────────────────────────
const MIME = { '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
               '.ico': 'image/x-icon', '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp' };
function fileToDataUrl(p) {
  const mime = MIME[path.extname(p).toLowerCase()];
  if (!mime || !isFile(p)) return null;
  return `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
}

async function iconFor(entry) {
  if (entry.icon && isFile(entry.icon)) return fileToDataUrl(entry.icon);
  const t = String(entry.target || '');
  if (IS_WIN) {
    if (isFile(t)) {
      try { const img = await app.getFileIcon(t, { size: 'large' }); if (!img.isEmpty()) return img.toDataURL(); } catch {}
    }
    return null;
  }
  const names = [...(entry.themeIcons || [])];
  const fp = t.match(/flatpak run (\S+)/);
  if (fp) names.push(fp[1]);
  const first = splitArgs(t)[0];
  if (first) names.push(path.basename(first).replace(/\.(AppImage|sh)$/i, ''));
  const found = findThemeIcon(names);
  return found ? fileToDataUrl(found) : null;
}

// ─────────────────────────── autostart ───────────────────────────
function setAutostart(on) {
  if (IS_WIN) {
    app.setLoginItemSettings({ openAtLogin: on, args: ['--hidden'] });
    return;
  }
  const dir = path.join(os.homedir(), '.config', 'autostart');
  const file = path.join(dir, 'nightdock.desktop');
  if (!on) { try { fs.unlinkSync(file); } catch {} return; }
  const exe = process.env.APPIMAGE || process.execPath;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `[Desktop Entry]\nType=Application\nName=Nightdock\nExec="${exe}" --hidden\nIcon=nightdock\nX-GNOME-Autostart-enabled=true\n`);
}

// ─────────────────────────── window + tray ───────────────────────────
let win = null; let tray = null; let quitting = false;

function showWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show(); win.focus();
}

function ensureTray() {
  if (tray) return;
  const img = nativeImage.createFromPath(ICON_PATH).resize({ width: 22, height: 22 });
  tray = new Tray(img);
  tray.setToolTip('Nightdock');
  tray.on('click', showWindow);
  refreshTrayMenu();
}

function refreshTrayMenu() {
  if (!tray) return;
  const recent = Object.entries(config.lastUsed).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
  const items = recent.map((id) => ({ label: trayNames[id] || id, click: () => win?.webContents.send('launch-id', id) }));
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: trayLabels.open, click: showWindow },
    ...(items.length ? [{ type: 'separator' }, ...items] : []),
    { type: 'separator' },
    { label: trayLabels.quit, click: () => { quitting = true; app.quit(); } },
  ]));
}
let trayNames = {};
let trayLabels = { open: 'Open Nightdock', quit: 'Quit' };

function createWindow() {
  const hidden = process.argv.includes('--hidden') || config.settings.startHidden;
  win = new BrowserWindow({
    width: 1180, height: 740, minWidth: 820, minHeight: 540,
    frame: false, backgroundColor: '#0b0d12', show: false, title: 'Nightdock',
    icon: ICON_PATH,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  win.once('ready-to-show', () => { if (!hidden) win.show(); });
  win.on('maximize', () => win.webContents.send('maximized', true));
  win.on('unmaximize', () => win.webContents.send('maximized', false));
  win.on('close', (e) => {
    if (!quitting && config.settings.closeToTray) { e.preventDefault(); ensureTray(); win.hide(); }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  if (hidden || config.settings.closeToTray) ensureTray();
}

app.on('second-instance', showWindow);
app.on('before-quit', () => { quitting = true; });
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});
app.on('window-all-closed', () => app.quit());

// ─────────────────────────── IPC ───────────────────────────
ipcMain.handle('get-state', async () => ({
  config, detected: await detectLaunchers(), platform: process.platform, version: app.getVersion(),
  locales: [...(app.getPreferredSystemLanguages ? app.getPreferredSystemLanguages() : []), app.getLocale()],
}));
ipcMain.handle('rescan', () => detectLaunchers());
ipcMain.handle('save-config', (_e, c) => {
  const prevAuto = config.settings.startWithSystem;
  config = c; saveConfig();
  if (prevAuto !== c.settings.startWithSystem) { try { setAutostart(c.settings.startWithSystem); } catch {} }
  if (c.settings.closeToTray) ensureTray();
  refreshTrayMenu();
  return true;
});
ipcMain.handle('tray-names', (_e, names, labels) => { trayNames = names; if (labels) trayLabels = labels; refreshTrayMenu(); });
ipcMain.handle('get-icon', (_e, entry) => iconFor(entry));
ipcMain.handle('launch', async (_e, entry) => {
  try { await launch(entry); } catch (e) { return { ok: false, code: /^err\./.test(e.code || '') ? e.code : null, vars: e.vars, error: e.message || String(e) }; }
  config.lastUsed[entry.id] = Date.now();
  config.launchCount[entry.id] = (config.launchCount[entry.id] || 0) + 1;
  saveConfig(); refreshTrayMenu();
  const after = config.settings.afterLaunch;
  setTimeout(() => {
    if (after === 'minimize') win?.minimize();
    else if (after === 'tray') { ensureTray(); win?.hide(); }
    else if (after === 'quit') { quitting = true; app.quit(); }
  }, 700);
  return { ok: true, config };
});
ipcMain.handle('pick-program', async (_e, l = {}) => {
  const r = await dialog.showOpenDialog(win, {
    title: l.title || 'Choose a program', properties: ['openFile'],
    filters: IS_WIN ? [{ name: l.programs || 'Programs', extensions: ['exe', 'lnk', 'url', 'bat'] }, { name: l.all || 'All files', extensions: ['*'] }] : [],
  });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('pick-image', async (_e, kind, l = {}) => {
  const r = await dialog.showOpenDialog(win, {
    title: l.title || (kind === 'bg' ? 'Choose a background image' : 'Choose an icon'), properties: ['openFile'],
    filters: [{ name: l.images || 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'webp', 'gif', 'bmp'] }],
  });
  if (r.canceled) return null;
  const src = r.filePaths[0];
  const dir = path.join(USER, kind === 'bg' ? 'backgrounds' : 'icons');
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, crypto.randomUUID() + path.extname(src).toLowerCase());
  fs.copyFileSync(src, dest);
  return { path: dest, url: pathToFileURL(dest).href, data: fileToDataUrl(dest) };
});
ipcMain.handle('file-url', (_e, p) => (p && isFile(p) ? pathToFileURL(p).href : null));
ipcMain.handle('show-in-folder', (_e, p) => { if (isFile(p)) shell.showItemInFolder(p); });
ipcMain.handle('open-config-folder', () => shell.openPath(USER));
ipcMain.on('win', (_e, action) => {
  if (!win) return;
  if (action === 'min') win.minimize();
  else if (action === 'max') (win.isMaximized() ? win.unmaximize() : win.maximize());
  else if (action === 'close') win.close();
});
