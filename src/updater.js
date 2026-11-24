// Nightdock updater.
//
// How it works, in plain words:
// - It only ever talks to Nightdock's own GitHub page (github.com/LastJaegerVA/nightdock).
// - It never downloads or installs anything on its own. It only tells you a new version
//   exists; nothing happens until you press "Update now".
// - Every download is checked against the SHA-256 checksum GitHub shows for that file.
//   If it doesn't match, the file is deleted and nothing is installed.
// - It installs the same way you would by hand: the normal Windows installer, the same
//   AppImage, or your system's package manager (which asks for your password itself).
// - "Check for updates" can be turned off in Settings. No data about you is sent.
const { app, net } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

const REPO = 'LastJaegerVA/nightdock';
const API = `https://api.github.com/repos/${REPO}/releases/latest`;
const DOWNLOAD_PREFIX = `https://github.com/${REPO}/releases/download/`;
const ASSETS = {
  'win-setup': 'Nightdock-Windows-Setup.exe',
  appimage: 'Nightdock-Linux-x86_64.AppImage',
  pacman: 'nightdock-x86_64.pkg.tar.xz',
  deb: 'Nightdock-Linux-Ubuntu-Debian.deb',
  rpm: 'Nightdock-Linux-Fedora.rpm',
};

const run = (cmd, args) => new Promise((resolve) => {
  execFile(cmd, args, { timeout: 15000 }, (err, stdout) => resolve(err ? null : String(stdout)));
});
const which = async (cmd) => !!(await run('sh', ['-c', `command -v ${cmd}`]));

function isNewer(latest, current) {
  const a = String(latest).split('.').map((n) => parseInt(n, 10) || 0);
  const b = String(current).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  return false;
}

// How was this copy of Nightdock installed? That decides how it can update itself.
let kindCache = null;
async function installKind() {
  if (kindCache) return kindCache;
  let kind = 'manual';
  if (!app.isPackaged) kind = 'dev';
  else if (process.platform === 'win32') {
    // Installed with the setup program (it leaves an uninstaller next to the app), or the portable zip.
    kind = fs.existsSync(path.join(path.dirname(process.execPath), 'Uninstall Nightdock.exe')) ? 'win-setup' : 'portable';
  } else if (process.env.APPIMAGE) kind = 'appimage';
  else if (await run('pacman', ['-Qq', 'nightdock'])) kind = 'pacman';
  else if ((await run('dpkg-query', ['-W', '-f=${Status}', 'nightdock']) || '').includes('install ok installed')) kind = 'deb';
  else if (await run('rpm', ['-q', 'nightdock'])) kind = 'rpm';
  if (process.arch !== 'x64') kind = 'manual';
  kindCache = kind;
  return kind;
}

async function check() {
  const res = await net.fetch(API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': `Nightdock/${app.getVersion()}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const rel = await res.json();
  const version = String(rel.tag_name || '').replace(/^v/, '');
  const current = app.getVersion();
  const kind = await installKind();
  const info = { current, version, available: isNewer(version, current), page: String(rel.html_url || '').startsWith(`https://github.com/${REPO}/`) ? rel.html_url : `https://github.com/${REPO}/releases/latest`, notes: String(rel.body || '').slice(0, 4000), kind, canInstall: false };
  const name = ASSETS[kind];
  const asset = name && (rel.assets || []).find((a) => a.name === name);
  if (asset && String(asset.browser_download_url).startsWith(DOWNLOAD_PREFIX) && /^sha256:[0-9a-f]{64}$/.test(asset.digest || '')) {
    info.canInstall = true;
    info.asset = { name: asset.name, url: asset.browser_download_url, sha256: asset.digest.slice(7), size: asset.size };
  }
  return info;
}

async function download(asset, onProgress) {
  const dir = path.join(app.getPath('temp'), 'nightdock-update');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, asset.name);
  const res = await net.fetch(asset.url, { headers: { 'User-Agent': `Nightdock/${app.getVersion()}` }, cache: 'no-store' });
  if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`);
  const total = Number(res.headers.get('content-length')) || asset.size || 0;
  const hash = crypto.createHash('sha256');
  const out = fs.createWriteStream(file);
  const reader = res.body.getReader();
  let got = 0; let lastPct = -1;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    hash.update(value); got += value.length;
    if (!out.write(Buffer.from(value))) await new Promise((r) => out.once('drain', r));
    const pct = total ? Math.floor((got / total) * 100) : 0;
    if (pct !== lastPct) { lastPct = pct; onProgress(pct); }
  }
  await new Promise((r, j) => out.end((e) => (e ? j(e) : r())));
  if (hash.digest('hex') !== asset.sha256) {
    fs.rmSync(dir, { recursive: true, force: true });
    const e = new Error('checksum mismatch'); e.code = 'upd.hash'; throw e;
  }
  return file;
}

// Linux packages are installed by the system's package manager. pkexec shows the
// normal system password prompt; Nightdock never sees or stores the password.
async function systemInstall(kind, file) {
  let cmd;
  if (kind === 'pacman') cmd = ['pacman', '-U', '--noconfirm', file];
  else if (kind === 'deb') cmd = ['apt-get', 'install', '-y', file];
  else if (await which('dnf')) cmd = ['dnf', 'install', '-y', file];
  else if (await which('zypper')) cmd = ['zypper', '--non-interactive', 'install', '--allow-unsigned-rpm', file];
  else cmd = ['rpm', '-U', file];
  if (!(await which('pkexec'))) { const e = new Error('pkexec missing'); e.code = 'upd.noPkexec'; throw e; }
  await new Promise((resolve, reject) => {
    execFile('pkexec', cmd, { timeout: 10 * 60 * 1000 }, (err, _o, stderr) => {
      if (!err) return resolve();
      const e = new Error(String(stderr || err.message).trim().split('\n').pop());
      if (err.code === 126 || err.code === 127) e.code = 'upd.cancelled';
      reject(e);
    });
  });
}

// Download, verify and install. Nightdock restarts into the new version afterwards.
async function install(info, onProgress, quit) {
  if (!info || !info.canInstall) throw new Error('Nothing to install');
  const file = await download(info.asset, (p) => onProgress({ stage: 'download', pct: p }));
  onProgress({ stage: 'install' });
  if (info.kind === 'win-setup') {
    // The normal Nightdock installer, run quietly; /RELAUNCH starts Nightdock again when it's done.
    spawn(file, ['/S', '/RELAUNCH'], { detached: true, stdio: 'ignore' }).unref();
    quit();
  } else if (info.kind === 'appimage') {
    const dest = process.env.APPIMAGE;
    fs.copyFileSync(file, dest + '.new');
    fs.chmodSync(dest + '.new', 0o755);
    fs.renameSync(dest + '.new', dest);
    app.relaunch({ execPath: dest, args: [] });
    quit(true);
  } else {
    await systemInstall(info.kind, file);
    app.relaunch();
    quit(true);
  }
}

module.exports = { check, install, installKind, isNewer, download };
