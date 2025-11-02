'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type SacredGeometryProps = {
  color: string;
  glow: string;
  variant: 'fire' | 'earth' | 'air' | 'water' | 'aether';
};

const variantShape: Record<SacredGeometryProps['variant'], 'merkabah' | 'cuboctahedron' | 'seedOfLife' | 'vectorEquilibrium' | 'vesicaPiscis'> = {
  fire: 'merkabah',
  earth: 'cuboctahedron',
  air: 'seedOfLife',
  water: 'vectorEquilibrium',
  aether: 'vesicaPiscis',
};

const rotationSpeeds: Record<SacredGeometryProps['variant'], THREE.Vector3> = {
  fire: new THREE.Vector3(0.011, 0.018, 0.006),
  earth: new THREE.Vector3(0.006, 0.01, 0.004),
  air: new THREE.Vector3(0.0005, 0.0005, 0.01),
  water: new THREE.Vector3(0.007, 0.011, 0.005),
  aether: new THREE.Vector3(0.0004, 0.0004, 0.009),
};

const visualSettings: Record<SacredGeometryProps['variant'], {
  minScale: number;
  maxScale: number;
  pulseAmplitude: number;
  edgeBaseOpacity: number;
  edgeOpacityRange: number;
}> = {
  fire:   { minScale: 0.72, maxScale: 1.48, pulseAmplitude: 0.14, edgeBaseOpacity: 0.32, edgeOpacityRange: 0.12 },
  earth:  { minScale: 0.6,  maxScale: 1.22, pulseAmplitude: 0.11, edgeBaseOpacity: 0.26, edgeOpacityRange: 0.09 },
  air:    { minScale: 0.54, maxScale: 1.08, pulseAmplitude: 0.08, edgeBaseOpacity: 0.24, edgeOpacityRange: 0.08 },
  water:  { minScale: 0.58, maxScale: 1.18, pulseAmplitude: 0.09, edgeBaseOpacity: 0.25, edgeOpacityRange: 0.08 },
  aether: { minScale: 0.64, maxScale: 1.3,  pulseAmplitude: 0.12, edgeBaseOpacity: 0.28, edgeOpacityRange: 0.1 },
};

function extractHex(color: string): string {
  if (color.startsWith('#')) return color;
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbaMatch) {
    const [, r, g, b] = rgbaMatch;
    return `#${[r, g, b]
      .map((value) => Number.parseInt(value, 10).toString(16).padStart(2, '0'))
      .join('')}`;
  }
  return '#ffffff';
}

type OutlineBuild = {
  group: THREE.Group;
  geometries: THREE.BufferGeometry[];
};

function createLineSegments(positions: number[], material: THREE.LineBasicMaterial): { segments: THREE.LineSegments; geometry: THREE.BufferGeometry } {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return { segments: new THREE.LineSegments(geometry, material), geometry };
}

function createCircleLoop(cx: number, cy: number, radius: number, segments: number, material: THREE.LineBasicMaterial, tilt = 0): { loop: THREE.LineLoop; geometry: THREE.BufferGeometry } {
  const points = new THREE.EllipseCurve(cx, cy, radius, radius, 0, Math.PI * 2).getPoints(segments);
  const vectorPoints = points.map((p) => new THREE.Vector3(p.x, p.y, 0));
  const geometry = new THREE.BufferGeometry().setFromPoints(vectorPoints);
  const loop = new THREE.LineLoop(geometry, material);
  loop.rotation.x = tilt;
  return { loop, geometry };
}

function buildMerkabah(material: THREE.LineBasicMaterial): OutlineBuild {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];

  const tetraA = new THREE.TetrahedronGeometry(3.8, 0);
  const edgesA = new THREE.EdgesGeometry(tetraA);
  tetraA.dispose();
  geometries.push(edgesA);
  group.add(new THREE.LineSegments(edgesA, material));

  const tetraB = new THREE.TetrahedronGeometry(3.8, 0);
  tetraB.applyMatrix4(new THREE.Matrix4().makeScale(-1, -1, -1));
  tetraB.rotateY(Math.PI / 2);
  tetraB.rotateX(Math.PI / 2);
  const edgesB = new THREE.EdgesGeometry(tetraB);
  tetraB.dispose();
  geometries.push(edgesB);
  group.add(new THREE.LineSegments(edgesB, material));

  return { group, geometries };
}

function buildCuboctahedron(material: THREE.LineBasicMaterial): OutlineBuild {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];

  const base = [
    [1, 1, 0],
    [1, -1, 0],
    [-1, 1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [-1, 0, 1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const scale = 2.6;
  const vertices = base.map((v) => v.multiplyScalar(scale));

  let edgeLength = Infinity;
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const dist = vertices[i].distanceTo(vertices[j]);
      if (dist > 0.0001 && dist < edgeLength) edgeLength = dist;
    }
  }

  const positions: number[] = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const dist = vertices[i].distanceTo(vertices[j]);
      if (Math.abs(dist - edgeLength) < 0.001) {
        positions.push(vertices[i].x, vertices[i].y, vertices[i].z, vertices[j].x, vertices[j].y, vertices[j].z);
      }
    }
  }

  const { segments, geometry } = createLineSegments(positions, material);
  geometries.push(geometry);
  group.add(segments);

  return { group, geometries };
}

function buildVectorEquilibrium(material: THREE.LineBasicMaterial): OutlineBuild {
  const { group, geometries } = buildCuboctahedron(material);

  const positions: number[] = [];
  const scale = 2.6;
  const base = [
    [1, 1, 0],
    [1, -1, 0],
    [-1, 1, 0],
    [-1, -1, 0],
    [1, 0, 1],
    [1, 0, -1],
    [-1, 0, 1],
    [-1, 0, -1],
    [0, 1, 1],
    [0, 1, -1],
    [0, -1, 1],
    [0, -1, -1],
  ].map(([x, y, z]) => new THREE.Vector3(x * scale, y * scale, z * scale));

  base.forEach((vertex) => {
    positions.push(0, 0, 0, vertex.x, vertex.y, vertex.z);
  });

  const { segments, geometry } = createLineSegments(positions, material);
  geometries.push(geometry);
  group.add(segments);

  return { group, geometries };
}

function buildSeedOfLife(material: THREE.LineBasicMaterial): OutlineBuild {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];

  const radius = 3.4;
  const segments = 128;
  const centers: Array<[number, number]> = [[0, 0]];

  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i;
    centers.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }

  centers.forEach(([cx, cy]) => {
    const { loop, geometry } = createCircleLoop(cx, cy, radius, segments, material);
    geometries.push(geometry);
    group.add(loop);
  });

  return { group, geometries };
}

function buildVesicaPiscis(material: THREE.LineBasicMaterial): OutlineBuild {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const radius = 3.8;
  const segments = 128;
  const offset = radius * 0.95;

  const left = createCircleLoop(-offset / 2, 0, radius, segments, material);
  left.loop.rotation.y = Math.PI / 12;
  const right = createCircleLoop(offset / 2, 0, radius, segments, material);
  right.loop.rotation.y = -Math.PI / 12;

  group.add(left.loop);
  group.add(right.loop);
  geometries.push(left.geometry, right.geometry);

  const vertical = createCircleLoop(0, 0, radius * 0.55, segments, material);
  vertical.loop.rotation.y = Math.PI / 2;
  vertical.loop.scale.set(0.6, 1, 1);
  group.add(vertical.loop);
  geometries.push(vertical.geometry);

  return { group, geometries };
}

function buildOutlineForVariant(variant: SacredGeometryProps['variant'], material: THREE.LineBasicMaterial): OutlineBuild {
  switch (variantShape[variant]) {
    case 'merkabah':
      return buildMerkabah(material);
    case 'cuboctahedron':
      return buildCuboctahedron(material);
    case 'seedOfLife':
      return buildSeedOfLife(material);
    case 'vectorEquilibrium':
      return buildVectorEquilibrium(material);
    case 'vesicaPiscis':
    default:
      return buildVesicaPiscis(material);
  }
}

export default function SacredGeometry({ color, glow, variant }: SacredGeometryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const settings = visualSettings[variant];

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const mainColor = new THREE.Color(extractHex(color));
    const glowColor = new THREE.Color(extractHex(glow));

    const ambient = new THREE.AmbientLight(mainColor, 0.55);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(glowColor, 1.0, 40, 2);
    pointLight.position.set(0, 0, 12);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(mainColor, 0.8, 60, 2);
    rimLight.position.set(-6, 8, -10);
    scene.add(rimLight);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: mainColor,
      transparent: true,
      opacity: settings.edgeBaseOpacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });

    const { group: outlineGroup, geometries: outlineGeometries } = buildOutlineForVariant(variant, lineMaterial);
    scene.add(outlineGroup);

    const clock = new THREE.Clock();
    const spin = rotationSpeeds[variant];

    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const reveal = Math.min(elapsed / 2.4, 1);

      outlineGroup.rotation.x += spin.x;
      outlineGroup.rotation.y += spin.y;
      outlineGroup.rotation.z += spin.z;

      const revealScale = THREE.MathUtils.lerp(settings.minScale, settings.maxScale, reveal);
      const pulse = 1 + settings.pulseAmplitude * Math.sin(elapsed * 0.9);
      const orbScale = revealScale * pulse;
      outlineGroup.scale.setScalar(orbScale);

      const edgeOscillation = settings.edgeBaseOpacity + settings.edgeOpacityRange * Math.sin(elapsed * 1.6 + 0.8);
      lineMaterial.opacity = THREE.MathUtils.clamp(edgeOscillation * reveal, settings.edgeBaseOpacity * 0.6, settings.edgeBaseOpacity + settings.edgeOpacityRange);

      pointLight.intensity = 0.85 + 0.25 * Math.sin(elapsed * 1.5);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 1;
      const newHeight = container.clientHeight || 1;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', handleResize);

      container.removeChild(renderer.domElement);
      renderer.dispose();

      scene.remove(outlineGroup);
      outlineGeometries.forEach((geometry) => geometry.dispose());
      lineMaterial.dispose();
    };
  }, [color, glow, variant]);

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0" />;
}
