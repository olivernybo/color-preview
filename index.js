// Electron modules
const { app, globalShortcut, BrowserWindow, Menu, ipcMain } = require('electron')
const prompt = require('electron-prompt')
const Store = require('electron-store')

// General modules
const path = require('path')

// Localstorage
const data = new Store
// Menu
let menu

// Send colors from storage
ipcMain.handle('colors:get', event => {
	if (!data.has('colors')) return
	const serialized = data.get('colors')
	const colors = serialized ? JSON.parse(serialized) : []
	event.sender.send('colors:update', ...colors)
})

// Send timer interval from storage
ipcMain.handle('timer:get', event => {
	if (!data.has('timer')) return
	const ms = data.get('timer')
	if (ms) event.sender.send('timer:update', Number(ms))
})

// Send transition delay from storage
ipcMain.handle('transition:get', event => {
	const ms = data.has('transition') ? data.get('transition') : 1000
	if (ms) event.sender.send('transition:update', Number(ms))
})

app.disableHardwareAcceleration()

app.whenReady().then(() => {
	const win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	})

	// Local function to toggle fullscreen
	const toggleFullscreen = () => {
		let fullscreen = win.isFullScreen()
		win.setFullScreen(!fullscreen)
		Menu.setApplicationMenu(fullscreen ? menu : null)
	}
	globalShortcut.register('CmdOrCtrl+F', toggleFullscreen)

	menu = Menu.buildFromTemplate([
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
						},
						alwaysOnTop: true
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
						customStylesheet: path.join(__dirname, 'ui', 'css', 'prompt.css'),
						alwaysOnTop: true
					}).then(res => {
						if (res) {
							const colors = data.has('colors') ? JSON.parse(data.get('colors')) : []
							colors.splice(res, 1)
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
						},
						alwaysOnTop: true
					}).then(res => {
						if (res) {
							data.set('timer', res)
							win.webContents.send('timer:new')
						}
					}).catch(_ => { })
				},
				{
					label: 'Set Transition Delay',
					accelerator: 'CmdOrCtrl+T',
					click: () => prompt({
						title: 'Set Transition Delay',
						label: 'In milliseconds',
						type: 'input',
						inputAttrs: {
							required: true,
							type: 'number'
						},
						alwaysOnTop: true
					}).then(res => {
						if (res) {
							data.set('transition', res)
							win.webContents.send('transition:new')
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
					click: toggleFullscreen
				}
			]
		},
		{
			label: 'Dev Tools',
			click: () => win.webContents.toggleDevTools()
		},
		{
			label: 'Dev Clean',
			click: () => data.clear()
		}
	])
	Menu.setApplicationMenu(menu)

	win.loadFile(path.join('ui', 'index.html'))
})
