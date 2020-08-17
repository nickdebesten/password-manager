const {
	app,
	BrowserWindow,
	ipcMain,
	Menu
} = require("electron");
const path = require("path");
const database = require('./utils/database')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
const SUCCESS_STATUS = 'success'
const LOGIN_HTML = './assets/html/login.html'
const SAVE_PASSWORD_HTML = './assets/html/savePassword.html'
const PASSWORD_LIST_HTML = './assets/html/passwordList.html'
const SAVE_SERVICE_HTML = './assets/html/saveService.html'

async function createWindow() {

	// Create the browser window.
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: false, // is default value after Electron v5
			contextIsolation: true, // protect against prototype pollution
			enableRemoteModule: false, // turn off remote
			preload: path.join(__dirname, "preload.js") // use a preload script
		}
	});
	Menu.setApplicationMenu(null)

	// Load app
	let fileData = await database.readAll()
	if (fileData.status === SUCCESS_STATUS)
		win.loadFile(path.join(__dirname, LOGIN_HTML));
	else
		win.loadFile(path.join(__dirname, SAVE_PASSWORD_HTML));

	win.on('closed', function () {
		app.quit();
	});
}

app.on("ready", createWindow);


ipcMain.on("savePassword", async (event, args) => {
	await database.createAdminPassword(args.password)
	win.loadFile(path.join(__dirname, LOGIN_HTML));
})

ipcMain.on("adminLogin", (event, args) => {
	const isCorrect = database.checkAdminPassword(args.password)
	console.log('Password is Correct?', isCorrect)
	if (isCorrect) {
		win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML));
	} else {
		win.webContents.send("showMessage", "You have entered wrong password");
	}
})


ipcMain.on("getDetails", async (event, args) => {
	var dataToBeSent = await database.readAll()
	if (dataToBeSent.status === SUCCESS_STATUS)
		win.webContents.send("setDetails", dataToBeSent.data);
	else
		win.webContents.send("showMessage", dataToBeSent.message);

})

ipcMain.on("saveOne", async (event, args) => {
	var dataToBeSent = await database.addOne(args.service, args.password)
	if (dataToBeSent.status === SUCCESS_STATUS)
		win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML));
	else
		win.webContents.send("showMessage", dataToBeSent.message);
})

ipcMain.on("showHome", (event, args) => {
	win.loadFile(path.join(__dirname, PASSWORD_LIST_HTML));
})

ipcMain.on("showSaveService", (event, args) => {
	win.loadFile(path.join(__dirname, SAVE_SERVICE_HTML));
})

ipcMain.on("showChangePassword", (event, args) => {
	win.loadFile(path.join(__dirname, SAVE_PASSWORD_HTML));
})

ipcMain.on("deleteAll", async (event, args) => {
	var dataToBeSent = await database.deleteAll()
	win.webContents.send("showMessage", dataToBeSent.message);
})

ipcMain.on("checkIfPasswordExists", (event, args) => {
	var dataToBeSent = database.checkIfPasswordExists()
	win.webContents.send("passwordExists", dataToBeSent);
})

ipcMain.on("deleteOneService", async (event, args) => {
	var dataToBeSent = await database.deleteOne(args.service)
	win.webContents.send("showMessage", dataToBeSent.message);
})