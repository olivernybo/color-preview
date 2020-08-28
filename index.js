const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	})
	win.loadFile(path.join('ui', 'index.html'))
})