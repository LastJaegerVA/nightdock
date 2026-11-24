// Finds installed game launchers on Windows and Linux.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

const IS_WIN = process.platform === 'win32';
const HOME = os.homedir();

const exists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const dirExists = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

function run(cmd, args, timeout = 8000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout, windowsHide: true, maxBuffer: 8 * 1024 * 1024 },
      (err, stdout) => resolve(err && !stdout ? '' : String(stdout || '')));
  });
}

// ─────────────────────────── Windows ───────────────────────────
const WIN_KNOWN = [
  { id: 'steam', name: 'Steam', color: '#2a475e',
    paths: ['Program Files (x86)\\Steam\\steam.exe', 'Program Files\\Steam\\steam.exe', 'Steam\\steam.exe'],
    reg: [['HKCU\\Software\\Valve\\Steam', 'SteamExe', null]] },
  { id: 'ubisoft', name: 'Ubisoft Connect', color: '#0a6cff',
    paths: ['Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\UbisoftConnect.exe',
            'Program Files (x86)\\Ubisoft\\Ubisoft Game Launcher\\upc.exe',
            'Program Files\\Ubisoft\\Ubisoft Game Launcher\\UbisoftConnect.exe'],
    reg: [['HKLM\\SOFTWARE\\Ubisoft\\Launcher', 'InstallDir', 'UbisoftConnect.exe']] },
  { id: 'epic', name: 'Epic Games', color: '#3a3a3a',
    paths: ['Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe',
            'Program Files (x86)\\Epic Games\\Launcher\\Portal\\Binaries\\Win32\\EpicGamesLauncher.exe',
            'Program Files\\Epic Games\\Launcher\\Portal\\Binaries\\Win64\\EpicGamesLauncher.exe'], reg: [] },
  { id: 'ea', name: 'EA app', color: '#ff4747',
    paths: ['Program Files\\Electronic Arts\\EA Desktop\\EA Desktop\\EADesktop.exe'], reg: [] },
  { id: 'battlenet', name: 'Battle.net', color: '#148eff',
    paths: ['Program Files (x86)\\Battle.net\\Battle.net Launcher.exe', 'Program Files (x86)\\Battle.net\\Battle.net.exe'], reg: [] },
  { id: 'gog', name: 'GOG Galaxy', color: '#8a3fd1',
    paths: ['Program Files (x86)\\GOG Galaxy\\GalaxyClient.exe', 'Program Files\\GOG Galaxy\\GalaxyClient.exe'], reg: [] },
  { id: 'rockstar', name: 'Rockstar Games', color: '#e0a000',
    paths: ['Program Files\\Rockstar Games\\Launcher\\Launcher.exe'], reg: [] },
  { id: 'riot', name: 'Riot Client', color: '#eb0029',
    paths: ['Riot Games\\Riot Client\\RiotClientServices.exe'], reg: [] },
  { id: 'amazon', name: 'Amazon Games', color: '#ff9900',
    paths: [], local: 'Amazon Games\\App\\Amazon Games.exe', reg: [] },
  { id: 'prism', name: 'Prism Launcher', color: '#4a9e5c',
    paths: [], local: 'Programs\\PrismLauncher\\prismlauncher.exe', reg: [] },
];

async function regQuery(key, value) {
  for (const view of ['/reg:64', '/reg:32']) {
    const out = await run('reg', ['query', key, '/v', value, view], 4000);
    const m = out.match(new RegExp(`${value}\\s+REG_\\w+\\s+(.+)`, 'i'));
    if (m) return m[1].trim();
  }
  return null;
}

async function detectWindows() {
  const drives = [];
  for (const c of 'CDEFGHIJKLMNOPQRSTUVWXYZ') if (dirExists(`${c}:\\`)) drives.push(`${c}:\\`);
  const found = [];
  for (const k of WIN_KNOWN) {
    let hit = null;
    for (const [key, val, append] of k.reg) {
      const v = await regQuery(key, val);
      if (v) {
        const p = path.normalize(append ? path.join(v, append) : v);
        if (exists(p)) { hit = p; break; }
      }
    }
    if (!hit && k.local && process.env.LOCALAPPDATA) {
      const p = path.join(process.env.LOCALAPPDATA, k.local);
      if (exists(p)) hit = p;
    }
    outer: for (const d of hit ? [] : drives) {
      for (const rel of k.paths) {
        const p = path.join(d, rel);
        if (exists(p)) { hit = p; break outer; }
      }
    }
    if (hit) found.push({ id: k.id, name: k.name, target: hit, args: '', color: k.color, source: 'detected' });
  }
  return found;
}

// ─────────────────────────── Linux ───────────────────────────
const LINUX_KNOWN = [
  { id: 'steam', name: 'Steam', color: '#2a475e', bins: ['steam'], flatpak: 'com.valvesoftware.Steam', icons: ['steam'] },
  { id: 'heroic', name: 'Heroic', color: '#7c3aed', bins: ['heroic', 'heroic-games-launcher'], flatpak: 'com.heroicgameslauncher.hgl', icons: ['com.heroicgameslauncher.hgl', 'heroic'] },
  { id: 'lutris', name: 'Lutris', color: '#f08c00', bins: ['lutris'], flatpak: 'net.lutris.Lutris', icons: ['net.lutris.Lutris', 'lutris'] },
  { id: 'bottles', name: 'Bottles', color: '#3584e4', bins: ['bottles'], flatpak: 'com.usebottles.bottles', icons: ['com.usebottles.bottles', 'bottles'] },
  { id: 'faugus', name: 'Faugus Launcher', color: '#2b6cb0', bins: ['faugus-launcher'], flatpak: 'io.github.Faugus.faugus-launcher', icons: ['faugus-launcher', 'io.github.Faugus.faugus-launcher'] },
  { id: 'itch', name: 'itch.io', color: '#fa5c5c', bins: ['itch'], flatpak: 'io.itch.itch', icons: ['io.itch.itch', 'itch'] },
  { id: 'prism', name: 'Prism Launcher', color: '#4a9e5c', bins: ['prismlauncher'], flatpak: 'org.prismlauncher.PrismLauncher', icons: ['org.prismlauncher.PrismLauncher', 'prismlauncher'] },
];

// Windows launchers installed through Lutris (Wine)
const LUTRIS_WORDS = [
  ['ubisoft', 'Ubisoft Connect', '#0a6cff'], ['uplay', 'Ubisoft Connect', '#0a6cff'],
  ['ea-app', 'EA app', '#ff4747'], ['origin', 'EA app', '#ff4747'],
  ['battlenet', 'Battle.net', '#148eff'], ['battle-net', 'Battle.net', '#148eff'],
  ['epic-games', 'Epic Games', '#3a3a3a'], ['gog-galaxy', 'GOG Galaxy', '#8a3fd1'],
  ['rockstar', 'Rockstar Games', '#e0a000'], ['riot', 'Riot Client', '#eb0029'],
  ['amazon-games', 'Amazon Games', '#ff9900'],
];

function which(bin) {
  for (const dir of (process.env.PATH || '').split(':')) {
    if (!dir) continue;
    const p = path.join(dir, bin);
    try { fs.accessSync(p, fs.constants.X_OK); if (fs.statSync(p).isFile()) return p; } catch {}
  }
  return null;
}

const flatpakInstalled = (id) =>
  dirExists(`/var/lib/flatpak/app/${id}`) || dirExists(path.join(HOME, '.local/share/flatpak/app', id));

async function lutrisLaunchers(lutrisCmd, isFlatpak) {
  const [cmd, ...pre] = isFlatpak ? ['flatpak', 'run', 'net.lutris.Lutris'] : [lutrisCmd];
  const out = await run(cmd, [...pre, '--list-games', '--installed', '--json'], 15000);
  const start = out.indexOf('[');
  if (start < 0) return [];
  let games = [];
  try { games = JSON.parse(out.slice(start, out.lastIndexOf(']') + 1)); } catch { return []; }
  const res = [];
  for (const g of games) {
    const slug = String(g.slug || '').toLowerCase();
    const m = LUTRIS_WORDS.find(([w]) => slug.includes(w));
    if (!m) continue;
    const uri = `lutris:rungameid/${g.id}`;
    res.push({
      id: `lutris-${slug}`, name: g.name || m[1], color: m[2], source: 'detected',
      target: isFlatpak ? `flatpak run net.lutris.Lutris ${uri}` : `${lutrisCmd} ${uri}`, args: '',
      subtitle: 'via Lutris', themeIcons: [`lutris_${slug}`],
    });
  }
  return res;
}

async function detectLinux() {
  const found = [];
  let lutris = null;
  for (const k of LINUX_KNOWN) {
    let target = null; let flat = false;
    for (const b of k.bins) { target = which(b); if (target) break; }
    if (!target && flatpakInstalled(k.flatpak)) { target = `flatpak run ${k.flatpak}`; flat = true; }
    if (!target) continue;
    found.push({ id: k.id, name: k.name, target, args: '', color: k.color, source: 'detected',
                 themeIcons: k.icons, subtitle: flat ? 'Flatpak' : null });
    if (k.id === 'lutris') lutris = { target, flat };
  }
  if (lutris) found.push(...await lutrisLaunchers(lutris.target, lutris.flat));
  return found;
}

// Look up an app icon from the system icon theme (Linux).
const ICON_BASES = [
  path.join(HOME, '.local/share/icons'),
  path.join(HOME, '.local/share/flatpak/exports/share/icons'),
  '/var/lib/flatpak/exports/share/icons',
  '/usr/share/icons',
];
const ICON_THEMES = ['hicolor', 'breeze', 'breeze-dark', 'Papirus', 'Papirus-Dark', 'Adwaita'];
const ICON_SIZES = ['scalable', '512x512', '256x256', '192x192', '128x128', '96x96', '64x64', '48x48'];

function findThemeIcon(names) {
  for (const name of names || []) {
    for (const base of ICON_BASES) for (const theme of ICON_THEMES) for (const size of ICON_SIZES) {
      for (const sub of ['apps', '']) for (const ext of ['svg', 'png']) {
        const p = path.join(base, theme, size, sub, `${name}.${ext}`);
        if (exists(p)) return p;
      }
    }
    for (const ext of ['svg', 'png']) {
      const p = `/usr/share/pixmaps/${name}.${ext}`;
      if (exists(p)) return p;
    }
  }
  return null;
}

async function detectLaunchers() {
  try { return IS_WIN ? await detectWindows() : await detectLinux(); }
  catch (e) { console.error('detect failed', e); return []; }
}

module.exports = { detectLaunchers, findThemeIcon, IS_WIN };
