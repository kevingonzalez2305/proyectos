// main.js — Proceso principal de Electron
// Crea la ventana de la aplicación de escritorio Cuatro Patas

const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Nombre que Windows usa para mostrar las notificaciones nativas
app.setAppUserModelId('Veterinaria Cuatro Patas');

let mainWindow;

function crearVentana() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 800,
    minWidth: 860,
    minHeight: 600,
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#F4F6F4',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Veterinaria Cuatro Patas',
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Quitar el menú superior tipo "File / Edit / View" (no se necesita en una app de consultorio)
  Menu.setApplicationMenu(null);

  // Descomenta la siguiente línea si quieres abrir las herramientas de desarrollo:
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  crearVentana();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
