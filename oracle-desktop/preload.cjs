const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("oracle", {
  onEvent: (cb) => {
    const handler = (_, data) => cb(data)
    ipcRenderer.on("oracle:event", handler)
    // Return cleanup function to remove listener
    return () => ipcRenderer.removeListener("oracle:event", handler)
  },
})
