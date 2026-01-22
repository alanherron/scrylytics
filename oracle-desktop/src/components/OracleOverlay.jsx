import React, { useRef, useMemo, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/**
 * OracleOverlay - Fullscreen mystical shader background
 * 
 * Renders as a transparent overlay behind the UI, responding to:
 * - Time (animated swirls)
 * - Mouse position (interactive ripples)
 * - Active state (data-driven intensity)
 * - Data states (loading, analysis complete, etc.)
 * 
 * Features adaptive performance:
 * - Frame rate limiting for low-end systems
 * - Automatic fade-in/out
 * - Reduced quality when idle
 */
export default function OracleOverlay({ 
  active = false, 
  mouse = { x: 0, y: 0 },
  state = 'idle', // 'idle' | 'loading' | 'reading' | 'complete'
  theme = 'neutral', // 'neutral' | 'fire' | 'frost' | 'void'
  targetFPS = 60, // Target frame rate
  adaptiveQuality = true // Reduce quality when idle
}) {
  const meshRef = useRef()
  const materialRef = useRef()
  const { size, viewport } = useThree()
  const lastFrameTimeRef = useRef(0)
  const frameCountRef = useRef(0)
  const fpsRef = useRef(targetFPS)
  const [fadeOpacity, setFadeOpacity] = useState(0)
  const overlayStateRef = useRef(state) // Track state prop for useFrame
  
  // Keep state ref in sync
  useEffect(() => {
    overlayStateRef.current = state
  }, [state])
  
  // Adaptive performance: measure FPS and adjust quality
  useEffect(() => {
    const interval = setInterval(() => {
      // Estimate FPS (simplified)
      const currentFPS = fpsRef.current
      
      // Adjust quality based on performance
      if (adaptiveQuality && materialRef.current) {
        // Lower quality when FPS drops or when idle
        const quality = overlayStateRef.current === 'idle' ? 0.5 : Math.min(1.0, currentFPS / targetFPS)
        materialRef.current.uniforms.uIntensity.value = quality * 0.5
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state, adaptiveQuality, targetFPS])
  
  // Fade in/out effect
  useEffect(() => {
    const targetOpacity = active || state !== 'idle' ? 1.0 : 0.3
    const duration = 1000 // 1 second fade
    const startTime = Date.now()
    let startOpacity = fadeOpacity
    let animationFrameId = null
    
    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1.0)
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2 // Smooth ease in/out
      const current = startOpacity + (targetOpacity - startOpacity) * eased
      setFadeOpacity(current)
      
      if (progress < 1.0) {
        animationFrameId = requestAnimationFrame(fade)
      }
    }
    
    fade()
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [active, state]) // fadeOpacity intentionally excluded to use current value

  // Theme colors matching the crystal themes
  const themeColors = useMemo(() => {
    const themes = {
      neutral: { primary: [0.2, 0.47, 1.0], secondary: [0.4, 0.8, 1.0] }, // Blue
      fire: { primary: [1.0, 0.2, 0.2], secondary: [1.0, 0.6, 0.4] }, // Red/Orange
      frost: { primary: [0.4, 0.8, 1.0], secondary: [0.8, 0.95, 1.0] }, // Cyan/White
      void: { primary: [0.6, 0.2, 1.0], secondary: [0.8, 0.4, 1.0] }, // Purple
    }
    return themes[theme] || themes.neutral
  }, [theme])

  // Shader material with mystical arcane effect
  const shaderMaterial = useMemo(() => {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      uniform float iTime;
      uniform vec3 iResolution;
      uniform vec4 iMouse;
      uniform float uActive;
      uniform float uState;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uIntensity;
      uniform float uFadeOpacity;
      
      varying vec2 vUv;
      
      // Hash function for noise
      float hash(float n) {
        return fract(sin(n) * 43758.5453);
      }
      
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      
      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      // Rotate function
      vec2 rotate(vec2 v, float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return vec2(
          v.x * c - v.y * s,
          v.x * s + v.y * c
        );
      }
      
      void main() {
        vec2 uv = vUv;
        
        // Orb position - centered horizontally, but higher vertically
        // The orb appears above center, so we adjust the glow center upward
        // In UV space: (0,0) is bottom-left, (1,1) is top-right
        // To move glow up, increase Y (Y=0 is bottom, Y=1 is top)
        vec2 orbCenter = vec2(0.5, 0.75);
        
        // Normalized coordinates (-1 to 1) relative to orb center
        vec2 p = (uv - orbCenter) * 2.0;
        p.x *= iResolution.x / iResolution.y; // Aspect ratio correction
        
        // Distance from orb center
        float dist = length(p);
        
        // Strong radial falloff - glow only near orb (much smaller radius)
        // Use exponential falloff to avoid any visible edges or orb shape
        float maxRadius = 0.3; // Slightly larger for smoother fade
        
        // Only compute expensive effects if we're near the orb
        if (dist > maxRadius * 1.5) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }
        
        // Exponential falloff - no visible boundaries
        float smoothFade = exp(-dist * 8.0);
        
        // Use irregular noise patterns instead of circular waves to avoid orb-like shapes
        float noise1 = fbm(p * 4.0 + vec2(iTime * 0.2, iTime * 0.15));
        float noise2 = fbm(p * 6.0 - vec2(iTime * 0.25, iTime * 0.18));
        
        // Very subtle, irregular pattern - no circular waves
        float pattern = (noise1 + noise2) * 0.5;
        
        // State-based intensity modifiers - much lower overall
        float stateIntensity = 1.0;
        if (uState < 0.5) { // idle
          stateIntensity = 0.1;
        } else if (uState < 1.5) { // loading
          stateIntensity = 0.2 + 0.1 * sin(iTime * 3.0);
        } else if (uState < 2.5) { // reading
          stateIntensity = 0.25 + 0.08 * sin(iTime * 4.0);
        } else { // complete
          stateIntensity = 0.3 + 0.1 * sin(iTime * 5.0);
        }
        
        // Color mixing - very subtle
        vec3 color = mix(uPrimaryColor, uSecondaryColor, pattern * 0.3 + 0.5);
        
        // Very subtle spark bursts
        float spark = fbm(p * 20.0 + iTime * 1.0);
        spark = pow(spark, 12.0);
        color += spark * uSecondaryColor * 0.2;
        
        // Intensity based on active state - extremely subtle
        float intensity = uActive * uIntensity * stateIntensity * 0.15; // Much reduced
        
        // Gentle breathing rhythm when idle - very subtle
        if (uState < 0.5) {
          intensity *= 0.7 + 0.2 * sin(iTime * 0.8);
        }
        
        // Apply strong radial falloff - make it very smooth and gradual
        // Use exponential falloff instead of step for smoother transition
        float smoothFade = exp(-dist * 8.0); // Exponential falloff, no hard edge
        intensity *= smoothFade;
        
        // Final color with alpha - extremely subtle
        vec3 finalColor = color * intensity;
        // Very low alpha - barely visible atmospheric effect
        float alpha = min(length(finalColor) * 0.2, 0.08) * uFadeOpacity * smoothFade;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(size.width, size.height, 1) },
        iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
        uActive: { value: 0 },
        uState: { value: 0 }, // 0=idle, 1=loading, 2=reading, 3=complete
        uPrimaryColor: { value: new THREE.Vector3(...themeColors.primary) },
        uSecondaryColor: { value: new THREE.Vector3(...themeColors.secondary) },
        uIntensity: { value: 0.5 },
        uFadeOpacity: { value: 1.0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    })
  }, [themeColors, size])

  // Update uniforms each frame with adaptive performance
  useFrame((state, delta) => {
    if (!materialRef.current) return

    // Frame rate limiting for performance (only when idle)
    const now = performance.now()
    const frameInterval = 1000 / targetFPS
    const currentState = overlayStateRef.current // Use ref to get current state prop
    if (now - lastFrameTimeRef.current < frameInterval && currentState === 'idle') {
      // Skip frame if too soon and idle
      return
    }
    lastFrameTimeRef.current = now
    
    // Track FPS (simple moving average)
    frameCountRef.current++
    if (frameCountRef.current % 60 === 0) {
      fpsRef.current = 1 / delta
    }

    const t = state.clock.elapsedTime // state is Three.js state object here

    materialRef.current.uniforms.iTime.value = t
    materialRef.current.uniforms.uActive.value = active ? 1.0 : 0.0
    
    // Update state (0=idle, 1=loading, 2=reading, 3=complete)
    let stateValue = 0
    if (currentState === 'loading') stateValue = 1
    else if (currentState === 'reading') stateValue = 2
    else if (currentState === 'complete') stateValue = 3
    materialRef.current.uniforms.uState.value = stateValue
    
    // Update mouse position
    materialRef.current.uniforms.iMouse.value.set(
      mouse.x * size.width,
      (1.0 - mouse.y) * size.height, // Flip Y coordinate
      mouse.z || 0,
      0
    )
    
    // Update resolution
    materialRef.current.uniforms.iResolution.value.set(size.width, size.height, 1)
    
    // Update colors if theme changed
    materialRef.current.uniforms.uPrimaryColor.value.set(...themeColors.primary)
    materialRef.current.uniforms.uSecondaryColor.value.set(...themeColors.secondary)
    
    // Apply fade opacity
    if (materialRef.current.uniforms.uFadeOpacity) {
      materialRef.current.uniforms.uFadeOpacity.value = fadeOpacity
    }
  })

  // Fullscreen quad covering the entire viewport
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive ref={materialRef} object={shaderMaterial} attach="material" />
    </mesh>
  )
}

