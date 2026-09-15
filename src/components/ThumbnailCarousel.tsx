import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Layers, Eye } from 'lucide-react';
import { Scene } from '../types/tour';

interface ThumbnailCarouselProps {
  scenes: Scene[];
  currentSceneId: string;
  onSelectScene: (sceneId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ThumbnailCarousel: React.FC<ThumbnailCarouselProps> = ({
  scenes,
  currentSceneId,
  onSelectScene,
  isOpen,
  onToggle,
}) => {
  const currentIndex = scenes.findIndex((s) => s.id === currentSceneId);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + scenes.length) % scenes.length;
    onSelectScene(scenes[prevIndex].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % scenes.length;
    onSelectScene(scenes[nextIndex].id);
  };

  return (
    <div
      id="bottom-carousel-container"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none flex flex-col items-center max-w-[95vw]"
    >
      {/* Drawer Toggle Handle */}
      <button
        onClick={onToggle}
        id="toggle-carousel-btn"
        className="mb-1.5 px-3 py-1 rounded-full bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/80 shadow-lg backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
        aria-label="Toggle scenes carousel"
      >
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        <span>{scenes.length} Scenes</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Carousel Body */}
      {isOpen && (
        <div className="relative bg-neutral-950/85 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex items-center gap-2 max-w-full overflow-hidden">
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0"
            title="Previous scene"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Thumbnails Row */}
          <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 px-0.5">
            {scenes.map((scene, idx) => {
              const isActive = scene.id === currentSceneId;
              const sceneNumber = (idx + 1).toString().padStart(2, '0');

              return (
                <button
                  key={scene.id}
                  id={`thumbnail-scene-${scene.id}`}
                  onClick={() => onSelectScene(scene.id)}
                  className={`group relative flex-shrink-0 w-24 sm:w-32 h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer text-left ${
                    isActive
                      ? 'border-emerald-400 ring-2 ring-emerald-400/40 scale-105 shadow-xl shadow-emerald-950/30'
                      : 'border-neutral-800 hover:border-neutral-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  {/* Thumbnail image */}
                  <img
                    src={scene.thumbnailUrl || scene.imageUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Index badge */}
                  <div className="absolute top-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-white/10">
                    {sceneNumber}
                  </div>

                  {/* Hotspots count pill */}
                  {scene.hotspots && scene.hotspots.length > 0 && (
                    <div className="absolute top-1 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/80 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      {scene.hotspots.length}
                    </div>
                  )}

                  {/* Room title */}
                  <div className="absolute bottom-1 left-1.5 right-1.5">
                    <p className="text-[11px] font-semibold text-white truncate leading-tight">
                      {scene.name}
                    </p>
                    {scene.category && (
                      <p className="text-[9px] text-neutral-300 truncate opacity-80">
                        {scene.category}
                      </p>
                    )}
                  </div>

                  {/* Active highlight glow bar */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer hidden sm:flex items-center justify-center flex-shrink-0"
            title="Next scene"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
