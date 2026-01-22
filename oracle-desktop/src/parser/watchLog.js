import fs from "fs"
import chokidar from "chokidar"

// Store cleanup functions to prevent memory leaks
let mockInterval = null
let watcher = null

export function createWatcher(mainWindow){
  // Clean up any existing watchers/intervals first
  cleanupWatcher()
  
  const useMock = false  // Set to true to use mock events instead of real log
  const candidates = [
    `${process.env.HOME}/Library/Logs/Blizzard/Hearthstone/Power.log`,
    `${process.env.HOME}/Library/Logs/Hearthstone/Power.log`,
    `${process.env.HOME}/Library/Application Support/HearthstoneDeckTracker/Logs/Power.log`,
    `${process.env.HOME}/Library/Application Support/Hearthstone/Logs/Power.log`
  ]
  const logPath = candidates.find(p=>fs.existsSync(p))
  
  if(!logPath || useMock){
    console.log("⚙️  No Hearthstone Power.log found — running mock events.")
    let i=0
    mockInterval = setInterval(()=>{
      if(!mainWindow || mainWindow.isDestroyed()){
        cleanupWatcher()
        return
      }
      const fake=`MOCK_EVENT ${i++} - CardPlayed: Fireball`
      mainWindow.webContents.send("oracle:event",fake)
    },3000)
    return cleanupWatcher
  }
  
  console.log("✅ Watching Hearthstone log:",logPath)
  watcher = chokidar.watch(logPath,{ignoreInitial:true})
  watcher.on("change",()=>{
    if(!mainWindow || mainWindow.isDestroyed()){
      cleanupWatcher()
      return
    }
    const lines=fs.readFileSync(logPath,"utf8").split("\n").slice(-10)
    mainWindow.webContents.send("oracle:event",lines.join("\n"))
  })
  
  return cleanupWatcher
}

export function cleanupWatcher(){
  if(mockInterval){
    clearInterval(mockInterval)
    mockInterval = null
  }
  if(watcher){
    watcher.close()
    watcher = null
  }
}
