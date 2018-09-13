const electron = require('electron')
const {
    app,
    BrowserWindow
} = require('electron')

let win

function createWindow() {
    win = new BrowserWindow({
        width: 1250,
        height: 700
    })
    // win.webContents.openDevTools()
    win.loadFile('index.html')
    win.setTitle('PUBLISHER')
    // win.setResizable(false)
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})