import React, { useState } from 'react';
import { Map, ChevronDown, ChevronUp, Layers, Compass, Maximize2, Minimize2 } from 'lucide-react';
import { Scene } from '../types/tour';

interface FloorPlanWidgetProps {
  scenes: Scene[];
  currentSceneId: string;
  cameraYaw: number; // in degrees
  onSelectScene: (sceneId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const FloorPlanWidget: React.FC<FloorPlanWidgetProps> = ({
  scenes,
  currentSceneId,
  cameraYaw,
  onSelectScene,
  isOpen,
  onToggle,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [isExpanded, setIsExpanded] = useState(false);

  const currentScene = scenes.find((s) => s.id === currentSceneId) || scenes[0];

  if (!isOpen) return null;

  return (
    <div
      id="floor-plan-widget"
      className={`fixed top-16 right-4 z-30 transition-all duration-300 ease-out select-none ${
        isExpanded ? 'w-84 sm:w-96' : 'w-64 sm:w-72'
      }`}
    >
      <div className="bg-neutral-950/90 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-3.5 py-2.5 bg-neutral-900/80 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Floor Plan & Radar
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title={isExpanded ? 'Shrink plan' : 'Expand plan'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggle}
              className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Close floor plan"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2D Interactive Map Container */}
        <div className="relative w-full aspect-square bg-neutral-900/90 p-3 overflow-hidden">
          {/* Architectural floor plan vector grid background */}
          <div className="absolute inset-0 opacity-25">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6b7280" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Architectural room outlines */}
          <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none stroke-neutral-700" fill="none">
            {/* Main villa perimeter */}
            <polygon
              points="30,40 180,40 220,100 220,200 40,200 30,120"
              strokeWidth="2"
              className="stroke-neutral-600"
              fill="rgba(30, 41, 59, 0.4)"
            />
            {/* Interior dividing walls */}
            <line x1="120" y1="40" x2="120" y2="150" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="40" y1="120" x2="180" y2="120" strokeWidth="1.5" />
            {/* Terrace deck area */}
            <rect x="40" y="160" width="160" height="40" strokeWidth="1.5" stroke="#0284c7" strokeDasharray="4 2" fill="rgba(2, 132, 199, 0.1)" />
          </svg>

          {/* Compass rose in top-left */}
          <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] text-neutral-400 font-mono bg-neutral-900/80 px-1.5 py-0.5 rounded border border-neutral-800">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>N 0°</span>
          </div>

          {/* Room pins and dynamic Radar FOV cone */}
          {scenes.map((scene) => {
            const isActive = scene.id === currentSceneId;
            const x = scene.floorPlanCoords?.x ?? 50;
            const y = scene.floorPlanCoords?.y ?? 50;

            return (
              <div
                key={scene.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => onSelectScene(scene.id)}
              >
                {/* Dynamic Radar Vision Cone (Theasys-style) only on active room */}
                {isActive && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${cameraYaw}deg)`,
                      width: '120px',
                      height: '120px',
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                    >
                      {/* 60-degree radar vision beam */}
                      <path
                        d="M 50 50 L 25 0 A 55 55 0 0 1 75 0 Z"
                        fill="url(#radarGradient)"
                        opacity="0.65"
                      />
                      <defs>
                        <linearGradient id="radarGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}

                {/* Pin marker */}
                <div className="relative flex items-center justify-center">
                  {isActive && (
                    <span className="absolute w-6 h-6 rounded-full bg-emerald-500/40 animate-ping" />
                  )}
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 flex items-center justify-center shadow-lg ${
                      isActive
                        ? 'bg-emerald-500 border-white ring-2 ring-emerald-400/50'
                        : 'bg-neutral-800 border-neutral-400 group-hover:bg-neutral-600'
                    }`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Floating room label on hover or if active */}
                <div
                  className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide pointer-events-none transition-opacity duration-150 z-20 ${
                    isActive
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 opacity-100'
                      : 'bg-neutral-950/90 text-neutral-300 border border-neutral-800 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {scene.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-3.5 py-2 bg-neutral-950 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="truncate">
            Viewing: <strong className="text-white">{currentScene.name}</strong>
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            {Math.round(cameraYaw)}°
          </span>
        </div>
      </div>
    </div>
  );
};
