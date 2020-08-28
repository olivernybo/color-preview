const { ipcRenderer } = require('electron')

let colors = []
let i = 0

const timerFunc = () => {
	if (colors.length <= i) return
	const color = colors[i]
	const body = document.querySelector('body')
	body.style.backgroundColor = color
	i++
	if (colors.length <= i) i = 0
}

let timer = setInterval(timerFunc, 3000)

ipcRenderer.on('colors:update', (_, ...newColors) => {
	colors = newColors
	timerFunc()
})
ipcRenderer.on('colors:new', () => ipcRenderer.invoke('colors:get'))
ipcRenderer.invoke('colors:get')

ipcRenderer.on('timer:update', (_, ms) => {
	clearInterval(timer)
	timer = setInterval(timerFunc, ms)
})
ipcRenderer.on('timer:new', () => ipcRenderer.invoke('timer:get'))
ipcRenderer.invoke('timer:get')