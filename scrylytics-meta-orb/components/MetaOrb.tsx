"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import { OrbitControls, MeshTransmissionMaterial } from "@react-three/drei";

import { useEffect, useState, useRef } from "react";

import * as THREE from "three";

interface ClassDataItem {
  class: string;
  popularity: number;
  color: string;
}

// Animated rune component
function AnimatedRune({ r, i }: { r: { r: number; a: number; y: number; s: number }; i: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const timeRef = useRef(0);
  const duration = 3 + Math.random() * 2;

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    timeRef.current += delta;
    const t = (timeRef.current % duration) / duration;
    
    // Animate scale: [r.s, r.s * 1.3, r.s]
    const scaleCycle = Math.sin(t * Math.PI * 2);
    const scale = r.s + (r.s * 0.3) * (scaleCycle + 1) / 2;
    meshRef.current.scale.setScalar(scale);
    
    // Animate opacity: [0.2, 1, 0.2]
    const opacity = 0.2 + 0.8 * (scaleCycle + 1) / 2;
    materialRef.current.opacity = opacity;
  });

  return (
    <mesh
      ref={meshRef}
      position={[Math.cos(r.a) * r.r, r.y, Math.sin(r.a) * r.r]}
    >
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#88f" 
        emissive="#44f" 
        emissiveIntensity={1.5}
        transparent
      />
    </mesh>
  );
}

// Hoverable torus component
function HoverableTorus({ cls, start, angle, onSelect }: { cls: ClassDataItem; start: number; angle: number; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[Math.PI / 2, start, 0]}
      onClick={onSelect}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <torusGeometry args={[2.2, 0.07, 16, 100, angle]} />
      <meshStandardMaterial color={cls.color} emissive={cls.color} emissiveIntensity={0.4} />
    </mesh>
  );
}

export default function MetaOrb({ data }: { data: any[] }) {

  const [selected, setSelected] = useState<ClassDataItem | null>(null);

  const [runes, setRunes] = useState<Array<{ r: number; a: number; y: number; s: number }>>([]);

  useEffect(() => {

    const arr = Array.from({ length: 30 }, () => ({

      r: 2 + Math.random(),

      a: Math.random() * Math.PI * 2,

      y: (Math.random() - 0.5) * 2,

      s: 0.4 + Math.random() * 0.4,

    }));

    setRunes(arr);

  }, []);

  const classData: ClassDataItem[] = Object.values(

    data.reduce((a: Record<string, ClassDataItem>, d: any) => {

      if (!a[d.class]) {
        a[d.class] = { class: d.class, popularity: 0, color: `hsl(${Math.random()*360},70%,60%)` };
      }

      a[d.class].popularity += d.popularity || 0;

      return a;

    }, {})

  );

  return (

    <Canvas camera={{ position: [3.5, 1.5, 4], fov: 45 }}>

      <ambientLight intensity={0.6} />

      <pointLight position={[5, 5, 5]} intensity={1.2} />

      <group rotation={[0.2, 0.4, 0]}>

        <mesh>

          <sphereGeometry args={[1.5, 64, 64]} />

          <MeshTransmissionMaterial thickness={0.25} chromaticAberration={0.05} anisotropy={0.1} transmission={1} color={selected?.color || "#9bf"} />

        </mesh>

        {classData.map((cls, i) => {

          const start = classData.slice(0, i).reduce((s: number, c: ClassDataItem) => s + c.popularity, 0);

          const angle = cls.popularity * Math.PI * 2;

          return (

            <HoverableTorus 
              key={cls.class}
              cls={cls}
              start={start}
              angle={angle}
              onSelect={() => setSelected(cls)}
            />

          );

        })}

        {runes.map((r, i) => (

          <AnimatedRune key={i} r={r} i={i} />

        ))}

      </group>

      <OrbitControls enableZoom={false} />

    </Canvas>

  );

}

