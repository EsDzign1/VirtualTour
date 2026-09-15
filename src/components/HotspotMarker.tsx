import React, { useState } from 'react';
import { 
  Compass, 
  Info, 
  Play, 
  ArrowRight, 
  Utensils, 
  Sun, 
  Bed, 
  Tv, 
  Sparkles, 
  Gem, 
  Droplets, 
  Volume2, 
  Home, 
  DoorOpen,
  Eye,
  Trash2,
  Edit2
} from 'lucide-react';
import { Hotspot, Scene } from '../types/tour';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  screenPos: { x: number; y: number; visible: boolean };
  onSelect: (hotspot: Hotspot) => void;
  onNavigate?: (sceneId: string) => void;
  targetScene?: Scene;
  isEditMode?: boolean;
  onEdit?: (hotspot: Hotspot) => void;
  onDelete?: (hotspotId: string) => void;
}

export const HotspotMarker: React.FC<HotspotMarkerProps> = ({
  hotspot,
  screenPos,
  onSelect,
  onNavigate,
  targetScene,
  isEditMode,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!screenPos.visible) return null;

  const getIcon = () => {
    switch (hotspot.icon) {
      case 'utensils': return <Utensils className="w-4 h-4" />;
      case 'sun': return <Sun className="w-4 h-4" />;
      case 'bed': return <Bed className="w-4 h-4" />;
      case 'tv': return <Tv className="w-4 h-4" />;
      case 'sparkles': return <Sparkles className="w-4 h-4" />;
      case 'gem': return <Gem className="w-4 h-4" />;
      case 'droplets': return <Droplets className="w-4 h-4" />;
      case 'volume-2': return <Volume2 className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'door-open': return <DoorOpen className="w-4 h-4" />;
      default:
        if (hotspot.type === 'video') return <Play className="w-4 h-4 fill-white ml-0.5" />;
        if (hotspot.type === 'info') return <Info className="w-4 h-4" />;
        return <Compass className="w-4 h-4" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditMode) {
      onSelect(hotspot);
      return;
    }

    if (hotspot.type === 'navigation' && hotspot.targetSceneId && onNavigate) {
      onNavigate(hotspot.targetSceneId);
    } else {
      onSelect(hotspot);
    }
  };

  // Color themes by hotspot type
  const getTypeStyles = () => {
    if (hotspot.type === 'video') {
      return {
        bg: 'bg-rose-600/90 hover:bg-rose-500',
        ring: 'ring-rose-500/50',
        pulse: 'bg-rose-500/30',
        border: 'border-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      };
    }
    if (hotspot.type === 'info') {
      return {
        bg: 'bg-amber-600/90 hover:bg-amber-500',
        ring: 'ring-amber-500/50',
        pulse: 'bg-amber-500/30',
        border: 'border-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      };
    }
    // Navigation
    return {
      bg: 'bg-emerald-600/90 hover:bg-emerald-500',
      ring: 'ring-emerald-500/50',
      pulse: 'bg-emerald-500/30',
      border: 'border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  };

  const styles = getTypeStyles();

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto select-none z-20 group"
      style={{
        left: `${screenPos.x}px`,
        top: `${screenPos.y}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer pulsating beacon rings */}
      <div className="relative flex items-center justify-center">
        <span
          className={`absolute w-12 h-12 rounded-full animate-ping opacity-60 ${styles.pulse}`}
        />
        <span
          className={`absolute w-9 h-9 rounded-full ${styles.pulse} animate-pulse`}
        />

        {/* Main button pin */}
        <button
          onClick={handleClick}
          aria-label={hotspot.title}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl backdrop-blur-md border-2 transition-transform duration-200 transform group-hover:scale-110 active:scale-95 cursor-pointer ${styles.bg} ${styles.border}`}
        >
          {getIcon()}
        </button>
      </div>

      {/* Editor controls badge if in edit mode */}
      {isEditMode && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 text-white px-2 py-1 rounded-md border border-neutral-700 text-xs shadow-lg whitespace-nowrap">
          <span className="text-[10px] text-neutral-400">
            {hotspot.pitch.toFixed(0)}°, {hotspot.yaw.toFixed(0)}°
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(hotspot);
            }}
            className="p-1 hover:text-sky-400"
            title="Edit hotspot"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(hotspot.id);
            }}
            className="p-1 hover:text-rose-400"
            title="Delete hotspot"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Hover preview tooltip */}
      {!isEditMode && isHovered && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 min-w-56 max-w-72 bg-neutral-950/95 backdrop-blur-md rounded-xl p-2.5 shadow-2xl border border-neutral-800 pointer-events-none transition-all duration-200 z-30">
          {/* Top thumbnail if navigation or info */}
          {hotspot.type === 'navigation' && (hotspot.previewImage || targetScene?.thumbnailUrl) && (
            <div className="relative w-full h-24 mb-2 rounded-lg overflow-hidden bg-neutral-900">
              <img
                src={hotspot.previewImage || targetScene?.thumbnailUrl}
                alt={hotspot.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white flex items-center gap-1">
                <DoorOpen className="w-3 h-3 text-emerald-400" />
                Jump to Room
              </span>
            </div>
          )}

          {/* Video preview banner */}
          {hotspot.type === 'video' && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${styles.badge}`}>
                {hotspot.badgeText || 'Embedded Video'}
              </span>
              {hotspot.videoDuration && (
                <span className="text-[10px] text-neutral-400">
                  • {hotspot.videoDuration}
                </span>
              )}
            </div>
          )}

          {/* Info badge */}
          {hotspot.type === 'info' && hotspot.badgeText && (
            <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border mb-1.5 ${styles.badge}`}>
              {hotspot.badgeText}
            </span>
          )}

          <div className="text-sm font-semibold text-white flex items-center justify-between gap-2">
            <span>{hotspot.title}</span>
            {hotspot.type === 'navigation' && <ArrowRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
            {hotspot.type === 'video' && <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400 flex-shrink-0" />}
            {hotspot.type === 'info' && <Eye className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
          </div>

          {hotspot.description && (
            <p className="text-xs text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
              {hotspot.description}
            </p>
          )}

          <div className="mt-2 text-[10px] text-neutral-400 border-t border-neutral-800/80 pt-1.5 flex items-center justify-between">
            <span>
              {hotspot.type === 'navigation' ? 'Click to navigate' : hotspot.type === 'video' ? 'Click to play video' : 'Click for details'}
            </span>
            <span className="text-neutral-500 font-mono">360°</span>
          </div>
        </div>
      )}
    </div>
  );
};
