import React, { useState } from 'react';
import { 
  Compass, 
  RotateCw, 
  Map, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Share2, 
  Info, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Wrench, 
  Glasses,
  Play
} from 'lucide-react';
import { TourData, Scene } from '../types/tour';

interface TheasysTopBarProps {
  tourData: TourData;
  currentScene: Scene;
  cameraYaw: number;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  showFloorPlan: boolean;
  onToggleFloorPlan: () => void;
  showHotspots: boolean;
  onToggleHotspots: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenTourInfo: () => void;
  onOpenShareModal: () => void;
  onSelectScene: (sceneId: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenVideoTour?: () => void;
}

export const TheasysTopBar: React.FC<TheasysTopBarProps> = ({
  tourData,
  currentScene,
  cameraYaw,
  autoRotate,
  onToggleAutoRotate,
  showFloorPlan,
  onToggleFloorPlan,
  showHotspots,
  onToggleHotspots,
  soundEnabled,
  onToggleSound,
  onOpenTourInfo,
  onOpenShareModal,
  onSelectScene,
  isFullscreen,
  onToggleFullscreen,
  isEditMode,
  onToggleEditMode,
  onOpenVideoTour,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Compass degrees: normalized 0-360
  const normalizedYaw = ((Math.round(cameraYaw) % 360) + 360) % 360;
  const getCardinalDirection = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5) return 'N';
    if (deg >= 22.5 && deg < 67.5) return 'NE';
    if (deg >= 67.5 && deg < 112.5) return 'E';
    if (deg >= 112.5 && deg < 157.5) return 'SE';
    if (deg >= 157.5 && deg < 202.5) return 'S';
    if (deg >= 202.5 && deg < 247.5) return 'SW';
    if (deg >= 247.5 && deg < 292.5) return 'W';
    return 'NW';
  };

  const currentIndex = tourData.scenes.findIndex((s) => s.id === currentScene.id);
  const formattedIndex = (currentIndex + 1).toString().padStart(2, '0');
  const totalCount = tourData.scenes.length.toString().padStart(2, '0');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Tour Title & Room Selector Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Main Title Badge */}
          <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 rounded-2xl px-3 sm:px-4 py-2 shadow-2xl flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-bold text-xs shadow-md">
              360°
            </div>
            <div className="max-w-44 sm:max-w-72">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate leading-tight flex items-center gap-1.5">
                {tourData.title}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </h1>
              <p className="text-[10px] text-neutral-400 truncate">
                {tourData.subtitle || tourData.propertySpecs.address}
              </p>
            </div>
          </div>

          {/* Room quick switcher dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="room-selector-btn"
              className="bg-neutral-950/85 hover:bg-neutral-900 backdrop-blur-md border border-neutral-800/80 rounded-2xl px-3 py-2 text-xs font-semibold text-neutral-200 hover:text-white shadow-2xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <span className="font-mono text-emerald-400 text-[11px]">
                {formattedIndex}/{totalCount}
              </span>
              <span className="hidden sm:inline truncate max-w-40">
                {currentScene.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute top-12 left-0 w-64 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in max-h-80 overflow-y-auto">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 mb-1">
                  Select Room
                </div>
                {tourData.scenes.map((scene, idx) => {
                  const isSelected = scene.id === currentScene.id;
                  return (
                    <button
                      key={scene.id}
                      onClick={() => {
                        onSelectScene(scene.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                          : 'text-neutral-300 hover:bg-neutral-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] text-neutral-400">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="truncate">{scene.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theasys Control Icons Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-950/85 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-1.5 shadow-2xl pointer-events-auto">
          {/* Video Highlight Quick Button */}
          {onOpenVideoTour && (
            <button
              onClick={onOpenVideoTour}
              id="quick-video-tour-btn"
              className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Watch Video Presentation"
            >
              <Play className="w-3.5 h-3.5 fill-rose-400" />
              <span className="hidden md:inline">Video Tour</span>
            </button>
          )}

          {/* Auto Rotate */}
          <button
            onClick={onToggleAutoRotate}
            id="toggle-autorotate-btn"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              autoRotate
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
            }`}
            title={autoRotate ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '10s' }} />
          </button>

          {/* Compass readout */}
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-300 font-mono"
            title={`Compass Bearing: ${normalizedYaw}° (${getCardinalDirection(normalizedYaw)})`}
          >
            <Compass
              className="w-3.5 h-3.5 text-sky-400 transition-transform duration-100"
              style={{ transform: `rotate(${-cameraYaw}deg)` }}
            />
            <span>{getCardinalDirection(normalizedYaw)} {normalizedYaw}°</span>
          </div>

          {/* Floor Plan Toggle */}
          <button
            onClick={onToggleFloorPlan}
            id="toggle-floorplan-btn"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showFloorPlan
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
            }`}
            title={showFloorPlan ? 'Hide Floor Plan' : 'Show Floor Plan & Radar'}
          >
            <Map className="w-4 h-4" />
          </button>

          {/* Hotspots visibility toggle */}
          <button
            onClick={onToggleHotspots}
            id="toggle-hotspots-btn"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showHotspots
                ? 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-800'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
            title={showHotspots ? 'Hide Interactive Hotspots' : 'Show Hotspots'}
          >
            {showHotspots ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Ambient Sound toggle */}
          <button
            onClick={onToggleSound}
            id="toggle-sound-btn"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border-neutral-800'
            }`}
            title={soundEnabled ? 'Mute Ambient Audio' : 'Play Ambient Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Property Info Modal */}
          <button
            onClick={onOpenTourInfo}
            id="open-tour-info-btn"
            className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Property Specifications & Agent Info"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Share & Embed Modal */}
          <button
            onClick={onOpenShareModal}
            id="open-share-modal-btn"
            className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            title="Share & Embed Tour"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-neutral-800 mx-0.5" />

          {/* Custom Tour Studio / Edit Mode Toggle Button */}
          <button
            onClick={onToggleEditMode}
            id="toggle-editor-btn"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isEditMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/50'
            }`}
            title="Customize 360 Tour, Add Hotspots & Embedded Videos"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">{isEditMode ? 'Exit Studio' : 'Custom Tour Studio'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            id="toggle-fullscreen-btn"
            className="p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer hidden md:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
