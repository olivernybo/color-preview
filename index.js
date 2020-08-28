const { app, BrowserWindow, ipcMain } = require('electron')
const Store = require('electron-store')
const path = require('path')

const data = new Store

ipcMain.handle('colors:get', event => {
	const serialized = data.get('colors')
	const colors = serialized ? JSON.parse(serialized) : []
	event.sender.send('colors:update', ...colors)
})

ipcMain.handle('timer:get', event => {
	const ms = data.get('timer')
	if (ms) event.sender.send('timer:update', Number(ms))
})

app.disableHardwareAcceleration()

app.whenReady().then(() => {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	})
	win.loadFile(path.join('ui', 'index.html'))
})