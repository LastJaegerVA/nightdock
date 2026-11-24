const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hub', {
  getState: () => ipcRenderer.invoke('get-state'),
  rescan: () => ipcRenderer.invoke('rescan'),
  saveConfig: (c) => ipcRenderer.invoke('save-config', c),
  trayNames: (n, l) => ipcRenderer.invoke('tray-names', n, l),
  getIcon: (e) => ipcRenderer.invoke('get-icon', e),
  launch: (e) => ipcRenderer.invoke('launch', e),
  pickProgram: (l) => ipcRenderer.invoke('pick-program', l),
  pickImage: (kind, l) => ipcRenderer.invoke('pick-image', kind, l),
  fileUrl: (p) => ipcRenderer.invoke('file-url', p),
  showInFolder: (p) => ipcRenderer.invoke('show-in-folder', p),
  openConfigFolder: () => ipcRenderer.invoke('open-config-folder'),
  win: (a) => ipcRenderer.send('win', a),
  onMaximized: (cb) => ipcRenderer.on('maximized', (_e, v) => cb(v)),
  onLaunchId: (cb) => ipcRenderer.on('launch-id', (_e, id) => cb(id)),
});
