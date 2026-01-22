// main.mjs  — main process for Electron
import { app, BrowserWindow, globalShortcut } from "electron"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { createWatcher, cleanupWatcher } from "./src/parser/watchLog.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let mainWindow
let isVisible = true
let cleanupWatcherFn = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: true,
    transparent: true,
    frame: false, // No window frame for overlay
    alwaysOnTop: true, // Stay on top
    skipTaskbar: true, // Don't show in taskbar
    backgroundColor: "#00000000", // Fully transparent
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  })

  // Check if we're in development mode (Vite dev server)
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged
  
  if (isDev) {
    // Load from Vite dev server
    const viteUrl = "http://localhost:5173"
    console.log("🔍 Loading from Vite dev server:", viteUrl)
    
    // Wait a bit for Vite to be ready, then load
    setTimeout(() => {
      mainWindow.loadURL(viteUrl).catch((err) => {
        console.error("❌ Failed to load URL:", err)
        // Retry after a delay
        setTimeout(() => {
          mainWindow.loadURL(viteUrl).catch((retryErr) => {
            console.error("❌ Retry failed:", retryErr)
          })
        }, 2000)
      })
    }, 1000)
  } else {
    // Load from built dist folder
    const htmlPath = join(__dirname, "dist", "index.html")
    console.log("🔍 Loading file:", htmlPath)
    mainWindow.loadFile(htmlPath)
  }

  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("❌ Failed to load:", errorCode, errorDescription)
  })

  mainWindow.webContents.on("console-message", (event, level, message) => {
    console.log(`[Renderer ${level}]:`, message)
  })

  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    console.log("🔮 Oracle window ready")
  })

  // Clean up watcher when window is closed
  mainWindow.on("closed", () => {
    if (cleanupWatcherFn) {
      cleanupWatcherFn()
      cleanupWatcherFn = null
    }
    mainWindow = null
  })

  // Register global shortcut
  globalShortcut.register("CommandOrControl+Shift+O", () => {
    if (!mainWindow) return
    isVisible = !isVisible
    if (isVisible) mainWindow.showInactive()
    else mainWindow.hide()
    console.log(`🔮 Oracle overlay ${isVisible ? "shown" : "hidden"}`)
  })
}

app.whenReady().then(() => {
  createWindow()
  cleanupWatcherFn = createWatcher(mainWindow)
})

app.on("window-all-closed", () => {
  // Clean up watcher before quitting
  if (cleanupWatcherFn) {
    cleanupWatcherFn()
    cleanupWatcherFn = null
  }
  // Unregister all global shortcuts
  globalShortcut.unregisterAll()
  app.quit()
})

app.on("before-quit", () => {
  // Ensure cleanup happens before quit
  cleanupWatcher()
  globalShortcut.unregisterAll()
})

// Handle app reactivation (macOS)
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
    cleanupWatcherFn = createWatcher(mainWindow)
  }
})
