const { app, BrowserWindow, ipcMain, dialog, shell, Notification } = require('electron')
const { exec } = require("child_process")
const path = require('path')

var mainWindow = undefined

function createWindow () {
  mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  })

  //mainWindow.setMenu(null)

  mainWindow.loadFile('src/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})