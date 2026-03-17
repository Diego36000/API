const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const API_URL = process.env.API_URL || 'https://localhost:8080';

// Permitir certificado autofirmado en localhost
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    try {
        if (new URL(url).hostname === 'localhost') {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    } catch {
        callback(false);
    }
});

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 600,
        title: 'NekoPop Admin',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    win.setMenuBarVisibility(false);

    // Abrir enlaces externos en el navegador, no en Electron
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    win.loadURL(`${API_URL}/login`);

    // Si el servidor no está disponible, mostrar página de error
    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
        if (errorCode === -102 || errorCode === -105 || errorCode === -106) {
            win.loadFile(path.join(__dirname, 'error.html'));
        }
        console.error('Failed to load:', errorCode, errorDescription);
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
