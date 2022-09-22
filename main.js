const unhandled = require('electron-unhandled');

unhandled();
const {
  app,
  BrowserWindow,
  ipcMain,
  screen,
  Menu,
  Notification,
  Tray
} = require('electron')
const path = require('path')
const { generateKey } = require('./utils/encryption')
const database = require('./utils/database')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const {autoUpdater} = require("electron-updater");
const jsonf = require('./package.json');
const { fstat, exists } = require('fs');
const fs = require('fs')
let versie = jsonf.version
const SUCCESS_STATUS = 'success'
const LOGIN_HTML = '/assets/html/login.html'
const SAVE_PASSWORD_HTML = '/assets/html/path.html'
const PASSWORD_LIST_HTML = '/assets/html/passwordList.html'
const SAVE_SERVICE_HTML = '/assets/html/saveService.html'
const UPDATE_HTML = '/assets/html/update.html'
app.setAppUserModelId("Password Manager")
let tray = ""
let closedd = false
function createTray(win) {
   tray = new Tray(path.join(__dirname, "icon.ico"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click() {win.show()}
    },
    {
      type: 'separator',
  },
  
    {
      label: 'Exit',
      click() { app.quit(); }
    }
  ]);

  tray.on('click', function (event) {
    win.show()
  });
  tray.setToolTip('Password Manager');
  tray.setContextMenu(contextMenu);
  
}

async function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  win = new BrowserWindow({
    width: parseInt(width * 0.50),
    height: parseInt(height * 0.65),
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js') // use a preload script
    }
  })
 // win.webContents.openDevTools()
  Menu.setApplicationMenu(null)
win.on("closed", (event) => {
app.quit()
});
  // Load app
 // win.loadFile("C:/Users/Nick/Downloads/Password-Manager/assets/html/path.html")
  if (database.checkIfDbExists()) { win.loadFile(path.join(__dirname, LOGIN_HTML)) } else { win.loadFile(path.join(__dirname, SAVE_PASSWORD_HTML)) }
win.on('minimize', (event) => {
event.preventDefault()
const melding = {
  title: "Password Manager",
  body: 'Password Manager minimized.',
  icon: path.join(__dirname, 'icon.ico')
}
new Notification({ title: melding.title, body: melding.body, icon: melding.icon}).show()

});
  createTray(win)
}
let loading;
function update() {
 loading = new BrowserWindow({
    width: 550,
    height: 550,
    icon: path.join(__dirname, 'icon.ico'),
    frame: false
  })
  Menu.setApplicationMenu(null)
  loading.loadFile(path.join(__dirname, UPDATE_HTML))
  autoUpdater.checkForUpdates()
}
app.on('ready', update)

ipcMain.on('savePassword', async (event, args) => {
  global.enc_key = generateKey(args.password)
  await database.createAdminPassword(args.password)
  win.loadFile(path.join(__dirname, LOGIN_HTML))
})

ipcMain.on('adminLogin', async (event, args) => {
  global.enc_key = generateKey(args.password)
  await database.readAll()
  const isCorrect = database.checkAdminPassword(args.password)
  console.log('Password is Correct?', isCorrect)
  if (isCorrect) {
    win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML))
  } else {
    win.webContents.send('showMessage', 'You have entered wrong password')
  }
})

ipcMain.on('getDetails', async (event, args) => {
  const dataToBeSent = await database.readAll()
  if (dataToBeSent.status === SUCCESS_STATUS) { win.webContents.send('setDetails', dataToBeSent.data) } else { win.webContents.send('showMessage', dataToBeSent.message) }
})

ipcMain.on('saveOne', async (event, args) => {
  const updates = Object.keys(args)
  const allowedUpdates = ['service', 'username', 'password']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if (isValidOperation) {
    const dataToBeSent = await database.addOne(args)
    if (dataToBeSent.status === SUCCESS_STATUS) { win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML)) } else { win.webContents.send('showMessage', dataToBeSent.message) }
  } else {
    win.webContents.send('showMessage', 'Invalid field sent!')
  }
})

ipcMain.on('showHome', (event, args) => {
  win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML))
})

ipcMain.on('showSaveService', (event, args) => {
  win.loadFile(path.join(__dirname, SAVE_SERVICE_HTML))
})

ipcMain.on('showChangePassword', (event, args) => {
  win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML))
})

ipcMain.on('deleteAll', async (event, args) => {
  const dataToBeSent = await database.deleteAll()
  win.webContents.send('showMessage', dataToBeSent.message)
})

ipcMain.on('checkIfPasswordExists', (event, args) => {
  const dataToBeSent = database.checkIfPasswordExists()
  win.webContents.send('passwordExists', dataToBeSent)
})

ipcMain.on('deleteOneService', async (event, args) => {
  const dataToBeSent = await database.deleteOne(args.id)
  win.webContents.send('showMessage', dataToBeSent.message)
})
ipcMain.on('logout', async (event, args) => {
  win.loadFile(path.join(__dirname, LOGIN_HTML))
});


 autoUpdater.on('checking-for-update', () => {
  console.log("checking for updates")
 })

 autoUpdater.on('update-available', (info) => {
  console.log("update available")
  const melding = {
    title: "Password Manager",
    body: 'Downloading update..',
    icon: path.join(__dirname, 'icon.ico')
  }
  new Notification({ title: melding.title, body: melding.body, icon: melding.icon}).show()
})
 autoUpdater.on('update-not-available', (info) => {
  const melding = {
    title: "Password Manager",
    body: 'No update found. Starting password manager ' + versie,
    icon: path.join(__dirname, 'icon.ico')
  }
  new Notification({ title: melding.title, body: melding.body, icon: melding.icon}).show()
loading.hide()
createWindow()
 })
  autoUpdater.on('update-downloaded', (info) => {
   autoUpdater.quitAndInstall();  
 })
 let quit;
 app.on('before-quit', (event) => {
  if(quit == true)return
  quit = true
  event.preventDefault()
  const melding = {
    title: "Password Manager",
    body: 'Password Manager closing...',
    icon: path.join(__dirname, 'icon.ico')
  }
  new Notification({ title: melding.title, body: melding.body, icon: melding.icon}).show()
  setTimeout(() => {
    app.exit()
  }, 1000);
 });