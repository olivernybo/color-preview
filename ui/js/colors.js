const { ipcRenderer } = require('electron')

let colors = []

const timerFunc = () => {
	console.log(colors)
}

let timer = setInterval(timerFunc, 3000)

ipcRenderer.on('colors:update', (_, ...newColors) => colors = newColors)
ipcRenderer.invoke('colors:get')

ipcRenderer.on('timer:update', (_, ms) => {
	clearInterval(timer)
	timer = setInterval(timerFunc, ms)
})
ipcRenderer.invoke('timer:get')