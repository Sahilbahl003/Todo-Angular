const { contextBridge, ipcRenderer } = require('electron');

// The Context Bridge securely exposes our custom API to Angular
contextBridge.exposeInMainWorld('electronAPI', {
  // We create a safe gateway function named 'getSystemUsername'
  getSystemUsername: () => ipcRenderer.invoke('request-username') 
  // 'invoke' sends a secure request down the 'request-username' channel and waits for a response
});
