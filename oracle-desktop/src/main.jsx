import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Suppress React DevTools version detection error (harmless, non-blocking)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message?.includes('Invalid argument not valid semver')) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }, true)
  
  // Also catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Invalid argument not valid semver')) {
      event.preventDefault()
      return false
    }
  })
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />)
