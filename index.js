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
						label: 'Input a color.',
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
					}).catch(_ => { })
				},
				{
					label: 'Remove Color',
					accelerator: 'CmdOrCtrl+-',
					click: () => prompt({
						title: 'Remove Color',
						label: 'Choose a color to remove.',
						type: 'select',
						selectOptions: data.has('colors') ? JSON.parse(data.get('colors')) : [],
						customStylesheet: path.join('ui', 'css', 'prompt.css')
					}).then(res => {
						if (res) {
							const colors = data.has('colors') ? JSON.parse(data.get('colors')) : []
							colors.splice(res)
							data.set('colors', JSON.stringify(colors))
							win.webContents.send('colors:new')
						}
					}).catch(_ => { })
				},
				{
					label: 'Set Interval',
					accelerator: 'CmdOrCtrl+I',
					click: () => prompt({
						title: 'Set Interval',
						label: 'In milliseconds',
						type: 'input',
						inputAttrs: {
							required: true,
							type: 'number'
						}
					}).then(res => {
						if (res) {
							data.set('timer', res)
							win.webContents.send('timer:new')
						}
					}).catch(_ => { })
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