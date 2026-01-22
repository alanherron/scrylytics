import { useState } from "react"
import * as THREE from "three"
import OracleCrystal from "./components/OracleCrystal"

const themeColors = {
  neutral: { glow: "#888888" },
  decklytics: { glow: "#66ccff" },
  playlytics: { glow: "#ff9999" },
  metalyzer: { glow: "#cc99ff" },
}

export default function App(){
  // State management for crystal: 0 = dormant, 1 = active/decklytics, 2 = playlytics, 3 = metalyzer
  const [crystalState, setCrystalState] = useState(0) // 0 = dormant, 1-3 = active themes
  const [justActivated, setJustActivated] = useState(false) // Track if we just activated for bounce
  const [colorTransition, setColorTransition] = useState(null) // Track color transitions
  
  // Map state to theme
  const themes = ["neutral", "decklytics", "playlytics", "metalyzer"]
  const theme = themes[crystalState] || "neutral"
  const active = crystalState > 0 // Active if not dormant
  
  const handleCrystalClick = () => {
    const prevState = crystalState
    const newState = (prevState + 1) % 4
    
    // Trigger bounce on every transition
    setJustActivated(true)
    // Reset justActivated after bounce animation completes
    setTimeout(() => setJustActivated(false), 2000)
    
    // Start color transition
    const prevTheme = themes[prevState] || "neutral"
    const nextTheme = themes[newState] || "neutral"
    const fromColor = new THREE.Color(themeColors[prevTheme].glow)
    const toColor = new THREE.Color(themeColors[nextTheme].glow)
    
    // Animate color transition over 1 second
    const startTime = Date.now()
    const duration = 1000
    
    const animateTransition = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease in-out for smooth transition
      const easedProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      
      setColorTransition({
        fromColor,
        toColor,
        progress: easedProgress
      })
      
      if (progress < 1) {
        requestAnimationFrame(animateTransition)
      } else {
        // Transition complete
        setColorTransition(null)
      }
    }
    
    animateTransition()
    
    // Cycle through states: dormant -> decklytics -> playlytics -> metalyzer -> dormant
    setCrystalState(newState)
  }
  
  return (
    <div 
      style={{ 
        width: "100vw", 
        height: "100vh", 
        background: "transparent",
        WebkitAppRegion: "drag", // Make window draggable
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Crystal UI - layered on top */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <OracleCrystal active={active} onClick={handleCrystalClick} theme={theme} justActivated={justActivated} colorTransition={colorTransition} />
      </div>
    </div>
  )  
}
