import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Hotspot, Scene } from '../types/tour';
import { sphericalToCartesian, cartesianToSpherical, generateProceduralEquirectangular } from '../utils/panoramaHelper';
import { FALLBACK_PANORAMAS } from '../data/defaultTour';
import { HotspotMarker } from './HotspotMarker';
import { Crosshair } from 'lucide-react';

interface PanoramaViewerProps {
  currentScene: Scene;
  allScenes: Scene[];
  autoRotate: boolean;
  autoRotateSpeed: number;
  showHotspots: boolean;
  isEditMode: boolean;
  isPlacingHotspot: boolean;
  onHotspotPlaced: (pitch: number, yaw: number) => void;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onNavigateScene: (sceneId: string) => void;
  onYawChange: (yaw: number) => void;
  onEditHotspot?: (hotspot: Hotspot) => void;
  onDeleteHotspot?: (hotspotId: string) => void;
}

export const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  currentScene,
  allScenes,
  autoRotate,
  autoRotateSpeed,
  showHotspots,
  isEditMode,
  isPlacingHotspot,
  onHotspotPlaced,
  onSelectHotspot,
  onNavigateScene,
  onYawChange,
  onEditHotspot,
  onDeleteHotspot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hotspot screen positions map: [hotspotId]: { x, y, visible }
  const [projectedHotspots, setProjectedHotspots] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());

  // Interaction tracking
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const orientationRef = useRef({
    pitch: currentScene.initialPitch || 0,
    yaw: currentScene.initialYaw || 0,
    targetPitch: currentScene.initialPitch || 0,
    targetYaw: currentScene.initialYaw || 0,
    fov: currentScene.initialFov || 75,
    targetFov: currentScene.initialFov || 75,
  });

  const lastUserInteractionTimeRef = useRef(Date.now());
  const animationFrameIdRef = useRef<number | null>(null);
  const currentSceneIdRef = useRef(currentScene.id);
  currentSceneIdRef.current = currentScene.id;

  // Track textures cache
  const textureLoaderRef = useRef<THREE.TextureLoader>(new THREE.TextureLoader());
  const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());

  // Helper to load texture with failsafe fallback
  const loadSceneTexture = useCallback((scene: Scene, onLoaded: (tex: THREE.Texture) => void) => {
    const cached = textureCacheRef.current.get(scene.id);
    if (cached) {
      onLoaded(cached);
      return;
    }

    const fallbackUrl = FALLBACK_PANORAMAS[scene.id] || generateProceduralEquirectangular('living');

    textureLoaderRef.current.load(
      scene.imageUrl,
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        textureCacheRef.current.set(scene.id, tex);
        onLoaded(tex);
      },
      undefined,
      (err) => {
        console.warn(`Could not load primary 360 texture for ${scene.name}, using procedural fallback:`, err);
        // Load fallback procedural texture
        textureLoaderRef.current.load(fallbackUrl, (fallbackTex) => {
          fallbackTex.mapping = THREE.EquirectangularReflectionMapping;
          fallbackTex.colorSpace = THREE.SRGBColorSpace;
          fallbackTex.minFilter = THREE.LinearFilter;
          fallbackTex.generateMipmaps = false;
          textureCacheRef.current.set(scene.id, fallbackTex);
          onLoaded(fallbackTex);
        });
      }
    );
  }, []);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Three.js Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(orientationRef.current.fov, width / height, 1, 1100);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // Inverted sphere for 360 equirectangular projection
    const geometry = new THREE.SphereGeometry(500, 64, 32);
    // Invert geometry so faces point inward
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();
    const sphereMesh = new THREE.Mesh(geometry, material);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Initial texture load
    loadSceneTexture(currentScene, (tex) => {
      material.map = tex;
      material.needsUpdate = true;
    });

    // ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  // Update texture when currentScene changes
  useEffect(() => {
    if (!sphereMeshRef.current) return;

    // Reset orientation smoothly to scene initial angles
    orientationRef.current.targetPitch = currentScene.initialPitch ?? 0;
    orientationRef.current.targetYaw = currentScene.initialYaw ?? 0;
    if (currentScene.initialFov) {
      orientationRef.current.targetFov = currentScene.initialFov;
    }

    const material = sphereMeshRef.current.material as THREE.MeshBasicMaterial;

    loadSceneTexture(currentScene, (tex) => {
      if (material) {
        material.map = tex;
        material.needsUpdate = true;
      }
    });
  }, [currentScene.id, loadSceneTexture]);

  // Main Animation & Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const orient = orientationRef.current;
      const now = Date.now();

      // Auto-rotation (if enabled and user hasn't touched the screen in 2.5s)
      if (autoRotate && !isPointerDownRef.current && now - lastUserInteractionTimeRef.current > 2500) {
        orient.targetYaw += autoRotateSpeed * delta * 20;
      }

      // Smooth inertia / damping interpolation
      const damping = 0.12;
      orient.pitch += (orient.targetPitch - orient.pitch) * damping;
      orient.yaw += (orient.targetYaw - orient.yaw) * damping;
      orient.fov += (orient.targetFov - orient.fov) * damping;

      // Clamp pitch to avoid gimbal lock (-85 to +85)
      orient.pitch = Math.max(-85, Math.min(85, orient.pitch));
      orient.targetPitch = Math.max(-85, Math.min(85, orient.targetPitch));

      // Wrap-around yaw
      while (orient.yaw < -180) orient.yaw += 360;
      while (orient.yaw > 180) orient.yaw -= 360;
      while (orient.targetYaw < -180) orient.targetYaw += 360;
      while (orient.targetYaw > 180) orient.targetYaw -= 360;

      // Report heading yaw to parent for Floor Plan & Compass sync
      onYawChange(orient.yaw);

      // Update camera FOV & lookAt
      if (cameraRef.current && sceneRef.current && rendererRef.current) {
        const camera = cameraRef.current;
        if (Math.abs(camera.fov - orient.fov) > 0.01) {
          camera.fov = orient.fov;
          camera.updateProjectionMatrix();
        }

        const phi = THREE.MathUtils.degToRad(90 - orient.pitch);
        const theta = THREE.MathUtils.degToRad(orient.yaw + 180);

        const targetX = 500 * Math.sin(phi) * Math.cos(theta);
        const targetY = 500 * Math.cos(phi);
        const targetZ = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(targetX, targetY, targetZ);
        rendererRef.current.render(sceneRef.current, camera);

        // Project 3D Hotspots into 2D Screen Space
        if (containerRef.current && currentScene.hotspots) {
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;

          const updatedPos: Record<string, { x: number; y: number; visible: boolean }> = {};

          currentScene.hotspots.forEach((hs) => {
            const pos3D = sphericalToCartesian(hs.pitch, hs.yaw, 450);
            // Project to normalized device coordinates (-1 to 1)
            const projected = pos3D.clone().project(camera);

            // Check if point is in front of the camera
            const isBehind = projected.z > 1;

            const screenX = (projected.x * 0.5 + 0.5) * containerWidth;
            const screenY = (-projected.y * 0.5 + 0.5) * containerHeight;

            updatedPos[hs.id] = {
              x: screenX,
              y: screenY,
              visible: !isBehind && screenX >= -50 && screenX <= containerWidth + 50 && screenY >= -50 && screenY <= containerHeight + 50,
            };
          });

          setProjectedHotspots(updatedPos);
        }
      }
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [autoRotate, autoRotateSpeed, currentScene, onYawChange]);

  // Pointer event handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    lastUserInteractionTimeRef.current = Date.now();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;

    const deltaX = e.clientX - pointerStartRef.current.x;
    const deltaY = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };

    lastUserInteractionTimeRef.current = Date.now();

    // Sensitivity factor scales inversely with FOV for consistent feel when zoomed in
    const sensitivity = 0.15 * (orientationRef.current.fov / 75);

    orientationRef.current.targetYaw -= deltaX * sensitivity;
    orientationRef.current.targetPitch += deltaY * sensitivity;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDownRef.current = false;

    // Check if click was in "placing hotspot" mode
    if (isPlacingHotspot && containerRef.current && cameraRef.current && sphereMeshRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(clickX, clickY), cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(sphereMeshRef.current);

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        const coords = cartesianToSpherical(hitPoint);
        onHotspotPlaced(coords.pitch, coords.yaw);
      }
    }
  };

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    lastUserInteractionTimeRef.current = Date.now();

    const zoomStep = e.deltaY * 0.05;
    const newFov = Math.max(30, Math.min(95, orientationRef.current.targetFov + zoomStep));
    orientationRef.current.targetFov = newFov;
  };

  return (
    <div
      ref={containerRef}
      id="panorama-360-container"
      className={`relative w-full h-full overflow-hidden bg-black select-none touch-none ${
        isPlacingHotspot ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Three.js WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Crosshair indicator if in hotspot placing mode */}
      {isPlacingHotspot && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30">
          <div className="px-4 py-2 rounded-2xl bg-indigo-950/90 text-indigo-200 border border-indigo-500 shadow-2xl text-xs font-semibold flex items-center gap-2 mb-6 animate-bounce">
            <Crosshair className="w-4 h-4 text-indigo-400" />
            <span>Click anywhere on the 360° sphere to place hotspot</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-indigo-400/50 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-indigo-400" />
          </div>
        </div>
      )}

      {/* Interactive 3D Hotspot Overlays */}
      {showHotspots &&
        currentScene.hotspots &&
        currentScene.hotspots.map((hs) => {
          const screenPos = projectedHotspots[hs.id] || { x: -1000, y: -1000, visible: false };
          const targetScene = hs.targetSceneId ? allScenes.find((s) => s.id === hs.targetSceneId) : undefined;

          return (
            <HotspotMarker
              key={hs.id}
              hotspot={hs}
              screenPos={screenPos}
              onSelect={onSelectHotspot}
              onNavigate={onNavigateScene}
              targetScene={targetScene}
              isEditMode={isEditMode}
              onEdit={onEditHotspot}
              onDelete={onDeleteHotspot}
            />
          );
        })}
    </div>
  );
};
