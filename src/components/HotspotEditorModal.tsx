import React, { useState } from 'react';
import { X, Play, Compass, Info, Trash2, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { Hotspot, HotspotType, Scene } from '../types/tour';

interface HotspotEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hotspot: Hotspot) => void;
  onDelete?: (hotspotId: string) => void;
  initialHotspot: Partial<Hotspot>;
  scenes: Scene[];
  currentSceneId: string;
}

export const HotspotEditorModal: React.FC<HotspotEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialHotspot,
  scenes,
  currentSceneId,
}) => {
  const [type, setType] = useState<HotspotType>(initialHotspot.type || 'navigation');
  const [title, setTitle] = useState(initialHotspot.title || '');
  const [pitch, setPitch] = useState(initialHotspot.pitch ?? 0);
  const [yaw, setYaw] = useState(initialHotspot.yaw ?? 0);
  const [description, setDescription] = useState(initialHotspot.description || '');

  // Navigation fields
  const [targetSceneId, setTargetSceneId] = useState(
    initialHotspot.targetSceneId || (scenes.find((s) => s.id !== currentSceneId)?.id || '')
  );

  // Video fields
  const [videoUrl, setVideoUrl] = useState(initialHotspot.videoUrl || '');
  const [videoTitle, setVideoTitle] = useState(initialHotspot.videoTitle || '');
  const [videoDuration, setVideoDuration] = useState(initialHotspot.videoDuration || '');
  const [videoMode, setVideoMode] = useState<'modal' | 'spatial'>(initialHotspot.videoMode || 'modal');

  // Info fields
  const [badgeText, setBadgeText] = useState(initialHotspot.badgeText || '');
  const [imageUrl, setImageUrl] = useState(initialHotspot.imageUrl || '');
  const [actionUrl, setActionUrl] = useState(initialHotspot.actionUrl || '');
  const [actionLabel, setActionLabel] = useState(initialHotspot.actionLabel || '');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTargetScene = scenes.find((s) => s.id === targetSceneId);

    const updated: Hotspot = {
      id: initialHotspot.id || `hs-${Date.now()}`,
      type,
      pitch: Number(pitch),
      yaw: Number(yaw),
      title: title.trim() || (type === 'navigation' ? selectedTargetScene?.name || 'Next Scene' : type === 'video' ? 'Featured Video' : 'Information Beacon'),
      description: description.trim(),
      targetSceneId: type === 'navigation' ? targetSceneId : undefined,
      targetSceneName: type === 'navigation' ? selectedTargetScene?.name : undefined,
      videoUrl: type === 'video' ? videoUrl.trim() : undefined,
      videoTitle: type === 'video' ? videoTitle.trim() || title : undefined,
      videoDuration: type === 'video' ? videoDuration.trim() : undefined,
      videoMode: type === 'video' ? videoMode : undefined,
      badgeText: badgeText.trim() || (type === 'video' ? 'EMBEDDED VIDEO' : type === 'info' ? 'DETAILS' : undefined),
      imageUrl: imageUrl.trim() || undefined,
      actionUrl: actionUrl.trim() || undefined,
      actionLabel: actionLabel.trim() || undefined,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div
      id="hotspot-editor-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="hotspot-editor-container"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <h3 className="text-base font-bold text-white">
              {initialHotspot.id ? 'Edit Interactive Hotspot' : 'Add New Interactive Hotspot'}
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              Coordinates: Pitch {pitch.toFixed(1)}°, Yaw {yaw.toFixed(1)}°
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4">
          {/* Hotspot Type Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
              Hotspot Function Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('navigation')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'navigation'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Navigation</span>
              </button>

              <button
                type="button"
                onClick={() => setType('video')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'video'
                    ? 'bg-rose-600/30 text-rose-300 border-rose-500 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>Video Player</span>
              </button>

              <button
                type="button"
                onClick={() => setType('info')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  type === 'info'
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500 shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Info Card</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Hotspot Title / Label
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'navigation' ? 'e.g. Master Bedroom Suite' : type === 'video' ? 'e.g. 4K Drone Tour' : 'e.g. Marble Fireplace'}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
            />
          </div>

          {/* If Navigation: Pick Destination Scene */}
          {type === 'navigation' && (
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Destination 360 Scene
              </label>
              <select
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              >
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.name} {scene.id === currentSceneId ? '(Current Room)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* If Video: Video configuration */}
          {type === 'video' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-rose-200">
                    Embedded Video URL
                  </label>
                  <span className="text-[10px] text-neutral-400">YouTube, Vimeo, MP4</span>
                </div>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or direct .mp4"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">
                    Display Duration
                  </label>
                  <input
                    type="text"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    placeholder="e.g. 3:15 min"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. 4K CINEMATIC"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* If Info: Details configuration */}
          {type === 'info' && (
            <div className="space-y-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. SPECIFICATION"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-neutral-300 block mb-1">
                    Action Link Label
                  </label>
                  <input
                    type="text"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="e.g. View Catalog"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-neutral-300 block mb-1">
                  External URL (Optional)
                </label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Description / Text Content
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or narrative for this hotspot..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Fine Coordinate Tuning */}
          <div className="pt-2 border-t border-neutral-800">
            <span className="text-xs font-semibold text-neutral-400 block mb-2">
              Fine-tune 360° Spherical Position
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Pitch (Latitude)</span>
                  <span className="font-mono text-white">{pitch}°</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={pitch}
                  onChange={(e) => setPitch(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                  <span>Yaw (Longitude)</span>
                  <span className="font-mono text-white">{yaw}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={yaw}
                  onChange={(e) => setYaw(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
            {initialHotspot.id && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialHotspot.id!);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-900 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Hotspot</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
