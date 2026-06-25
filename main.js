const { app, BrowserWindow,ipcMain } = require('electron');
const path = require('path');
const os = require('os');



function createDesktopWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
    // webPreferences: {
    //   nodeIntegration: false, // Security Best Practice: Keep turned off!
    //   contextIsolation: true  // Security Best Practice: Keep turned off!
    // }
  });

  // During local development, point Electron to view your live Angular server!
  mainWindow.loadURL('http://localhost:4200');

}

// 3. IPC MAIN LISTENER: Sit and wait for Angular to knock on the channel
ipcMain.handle('request-username', async () => {
  // Read the actual Windows/Mac username using Node.js powers
  const username = os.userInfo().username; 
  return username; // Send this string securely back up to Angular!
});


// Boot up the desktop window container shell when Electron is ready
app.whenReady().then(createDesktopWindow,
    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createDesktopWindow()
    }
  })
);

// Shut down the application entirely when windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit(); 
});
