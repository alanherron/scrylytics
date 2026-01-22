"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh, Points } from "three";

const InnerParticles = ({ color = "#9fb7ff" }: { color?: string }) => {
  const pointsRef = useRef<Points>(null);
  const positions = useMemo(() => {
    const count = 280;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      let x = 0;
      let y = 0;
      let z = 0;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
      } while (x * x + y * y + z * z > 1);
      const radius = 1.05;
      arr[i * 3] = x * radius;
      arr[i * 3 + 1] = y * radius;
      arr[i * 3 + 2] = z * radius;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.16;
    pointsRef.current.rotation.x = Math.sin(t * 0.3) * 0.18;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.045} transparent opacity={0.5} depthWrite={false} />
    </points>
  );
};

const SacredGeometry = () => {
  const icosaRef = useRef<Mesh>(null);
  const dodecaRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (icosaRef.current) {
      icosaRef.current.rotation.x = t * 0.25;
      icosaRef.current.rotation.y = t * 0.28;
    }
    if (dodecaRef.current) {
      dodecaRef.current.rotation.x = -t * 0.18;
      dodecaRef.current.rotation.y = t * 0.22;
      dodecaRef.current.rotation.z = Math.sin(t * 0.4) * 0.35;
    }
  });

  return (
    <group>
      <mesh ref={icosaRef}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#bfd2ff"
          transparent
          opacity={0.15}
          metalness={0.2}
          roughness={0.3}
          emissive="#99b8ff"
          emissiveIntensity={0.2}
          wireframe
        />
      </mesh>

      <mesh ref={dodecaRef}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color="#ffe3b3"
          transparent
          opacity={0.25}
          metalness={0.1}
          roughness={0.2}
          emissive="#ffcf99"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>

      <mesh>
        <torusGeometry args={[0.95, 0.02, 16, 128]} />
        <meshBasicMaterial color="#8fb5ff" transparent opacity={0.4} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.65, 0.018, 16, 128]} />
        <meshBasicMaterial color="#f2c572" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default function OrbShowcase() {
  return (
    <div className="h-[70vh] w-full">
      <Canvas camera={{ position: [2.8, 1.8, 3.2], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={["#02040f"]} />

        <hemisphereLight intensity={0.65} groundColor="#0d1225" color="#3e5bff" />
        <pointLight position={[0, 2.5, 2.5]} intensity={1.35} color="#9db7ff" />
        <spotLight
          position={[-1, 4, -2]}
          angle={0.6}
          penumbra={0.4}
          intensity={1.25}
          color="#ffb65c"
          castShadow
        />

        <group position={[0, 0.35, 0]}>
          <mesh>
            <sphereGeometry args={[1.5, 128, 128]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={1}
              thickness={0.3}
              roughness={0}
              envMapIntensity={0}
              clearcoat={0}
              clearcoatRoughness={0}
              reflectivity={0}
              iridescence={0}
              attenuationDistance={1}
              attenuationColor="#ffffff"
              opacity={0.1}
              transparent
            />
          </mesh>

          <InnerParticles color="#9bc0ff" />
          <SacredGeometry />
          <Sparkles count={60} speed={0.4} size={4} scale={[1.8, 1.8, 1.8]} color="#9bc0ff" opacity={0.35} />
        </group>

        <mesh position={[0, -1.25, 0]}>
          <cylinderGeometry args={[2.1, 2.4, 0.5, 120]} />
          <meshStandardMaterial color="#080a18" metalness={0.6} roughness={0.5} />
        </mesh>
        <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.6} target={[0, 0.35, 0]} />
      </Canvas>
    </div>
  );
}
