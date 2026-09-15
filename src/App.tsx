import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_TOUR } from './data/defaultTour';
import { TourData, Scene, Hotspot } from './types/tour';
import { PanoramaViewer } from './components/PanoramaViewer';
import { TheasysTopBar } from './components/TheasysTopBar';
import { ThumbnailCarousel } from './components/ThumbnailCarousel';
import { FloorPlanWidget } from './components/FloorPlanWidget';
import { EmbeddedVideoModal } from './components/EmbeddedVideoModal';
import { InfoCardModal } from './components/InfoCardModal';
import { TourInfoModal } from './components/TourInfoModal';
import { ShareEmbedModal } from './components/ShareEmbedModal';
import { TourEditorModal } from './components/TourEditorModal';
import { HotspotEditorModal } from './components/HotspotEditorModal';

const STORAGE_KEY = 'theasys_custom_360_tour_v1';

export default function App() {
  // Load saved custom tour from localStorage or use rich default
  const [tourData, setTourData] = useState<TourData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.scenes && parsed.scenes.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not load saved tour from localStorage:', e);
      }
    }
    return DEFAULT_TOUR;
  });

  // Save tourData changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tourData));
    } catch (e) {
      console.warn('Could not persist tour to localStorage:', e);
    }
  }, [tourData]);

  // Active scene
  const [currentSceneId, setCurrentSceneId] = useState<string>(
    tourData.scenes[0]?.id || 'scene-living'
  );

  // Viewer state
  const [cameraYaw, setCameraYaw] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(tourData.settings.autoRotate);
  const [showFloorPlan, setShowFloorPlan] = useState<boolean>(tourData.settings.showFloorPlan);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCarouselOpen, setIsCarouselOpen] = useState<boolean>(true);

  // Modals state
  const [activeVideoHotspot, setActiveVideoHotspot] = useState<Hotspot | null>(null);
  const [activeInfoHotspot, setActiveInfoHotspot] = useState<Hotspot | null>(null);
  const [isTourInfoOpen, setIsTourInfoOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  // Custom Studio / Editor state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isTourEditorOpen, setIsTourEditorOpen] = useState<boolean>(false);
  const [isPlacingHotspot, setIsPlacingHotspot] = useState<boolean>(false);
  const [editingHotspot, setEditingHotspot] = useState<Partial<Hotspot> | null>(null);
  const [isHotspotEditorOpen, setIsHotspotEditorOpen] = useState<boolean>(false);

  // Ambient audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (tourData.settings.ambientAudioUrl) {
      const audio = new Audio(tourData.settings.ambientAudioUrl);
      audio.loop = true;
      audio.volume = 0.25;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [tourData.settings.ambientAudioUrl]);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch((err) => {
          console.log('Audio autoplay blocked by browser policy:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Scene resolution
  const currentScene =
    tourData.scenes.find((s) => s.id === currentSceneId) || tourData.scenes[0];

  // Hotspot selection handler
  const handleSelectHotspot = (hotspot: Hotspot) => {
    if (hotspot.type === 'video') {
      setActiveVideoHotspot(hotspot);
    } else if (hotspot.type === 'info') {
      setActiveInfoHotspot(hotspot);
    } else if (hotspot.type === 'navigation' && hotspot.targetSceneId) {
      setCurrentSceneId(hotspot.targetSceneId);
    }
  };

  // Quick action: Open video tour presentation
  const handleOpenQuickVideoTour = () => {
    // Find any video hotspot in current scene, or in the whole tour
    const sceneVideo = currentScene.hotspots.find((h) => h.type === 'video');
    if (sceneVideo) {
      setActiveVideoHotspot(sceneVideo);
      return;
    }
    for (const scene of tourData.scenes) {
      const vid = scene.hotspots.find((h) => h.type === 'video');
      if (vid) {
        setActiveVideoHotspot(vid);
        return;
      }
    }
    // Fallback default sample video
    setActiveVideoHotspot({
      id: 'default-quick-vid',
      type: 'video',
      pitch: 0,
      yaw: 0,
      title: 'Villa Lumina Architectural Walkthrough',
      videoTitle: 'Villa Lumina: Concept, Materials & Light Walkthrough',
      videoUrl: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
      videoDuration: '3:45 min',
      description: 'Cinematic architectural walkthrough featuring the Malibu estate design and panoramic Pacific vistas.',
      badgeText: '4K CINEMATIC TOUR',
    });
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Hotspot placement in Studio Mode
  const handleHotspotPlaced = (pitch: number, yaw: number) => {
    setIsPlacingHotspot(false);
    setEditingHotspot({
      pitch,
      yaw,
      type: 'video',
      title: '',
      description: '',
    });
    setIsHotspotEditorOpen(true);
  };

  // Save Hotspot back to active scene
  const handleSaveHotspot = (newHotspot: Hotspot) => {
    const updatedScenes = tourData.scenes.map((scene) => {
      if (scene.id !== currentScene.id) return scene;

      const existingIndex = scene.hotspots.findIndex((h) => h.id === newHotspot.id);
      let newHotspots: Hotspot[];
      if (existingIndex >= 0) {
        newHotspots = [...scene.hotspots];
        newHotspots[existingIndex] = newHotspot;
      } else {
        newHotspots = [...scene.hotspots, newHotspot];
      }

      return {
        ...scene,
        hotspots: newHotspots,
      };
    });

    setTourData({
      ...tourData,
      scenes: updatedScenes,
    });
  };

  // Delete Hotspot
  const handleDeleteHotspot = (hotspotId: string) => {
    const updatedScenes = tourData.scenes.map((scene) => {
      if (scene.id !== currentScene.id) return scene;
      return {
        ...scene,
        hotspots: scene.hotspots.filter((h) => h.id !== hotspotId),
      };
    });
    setTourData({
      ...tourData,
      scenes: updatedScenes,
    });
  };

  // Reset to default tour
  const handleResetTour = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTourData(DEFAULT_TOUR);
    setCurrentSceneId(DEFAULT_TOUR.scenes[0].id);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans text-white select-none">
      {/* 360 WebGL Equirectangular Panorama Viewer */}
      <PanoramaViewer
        currentScene={currentScene}
        allScenes={tourData.scenes}
        autoRotate={autoRotate}
        autoRotateSpeed={tourData.settings.autoRotateSpeed}
        showHotspots={showHotspots}
        isEditMode={isEditMode}
        isPlacingHotspot={isPlacingHotspot}
        onHotspotPlaced={handleHotspotPlaced}
        onSelectHotspot={handleSelectHotspot}
        onNavigateScene={(sceneId) => setCurrentSceneId(sceneId)}
        onYawChange={setCameraYaw}
        onEditHotspot={(hs) => {
          setEditingHotspot(hs);
          setIsHotspotEditorOpen(true);
        }}
        onDeleteHotspot={handleDeleteHotspot}
      />

      {/* Theasys-style Top Control Bar */}
      <TheasysTopBar
        tourData={tourData}
        currentScene={currentScene}
        cameraYaw={cameraYaw}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        showFloorPlan={showFloorPlan}
        onToggleFloorPlan={() => setShowFloorPlan(!showFloorPlan)}
        showHotspots={showHotspots}
        onToggleHotspots={() => setShowHotspots(!showHotspots)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenTourInfo={() => setIsTourInfoOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        isEditMode={isEditMode}
        onToggleEditMode={() => {
          setIsEditMode(!isEditMode);
          if (!isEditMode) {
            setIsTourEditorOpen(true);
          }
        }}
        onOpenVideoTour={handleOpenQuickVideoTour}
      />

      {/* Interactive Floor Plan & Vision Radar Overlay */}
      <FloorPlanWidget
        scenes={tourData.scenes}
        currentSceneId={currentScene.id}
        cameraYaw={cameraYaw}
        onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
        isOpen={showFloorPlan}
        onToggle={() => setShowFloorPlan(false)}
      />

      {/* Floating Bottom Room Thumbnails Carousel */}
      <ThumbnailCarousel
        scenes={tourData.scenes}
        currentSceneId={currentScene.id}
        onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
        isOpen={isCarouselOpen}
        onToggle={() => setIsCarouselOpen(!isCarouselOpen)}
      />

      {/* Studio / Edit Mode Banner */}
      {isEditMode && !isPlacingHotspot && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-indigo-950/90 backdrop-blur-md border border-indigo-500/60 px-4 py-2 rounded-2xl shadow-2xl animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span className="text-xs font-semibold text-indigo-200">
            Tour Studio Active • Click any existing hotspot to edit
          </span>
          <button
            onClick={() => setIsTourEditorOpen(true)}
            className="ml-2 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Open Studio Menu
          </button>
        </div>
      )}

      {/* Embedded Video Player Modal */}
      <EmbeddedVideoModal
        hotspot={activeVideoHotspot}
        onClose={() => setActiveVideoHotspot(null)}
        sceneName={currentScene.name}
      />

      {/* Info Card Details Modal */}
      <InfoCardModal
        hotspot={activeInfoHotspot}
        onClose={() => setActiveInfoHotspot(null)}
        sceneName={currentScene.name}
      />

      {/* Tour Property Info & Architectural Specs Modal */}
      <TourInfoModal
        isOpen={isTourInfoOpen}
        onClose={() => setIsTourInfoOpen(false)}
        tourData={tourData}
      />

      {/* Share & iFrame Embed Modal */}
      <ShareEmbedModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        tourData={tourData}
      />

      {/* Virtual Tour Studio & Scene Manager Modal */}
      <TourEditorModal
        isOpen={isTourEditorOpen}
        onClose={() => setIsTourEditorOpen(false)}
        tourData={tourData}
        onUpdateTourData={setTourData}
        currentSceneId={currentScene.id}
        onSelectScene={(sceneId) => setCurrentSceneId(sceneId)}
        onStartHotspotPlacement={() => {
          setIsPlacingHotspot(true);
        }}
        onResetTour={handleResetTour}
      />

      {/* Hotspot Creator / Editor Modal */}
      <HotspotEditorModal
        isOpen={isHotspotEditorOpen}
        onClose={() => {
          setIsHotspotEditorOpen(false);
          setEditingHotspot(null);
        }}
        onSave={handleSaveHotspot}
        onDelete={handleDeleteHotspot}
        initialHotspot={editingHotspot || {}}
        scenes={tourData.scenes}
        currentSceneId={currentScene.id}
      />
    </div>
  );
}
