const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const prompt = require('electron-prompt')
const Store = require('electron-store')
const path = require('path')

const data = new Store

ipcMain.handle('colors:get', event => {
	if (!data.has('colors')) return
	const serialized = data.get('colors')
	const colors = serialized ? JSON.parse(serialized) : []
	event.sender.send('colors:update', ...colors)
})

ipcMain.handle('timer:get', event => {
	if (!data.has('timer')) return
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

	const menu = Menu.buildFromTemplate([
		{
			label: 'Edit',
			submenu: [
				{
					label: 'Add Color',
					accelerator: 'CmdOrCtrl+Plus',
					click: () => prompt({
						title: 'Add Color',
						type: 'input',
						inputAttrs: {
							required: true
						}
					}).then(res => {
						if (res) {
							const colors = data.has('colors') ? JSON.parse(data.get('colors')) : []
							colors.push(res)
							data.set('colors', JSON.stringify(colors))
							win.webContents.send('colors:new')
						}
					})
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Toggle Fullscreen',
					accelerator: 'CmdOrCtrl+F',
					click: () => win.setFullScreen(!win.isFullScreen())
				}
			]
		},
		{
			label: 'Dev',
			click: () => win.webContents.toggleDevTools()
		}
	])
	Menu.setApplicationMenu(menu)

	win.loadFile(path.join('ui', 'index.html'))
})