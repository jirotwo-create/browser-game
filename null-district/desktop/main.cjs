const { app, BrowserWindow, Menu, protocol, net, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const scheme = 'null-district';
const gameURL = `${scheme}://game/index.html`;
protocol.registerSchemesAsPrivileged([{ scheme, privileges: {
  standard: true, secure: true, supportFetchAPI: true, corsEnabled: true,
} }]);

let window;
function createWindow() {
  window = new BrowserWindow({
    title: 'NULL DISTRICT — Chrome & Ash',
    width: 1440, height: 900, minWidth: 960, minHeight: 640,
    backgroundColor: '#080b13', autoHideMenuBar: true, show: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  window.once('ready-to-show', () => window.show());
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${scheme}://game/`)) event.preventDefault();
  });
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) {
      window.setFullScreen(!window.isFullScreen());
      event.preventDefault();
    }
  });
  window.loadURL(gameURL);
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  const root = app.getAppPath();
  protocol.handle(scheme, async request => {
    const url = new URL(request.url);
    if (url.hostname !== 'game') return new Response('Not found', { status: 404 });
    let file;
    try { file = path.resolve(root, '.' + (decodeURIComponent(url.pathname) || '/').replace(/^\/$/, '/index.html')); }
    catch { return new Response('Invalid path', { status: 400 }); }
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative) ||
        !['.html', '.js', '.css', '.svg', '.woff'].includes(path.extname(file)) ||
        relative.split(path.sep).some(part => ['desktop', 'node_modules', 'tests', 'dist'].includes(part))) {
      return new Response('Not found', { status: 404 });
    }
    try {
      const response = await net.fetch(pathToFileURL(file).toString());
      const headers = new Headers(response.headers);
      headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'");
      return new Response(response.body, { status: response.status, headers });
    } catch { return new Response('Not found', { status: 404 }); }
  });
  session.defaultSession.setPermissionRequestHandler((_contents, permission, callback) => {
    callback(permission === 'pointerLock' || permission === 'fullscreen');
  });
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
