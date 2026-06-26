const { app, BrowserWindow,ipcMain,dialog } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs')



function createDesktopWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity:false
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

//for save data in c drive hardcoded
ipcMain.handle('write-user-json', async (event, usersDataArray) => {
  try {
    const { writeFileSync } = require('fs');
    const uniqueTimestamp = Date.now();
     const filePath = `C:\\api-data\\api-users-1782465640790.json`;  // Direct path to C Drive
    const jsonString = JSON.stringify(usersDataArray, null, 2); // Convert to JSON string
    
   fs.writeFileSync(filePath, jsonString, 'utf8'); // Physically save file
    return { success: true, savedPath: filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Direct file reading from C Drive
ipcMain.handle('read-user-json', async () => {
  try {
    const { readFileSync } = require('fs');
    const filePath = 'C:\\api-data\\api-users-1782465640790.json'; // The target path to read from
    
    const rawContent = readFileSync(filePath, 'utf8'); // Read file content text
    return JSON.parse(rawContent); // Convert text data block back into a real JSON array!
  } catch (error) {
    console.error('Read failed:', error);
    return null; // Return null if the file doesn't exist yet
  }
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
