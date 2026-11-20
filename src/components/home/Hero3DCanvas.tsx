'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';
import { Sparkles, RefreshCw, Orbit, Layers, Box } from 'lucide-react';

type GeometryMode = 'knot' | 'polyhedron' | 'neural';

export function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [activeMode, setActiveMode] = useState<GeometryMode>('polyhedron');
  const [isHovered, setIsHovered] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const activeModeRef = useRef<GeometryMode>(activeMode);
  const isWireframeRef = useRef<boolean>(isWireframe);

  // Keep refs in sync for the Three.js loop
  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const isDark = resolvedTheme === 'dark';
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x1e293b : 0xf1f5f9,
      isDark ? 1.4 : 1.8
    );
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(
      isDark ? 0x10b981 : 0x059669, // Emerald
      isDark ? 28 : 22,
      50
    );
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(
      isDark ? 0x6366f1 : 0x4f46e5, // Indigo / Violet
      isDark ? 22 : 18,
      50
    );
    pointLight2.position.set(-5, -4, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(
      isDark ? 0xf59e0b : 0xd97706, // Amber
      isDark ? 16 : 14,
      50
    );
    pointLight3.position.set(0, 5, -3);
    scene.add(pointLight3);

    // --- Group Container ---
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- Geometries & Meshes ---
    // 1. Polyhedron Mode (Icosahedron + Inner Core)
    const polyGroup = new THREE.Group();
    
    // Outer Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const icoMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0f172a : 0xffffff,
      emissive: isDark ? 0x064e3b : 0xe0e7ff,
      emissiveIntensity: isDark ? 0.35 : 0.2,
      roughness: 0.12,
      metalness: 0.1,
      transmission: 0.75, // Glass effect
      thickness: 1.2,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    polyGroup.add(icoMesh);

    // Outer wireframe cage
    const wireGeo = new THREE.IcosahedronGeometry(1.85, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x34d399 : 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    polyGroup.add(wireMesh);

    // Inner glowing core (Octahedron)
    const coreGeo = new THREE.OctahedronGeometry(0.85, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xfbbf24 : 0xf59e0b,
      emissive: isDark ? 0xd97706 : 0xb45309,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    polyGroup.add(coreMesh);

    // Orbiting Golden Rings
    const ringGeo1 = new THREE.TorusGeometry(2.35, 0.02, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: isDark ? 0x38bdf8 : 0x0284c7,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    polyGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(2.55, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: isDark ? 0xfbbf24 : 0xd97706,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    ringMesh2.rotation.z = Math.PI / 6;
    polyGroup.add(ringMesh2);

    mainGroup.add(polyGroup);

    // 2. Torus Knot Mode (Topology)
    const knotGroup = new THREE.Group();
    const knotGeo = new THREE.TorusKnotGeometry(1.35, 0.42, 128, 32, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x1e1b4b : 0xe0e7ff,
      emissive: isDark ? 0x4338ca : 0x6366f1,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.2,
      transmission: 0.65,
      transparent: true,
      opacity: 0.9,
      wireframe: false,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotGroup.add(knotMesh);

    const knotWireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xa855f7 : 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const knotWireMesh = new THREE.Mesh(knotGeo, knotWireMat);
    knotWireMesh.scale.set(1.02, 1.02, 1.02);
    knotGroup.add(knotWireMesh);

    knotGroup.visible = false;
    mainGroup.add(knotGroup);

    // 3. Neural Lattice / Particles Mode
    const neuralGroup = new THREE.Group();
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(isDark ? 0x34d399 : 0x059669);
    const color2 = new THREE.Color(isDark ? 0x60a5fa : 0x2563eb);
    const color3 = new THREE.Color(isDark ? 0xfbbf24 : 0xd97706);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(1 - 2 * (i / particleCount));
      const theta = Math.PI * (1 + 5 ** 0.5) * i;
      const radius = 2.1 + (Math.random() - 0.5) * 0.5;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    neuralGroup.add(particleMesh);

    // Connected wireframe sphere in center
    const innerSphereGeo = new THREE.DodecahedronGeometry(1.4, 1);
    const innerSphereMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x10b981 : 0x047857,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerSphere = new THREE.Mesh(innerSphereGeo, innerSphereMat);
    neuralGroup.add(innerSphere);

    neuralGroup.visible = false;
    mainGroup.add(neuralGroup);

    // --- Floating Ambient Dust Particles ---
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 12;
      dustPositions[i + 1] = (Math.random() - 0.5) * 12;
      dustPositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.04,
      color: isDark ? 0x64748b : 0x94a3b8,
      transparent: true,
      opacity: 0.45,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // --- Interactive Mouse & Drag Tracking ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.6;
      mouseY = y * 0.6;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        mainGroup.rotation.y += deltaX * 0.01;
        mainGroup.rotation.x += deltaY * 0.01;
      }
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);

    // --- Resize Handler ---
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // --- Visibility / Intersection Observer for Performance ---
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Update visibility according to activeModeRef
      const currentMode = activeModeRef.current;
      polyGroup.visible = currentMode === 'polyhedron';
      knotGroup.visible = currentMode === 'knot';
      neuralGroup.visible = currentMode === 'neural';

      // Update wireframe according to isWireframeRef
      icoMat.wireframe = isWireframeRef.current;
      knotMat.wireframe = isWireframeRef.current;

      // Smooth inertia rotation
      if (!isDragging) {
        targetRotationY = mouseX * 0.8;
        targetRotationX = mouseY * 0.8;
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;

        // Continuous subtle rotational drift
        mainGroup.rotation.y += delta * 0.25;
        mainGroup.rotation.z = Math.sin(elapsedTime * 0.4) * 0.08;
      }

      // Internal piece animations
      coreMesh.rotation.y -= delta * 0.8;
      coreMesh.rotation.x += delta * 0.4;
      coreMesh.scale.setScalar(0.85 + Math.sin(elapsedTime * 2.5) * 0.06);

      ringMesh1.rotation.z += delta * 0.35;
      ringMesh2.rotation.z -= delta * 0.28;

      knotMesh.rotation.x += delta * 0.2;
      knotMesh.rotation.y += delta * 0.3;

      particleMesh.rotation.y += delta * 0.15;
      innerSphere.rotation.x -= delta * 0.2;

      // Ambient dust drift
      dustPoints.rotation.y += delta * 0.03;
      dustPoints.rotation.x += delta * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);

      // Clean Three.js resources
      [icoGeo, wireGeo, coreGeo, ringGeo1, ringGeo2, knotGeo, particleGeo, innerSphereGeo, dustGeo].forEach(
        (g) => g.dispose()
      );
      [icoMat, wireMat, coreMat, ringMat1, ringMat2, knotMat, knotWireMat, particleMat, innerSphereMat, dustMat].forEach(
        (m) => m.dispose()
      );
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [resolvedTheme]);

  return (
    <div 
      className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] rounded-3xl overflow-hidden border border-gray-200/80 dark:border-[#1E293B] bg-gradient-to-br from-white/80 via-gray-50/50 to-white/90 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0A0F1D] shadow-2xl backdrop-blur-md group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        title="Click & drag to rotate 3D math & code artifacts"
      />

      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#1E293B] shadow-sm text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-navy-950 dark:text-emerald-400">Classly_3D_Engine</span>
          <span className="text-gray-400 dark:text-slate-500">•</span>
          <span className="text-gray-500 dark:text-slate-400">WebGL 2.0</span>
        </div>

        {/* Wireframe toggle */}
        <button
          type="button"
          onClick={() => setIsWireframe((prev) => !prev)}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-[#111827]/90 hover:bg-white dark:hover:bg-[#1E293B] border border-gray-200/80 dark:border-[#1E293B] text-xs font-medium text-navy-900 dark:text-slate-200 shadow-sm transition active:scale-95"
          title="Toggle wireframe topology"
        >
          <Layers className="w-3.5 h-3.5 text-accent-500 dark:text-emerald-400" />
          <span className="hidden sm:inline">{isWireframe ? 'Solid Glass' : 'Wireframe'}</span>
        </button>
      </div>

      {/* Bottom Mode Switcher HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Geometry switcher pills */}
        <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border border-gray-200/80 dark:border-[#1E293B] shadow-sm">
          <button
            type="button"
            onClick={() => setActiveMode('polyhedron')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeMode === 'polyhedron'
                ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Polyhedron</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('knot')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeMode === 'knot'
                ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Topology Knot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('neural')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeMode === 'neural'
                ? 'bg-navy-950 text-white dark:bg-emerald-500 dark:text-navy-950 shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-navy-950 dark:hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Neural Lattice</span>
          </button>
        </div>

        {/* Drag Hint */}
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-400 dark:text-slate-500 bg-white/70 dark:bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-sm">
          <span>drag to inspect 360°</span>
        </div>
      </div>
    </div>
  );
}
