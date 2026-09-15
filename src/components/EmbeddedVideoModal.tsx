import React, { useEffect } from 'react';
import { X, Play, Volume2, Sparkles, ExternalLink, Maximize2 } from 'lucide-react';
import { Hotspot } from '../types/tour';
import { parseVideoEmbed } from '../utils/panoramaHelper';

interface EmbeddedVideoModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  sceneName?: string;
}

export const EmbeddedVideoModal: React.FC<EmbeddedVideoModalProps> = ({
  hotspot,
  onClose,
  sceneName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hotspot || hotspot.type !== 'video') return null;

  const { type, embedUrl } = parseVideoEmbed(hotspot.videoUrl);

  return (
    <div
      id="video-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="video-modal-container"
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
              <Play className="w-4 h-4 fill-rose-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {hotspot.badgeText || 'Embedded Video Hotspot'}
                </span>
                {sceneName && (
                  <span className="text-xs text-neutral-400 hidden sm:inline">
                    Location: <strong className="text-neutral-300">{sceneName}</strong>
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate mt-0.5">
                {hotspot.videoTitle || hotspot.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              id="close-video-modal-btn"
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {type === 'youtube' || type === 'vimeo' ? (
            <iframe
              src={embedUrl}
              title={hotspot.videoTitle || hotspot.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : type === 'html5' && embedUrl ? (
            <video
              src={embedUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Your browser does not support HTML5 video.
            </video>
          ) : (
            <div className="text-center p-8 text-neutral-400">
              <Play className="w-12 h-12 mx-auto mb-3 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">No playable video stream found</p>
              <p className="text-xs text-neutral-500 mt-1">Please check the video URL in the tour editor</p>
            </div>
          )}
        </div>

        {/* Description & metadata footer */}
        <div className="p-5 bg-neutral-950/80 border-t border-neutral-800/60 overflow-y-auto max-h-40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-neutral-200">
              About this feature presentation
            </span>
            {hotspot.videoDuration && (
              <span className="text-xs text-neutral-400 font-mono">
                Duration: {hotspot.videoDuration}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {hotspot.description ||
              'This interactive video presentation provides an architectural overview and spatial audio review of this sector in the 360-degree tour.'}
          </p>

          {hotspot.actionUrl && (
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-end">
              <a
                href={hotspot.actionUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
              >
                <span>{hotspot.actionLabel || 'External Source Link'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
