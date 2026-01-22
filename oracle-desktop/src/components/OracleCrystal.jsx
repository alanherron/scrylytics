import React, { useRef, useMemo, useEffect, useCallback, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useTexture, Environment, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

const themes = {
  decklytics: { base: "#3377ff", glow: "#66ccff" },
  playlytics: { base: "#ff3333", glow: "#ff9999" },
  metalyzer: { base: "#9933ff", glow: "#cc99ff" },
  neutral: { base: "#3377ff", glow: "#66ccff" },
}

export default function OracleCrystal({ active, theme = "neutral", onClick, justActivated = false, colorTransition = null }) {
  const colors = themes[theme] || themes.neutral
  const containerRef = useRef(null)
  const mouseDownRef = useRef({ x: 0, y: 0, time: 0, isDragging: false, dragTimer: null, hasMoved: false, movementChecker: null })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  
  // Handle mouse move (only when dragging) - defined first so it can be referenced
  const handleMouseMove = useCallback((e) => {
    if (!mouseDownRef.current.isDragging || !containerRef.current) return
    
    const deltaX = e.clientX - mouseDownRef.current.x
    const deltaY = e.clientY - mouseDownRef.current.y
    
    // Update position using ref to avoid dependency issues
    setPosition(prev => {
      const newX = prev.x + deltaX
      const newY = prev.y + deltaY
      
      // Apply transform immediately for smooth dragging
      containerRef.current.style.transform = `translate(calc(-50% + ${newX}px), calc(-50% + ${newY}px))`
      
      return { x: newX, y: newY }
    })
    
    // Update reference point
    mouseDownRef.current.x = e.clientX
    mouseDownRef.current.y = e.clientY
  }, [])
  
  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    const startTime = performance.now()
    const startX = e.clientX
    const startY = e.clientY
    
    mouseDownRef.current = {
      x: startX,
      y: startY,
      time: startTime,
      isDragging: false,
      dragTimer: null,
      hasMoved: false,
      movementChecker: null
    }
    
    // Track mouse movement during the 2 second hold period
    const checkMovement = (moveEvent) => {
      const dx = Math.abs(moveEvent.clientX - startX)
      const dy = Math.abs(moveEvent.clientY - startY)
      if (dx > 5 || dy > 5) {
        mouseDownRef.current.hasMoved = true
      }
    }
    
    mouseDownRef.current.movementChecker = checkMovement
    document.addEventListener('mousemove', checkMovement)
    
    // Set timer to start dragging after 2 seconds of holding
    const dragTimer = setTimeout(() => {
      if (mouseDownRef.current.time > 0) {
        // Remove movement checker
        if (mouseDownRef.current.movementChecker) {
          document.removeEventListener('mousemove', mouseDownRef.current.movementChecker)
        }
        
        // Start dragging
        mouseDownRef.current.isDragging = true
        setIsDragging(true)
        document.addEventListener('mousemove', handleMouseMove)
      }
    }, 2000) // 2 second hold required
    
    mouseDownRef.current.dragTimer = dragTimer
  }, [handleMouseMove])
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    const timeDiff = performance.now() - mouseDownRef.current.time
    
    // Clear drag timer if still waiting
    if (mouseDownRef.current.dragTimer) {
      clearTimeout(mouseDownRef.current.dragTimer)
    }
    
    // Remove movement checker listener
    if (mouseDownRef.current.movementChecker) {
      document.removeEventListener('mousemove', mouseDownRef.current.movementChecker)
    }
    
    // Remove drag listener
    document.removeEventListener('mousemove', handleMouseMove)
    
    // If was dragging, stop dragging (drop the ball)
    if (mouseDownRef.current.isDragging) {
      mouseDownRef.current.isDragging = false
      setIsDragging(false)
      // Could add physics/drop animation here if desired
    } else if (!mouseDownRef.current.hasMoved && timeDiff < 300) {
      // Click/release without movement = activate
      if (onClick) {
        onClick()
      }
    }
    
    // Reset
    mouseDownRef.current = { x: 0, y: 0, time: 0, isDragging: false, dragTimer: null, hasMoved: false, movementChecker: null }
  }, [handleMouseMove, onClick])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mouseDownRef.current.dragTimer) {
        clearTimeout(mouseDownRef.current.dragTimer)
      }
      if (mouseDownRef.current.movementChecker) {
        document.removeEventListener('mousemove', mouseDownRef.current.movementChecker)
      }
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])
  
  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ 
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: '100vw',
        height: '100vh',
        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
        cursor: isDragging ? 'grabbing' : 'pointer',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      <Canvas 
        camera={{ 
          position: [0, 0, 6], 
          fov: 60,
          near: 0.01,
          far: 1000
        }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          alpha: true,
          depth: true,
          stencil: false
        }}
        style={{ background: "transparent" }}
        onCreated={({ gl, camera }) => {
          gl.shadowMap.enabled = false
          // Set camera to simulate sitting in a chair looking down at crystal ball on table
          // Camera positioned above and angled down, centered on screen
          const distance = 5.5 // Distance from orb
          const height = 2.0 // Height above table (like sitting in chair) - lowered to center better
          
          // Position camera above and back, angled down
          camera.position.x = 0
          camera.position.y = height
          camera.position.z = distance
          
          // Look down at the orb/base (around y=0.8 for better centering)
          camera.lookAt(0, 0.8, 0)
        }}
      >
      {/* Warehouse environment from drei - matching magic-marble-tutorial example */}
      <Suspense fallback={null}>
        <Environment files="/warehouse.hdr" />
      </Suspense>
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={false}
        enableDamping={false}
        autoRotate={true}
        autoRotateSpeed={2.0}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        makeDefault={false}
      />
      <group>
        <WoodenBase active={active} colors={colors} />
        <group position={[0, 1.15, 0]}>
          <Suspense fallback={null}>
            <CrystalMesh active={active} colors={colors} justActivated={justActivated} colorTransition={colorTransition} />
          </Suspense>
          {active ? (
            <Suspense fallback={null}>
              <InnerParticles active={active} colors={colors} colorTransition={colorTransition} />
            </Suspense>
          ) : null}
        </group>
      </group>
    </Canvas>
    </div>
  )
}

/* ------------------ Magic Marble Material - from magic-marble-tutorial ------------------ */
function MagicMarbleMaterial({ active, colors, colorTransition, ...props }) {
  // Load the noise textures - Vite serves public folder from root
  // useTexture throws if texture fails, so wrap in try-catch or ensure textures exist
  const heightMap = useTexture('/noise.jpg')
  const displacementMap = useTexture('/noise3D.jpg')
  
  // Configure textures - clone to avoid modifying hook return values
  const heightMapConfigured = useMemo(() => {
    const tex = heightMap.clone()
    tex.minFilter = THREE.NearestFilter
    return tex
  }, [heightMap])
  
  const displacementMapConfigured = useMemo(() => {
    const tex = displacementMap.clone()
    tex.minFilter = THREE.NearestFilter
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [displacementMap])

  // Create persistent local uniforms object
  const uniformsRef = useRef({
    time: { value: 0 },
    colorA: { value: new THREE.Color(0, 0, 0) }, // Always black for gradient start
    colorB: { value: new THREE.Color(colors.glow) }, // Theme color when active
    heightMap: { value: heightMapConfigured },
    displacementMap: { value: displacementMapConfigured },
    iterations: { value: 48 },
    depth: { value: 0.6 },
    smoothing: { value: 0.2 },
    displacement: { value: 0.1 },
  })
  
  // Update textures when they change
  useEffect(() => {
    uniformsRef.current.heightMap.value = heightMapConfigured
    uniformsRef.current.displacementMap.value = displacementMapConfigured
  }, [heightMapConfigured, displacementMapConfigured])

  // Material ref for emissive glow
  const materialRef = useRef()
  
  // Update colors with smooth transition
  useFrame(({ clock }) => {
    // Update time uniform
    uniformsRef.current.time.value = clock.elapsedTime * 0.05
    
    // Handle color transitions - orb shader transitions directly
    let currentGlowColor
    if (colorTransition) {
      const { fromColor, toColor, progress } = colorTransition
      // Direct transition for orb shader
      const currentColorB = new THREE.Color()
      currentColorB.lerpColors(fromColor, toColor, progress)
      uniformsRef.current.colorB.value.copy(currentColorB)
      currentGlowColor = currentColorB
      
      // Always black for gradient start
      uniformsRef.current.colorA.value.set(new THREE.Color(0, 0, 0))
    } else if (active) {
      uniformsRef.current.colorB.value.set(colors.glow) // Target color
      uniformsRef.current.colorA.value.set(new THREE.Color(0, 0, 0)) // Always black
      currentGlowColor = new THREE.Color(colors.glow)
    } else {
      uniformsRef.current.colorB.value.set(new THREE.Color(0.3, 0.3, 0.3)) // Grey when inactive
      uniformsRef.current.colorA.value.set(new THREE.Color(0, 0, 0)) // Always black
      currentGlowColor = new THREE.Color(0.3, 0.3, 0.3)
    }
    
    // Update emissive glow - like magic-marble-tutorial background glow effect
    if (materialRef.current) {
      materialRef.current.emissive.copy(currentGlowColor)
      materialRef.current.emissiveIntensity = active ? 0.3 : 0.1
    }
  })

  // Add our custom bits to the MeshStandardMaterial
  const onBeforeCompile = (shader) => {
    // Wire up local uniform references
    shader.uniforms = { ...shader.uniforms, ...uniformsRef.current }

    // Add to top of vertex shader
    shader.vertexShader =
      /* glsl */ `
      varying vec3 v_pos;
      varying vec3 v_dir;
    ` + shader.vertexShader

    // Assign values to varyings inside of main()
    shader.vertexShader = shader.vertexShader.replace(
      /void main\(\) {/,
      (match) =>
        match +
        /* glsl */ `
        v_dir = position - cameraPosition; // Points from camera to vertex
        v_pos = position;
        `
    )

    // Add to top of fragment shader
    shader.fragmentShader =
      /* glsl */ `
      #define FLIP vec2(1., -1.)
      
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform sampler2D heightMap;
      uniform sampler2D displacementMap;
      uniform int iterations;
      uniform float depth;
      uniform float smoothing;
      uniform float displacement;
      uniform float time;
      
      varying vec3 v_pos;
      varying vec3 v_dir;
    ` + shader.fragmentShader

    // Add above fragment shader main() so we can access common.glsl.js
    shader.fragmentShader = shader.fragmentShader.replace(
      /void main\(\) {/,
      (match) =>
        /* glsl */ `
       	/**
         * @param p - Point to displace
         * @param strength - How much the map can displace the point
         * @returns Point with scrolling displacement applied
         */
        vec3 displacePoint(vec3 p, float strength) {
        	vec2 uv = equirectUv(normalize(p));
          vec2 scroll = vec2(time, 0.);
          vec3 displacementA = texture(displacementMap, uv + scroll).rgb; // Upright
					vec3 displacementB = texture(displacementMap, uv * FLIP - scroll).rgb; // Upside down
          
          // Center the range to [-0.5, 0.5], note the range of their sum is [-1, 1]
          displacementA -= 0.5;
          displacementB -= 0.5;
          
          return p + strength * (displacementA + displacementB);
        }
        
				/**
          * @param rayOrigin - Point on sphere
          * @param rayDir - Normalized ray direction
          * @returns Diffuse RGB color
          */
        vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
          float perIteration = 1. / float(iterations);
          vec3 deltaRay = rayDir * perIteration * depth;

          // Start at point of intersection and accumulate volume
          vec3 p = rayOrigin;
          float totalVolume = 0.;

          for (int i=0; i<iterations; ++i) {
            // Read heightmap from spherical direction of displaced ray position
            vec3 displaced = displacePoint(p, displacement);
            vec2 uv = equirectUv(normalize(displaced));
            float heightMapVal = texture(heightMap, uv).r;

            // Take a slice of the heightmap
            float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
            float cutoff = 1. - float(i) * perIteration;
            float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

            // Accumulate the volume and advance the ray forward one step
            totalVolume += slice * perIteration;
            p += deltaRay;
          }
          return mix(colorA, colorB, totalVolume);
        }
      ` + match
    )

    shader.fragmentShader = shader.fragmentShader.replace(
      /vec4 diffuseColor.*;/,
      /* glsl */ `
      vec3 rayDir = normalize(v_dir);
      vec3 rayOrigin = v_pos;
      
      vec3 rgb = marchMarble(rayOrigin, rayDir);
      vec4 diffuseColor = vec4(rgb, 1.);      
      `
    )
  }

  return (
    <meshStandardMaterial
      ref={materialRef}
      {...props}
      onBeforeCompile={onBeforeCompile}
      // The following props allow React hot-reload to work with the onBeforeCompile argument
      onUpdate={(m) => (m.needsUpdate = true)}
      customProgramCacheKey={() => onBeforeCompile.toString()}
      roughness={0.1}
      metalness={0}
      envMapIntensity={1.0}
      side={THREE.DoubleSide}
      emissive={active ? colors.glow : "#333333"}
      emissiveIntensity={active ? 0.3 : 0.1}
    />
  )
}

/* ------------------ main crystal - using Magic Marble Material ------------------ */
function CrystalMesh({ active, colors, justActivated, colorTransition }) {
  const groupRef = useRef()
  
  // Animation state for bounce effect - translate up/down and scale
  const baseYRef = useRef(0) // Base Y position
  const bounceYRef = useRef(0) // Current bounce offset
  const bounceVelocityRef = useRef(0.0)
  const scaleRef = useRef(1.0)
  const lastJustActivatedRef = useRef(justActivated)
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // Detect when justActivated changes to trigger bounce on every transition
    if (justActivated && !lastJustActivatedRef.current) {
      // Transition detected - start bounce animation by jumping up
      bounceYRef.current = 0.15 // Start slightly above base
      bounceVelocityRef.current = 0.3 // Initial upward velocity
      scaleRef.current = 1.15 // Scale up when bouncing up
    }
    lastJustActivatedRef.current = justActivated

    // Bounce animation when transitioning - move up and down with scaling
    if (justActivated) {
      // Apply gravity and bounce physics
      bounceVelocityRef.current -= 2.0 * delta // Gravity
      bounceYRef.current += bounceVelocityRef.current * delta
      
      // Scale based on height - larger when higher, smaller when lower
      const normalizedHeight = Math.max(0, Math.min(1, bounceYRef.current / 0.3))
      scaleRef.current = 1.0 + normalizedHeight * 0.2 // Scale from 1.0 to 1.2 based on height
      
      // Bounce off ground (y = 0)
      if (bounceYRef.current <= 0) {
        bounceYRef.current = 0
        bounceVelocityRef.current *= -0.7 // Bounce back with damping
        scaleRef.current = 1.0 // Normal size when on ground
        if (Math.abs(bounceVelocityRef.current) < 0.05) {
          bounceVelocityRef.current = 0
          bounceYRef.current = 0
          scaleRef.current = 1.0
        }
      }
      
      // Cap maximum height
      if (bounceYRef.current >= 0.3) {
        bounceYRef.current = 0.3
        bounceVelocityRef.current *= -0.5
        scaleRef.current = 1.2 // Max scale at peak
      }
    } else {
      // Return to base position and normal scale when not transitioning
      bounceYRef.current = THREE.MathUtils.lerp(bounceYRef.current, 0, delta * 5.0)
      scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1.0, delta * 5.0)
      bounceVelocityRef.current = 0
    }

    // Apply Y translation and scale to group (bounces up off the stand with scaling)
    groupRef.current.position.y = baseYRef.current + bounceYRef.current
    groupRef.current.scale.setScalar(scaleRef.current)
  })
  
  return (
    <group ref={groupRef}>
      <mesh visible={true}>
        <sphereGeometry args={[1, 64, 32]} />
        <MagicMarbleMaterial active={active} colors={colors} colorTransition={colorTransition} />
      </mesh>
    </group>
  )
}

/* ------------------ wooden base ------------------ */
function WoodenBase({ active, colors }) {
  const mainMaterialRef = useRef()
  const topMaterialRef = useRef()
  const glowRingRef = useRef()

  useFrame(() => {
    if (!mainMaterialRef.current || !topMaterialRef.current || !glowRingRef.current) return

    // Simple glow that matches crystal state
    const glowColor = active ? colors.glow : colors.base
    const glowIntensity = active ? 0.08 : 0.02
    
    mainMaterialRef.current.emissive.set(glowColor)
    mainMaterialRef.current.emissiveIntensity = glowIntensity * 0.15
    topMaterialRef.current.emissive.set(glowColor)
    topMaterialRef.current.emissiveIntensity = glowIntensity * 0.25
    
    if (glowRingRef.current) {
      glowRingRef.current.opacity = active ? 0.2 : 0.02
      glowRingRef.current.emissive.set(glowColor)
      glowRingRef.current.emissiveIntensity = active ? 0.3 : 0.05
      glowRingRef.current.color.set(glowColor)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Bottom plate - wider for stability */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.06, 32]} />
        <meshPhysicalMaterial
          color="#3d2818"
          roughness={0.9}
          metalness={0.01}
          clearcoat={0.05}
          clearcoatRoughness={0.9}
        />
      </mesh>
      
      {/* Main wooden base - simple tapered cylinder */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.58, 0.52, 0.18, 32]} />
        <meshPhysicalMaterial
          ref={mainMaterialRef}
          color="#6b4423"
          roughness={0.88}
          metalness={0.03}
          clearcoat={0.12}
          clearcoatRoughness={0.75}
          emissive={colors.base}
          emissiveIntensity={0.02}
          envMapIntensity={0.4}
        />
      </mesh>
      
      {/* Top platform where crystal sits */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.1, 32]} />
        <meshPhysicalMaterial
          ref={topMaterialRef}
          color="#5a3a25"
          roughness={0.85}
          metalness={0.02}
          clearcoat={0.18}
          clearcoatRoughness={0.65}
          emissive={colors.base}
          emissiveIntensity={0.03}
          envMapIntensity={0.7}
        />
      </mesh>
      
      {/* Very subtle glow on top surface */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.49, 0.49, 0.01, 32]} />
        <meshStandardMaterial
          ref={glowRingRef}
          color={active ? colors.glow : colors.base}
          transparent
          opacity={active ? 0.15 : 0.02}
          emissive={active ? colors.glow : colors.base}
          emissiveIntensity={active ? 0.25 : 0.05}
        />
      </mesh>
    </group>
  )
}

/* ------------------ inner particles - swirling clouds ------------------ */
function InnerParticles({ active, colors, colorTransition }) {
  const pointsRef = useRef()
  const materialRef = useRef()
  const positionsRef = useRef()
  
  // Generate particle positions
  const positions = useMemo(() => {
    const count = 280
    const arr = new Float32Array(count * 3)
    // Use a seeded random generator function
    const createRandom = () => {
      let seed = 12345
      return () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
    }
    const random = createRandom()
    for (let i = 0; i < count; i += 1) {
      let x = 0
      let y = 0
      let z = 0
      do {
        x = random() * 2 - 1
        y = random() * 2 - 1
        z = random() * 2 - 1
      } while (x * x + y * y + z * z > 1)
      const radius = 0.7 + random() * 0.25 // Keep particles well inside the sphere (radius 1.0)
      arr[i * 3] = x * radius
      arr[i * 3 + 1] = y * radius
      arr[i * 3 + 2] = z * radius
    }
    return arr
  }, [])
  
  // Store positions in ref for animation
  useEffect(() => {
    positionsRef.current = positions
  }, [positions])
  
  useFrame(({ clock }) => {
    if (!pointsRef.current || !positionsRef.current) return
    const t = clock.getElapsedTime()
    
    // Smooth spinning rotation - like OrbShowcase example
    pointsRef.current.rotation.y = t * 0.16 // Smooth Y rotation
    pointsRef.current.rotation.x = Math.sin(t * 0.3) * 0.18 // Gentle X wobble
    
        // Update material color with smooth transition
        if (materialRef.current && colorTransition) {
          const { fromColor, toColor, progress } = colorTransition
          const currentColor = new THREE.Color()
          // Two-stage transition: first to black (0-0.5), then to target color (0.5-1.0)
          if (progress < 0.5) {
            // First half: transition from fromColor to black
            const blackProgress = progress * 2
            currentColor.lerpColors(fromColor, new THREE.Color(0, 0, 0), blackProgress)
          } else {
            // Second half: transition from black to toColor
            const colorProgress = (progress - 0.5) * 2
            currentColor.lerpColors(new THREE.Color(0, 0, 0), toColor, colorProgress)
          }
          materialRef.current.color.set(currentColor)
          
          if (active) {
            materialRef.current.opacity = 0.5 + progress * 0.2
          } else {
            materialRef.current.color.set("#aaaaaa") // Grey clouds when inactive
            materialRef.current.opacity = 0.8
          }
        } else if (materialRef.current) {
          if (active) {
            materialRef.current.color.set(colors.glow)
            materialRef.current.opacity = 0.5
          } else {
            materialRef.current.color.set("#aaaaaa") // Grey clouds when inactive
            materialRef.current.opacity = 0.8
          }
        }
  })
  
  // Don't render if not active
  if (!active && !colorTransition) {
    return null
  }
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          color={active ? colors.glow : "#aaaaaa"}
          size={active ? 0.03 : 0.05}
          transparent
          opacity={active ? 0.5 : 0.8}
          depthWrite={false}
          sizeAttenuation={true}
        />
    </points>
  )
}

