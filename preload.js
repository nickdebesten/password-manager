const {
  contextBridge,
  ipcRenderer
} = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, data) => {
      // whitelist channels
      const validChannels = ['adminLogin', 'savePassword', 'getDetails', 'saveOne', 'showHome', 'showSaveService', 'showChangePassword', 'deleteAll', 'checkIfPasswordExists', 'deleteOneService', 'logout', 'randompass','test']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data)
      }
    },
    receive: (channel, func) => {
      const validChannels = ['showMessage', 'passwordExists', 'setDetails', 'randompass','test']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    }
  }
)
