import React, { useEffect } from 'react';
import { X, Info, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { Hotspot } from '../types/tour';

interface InfoCardModalProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  sceneName?: string;
}

export const InfoCardModal: React.FC<InfoCardModalProps> = ({
  hotspot,
  onClose,
  sceneName,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!hotspot || hotspot.type !== 'info') return null;

  return (
    <div
      id="info-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="info-modal-container"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional preview image banner */}
        {hotspot.imageUrl && (
          <div className="relative w-full h-48 bg-neutral-950 overflow-hidden">
            <img
              src={hotspot.imageUrl}
              alt={hotspot.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800/80 bg-neutral-950/40">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5" />
            </div>
            <div>
              {hotspot.badgeText && (
                <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-1">
                  {hotspot.badgeText}
                </span>
              )}
              <h3 className="text-lg font-bold text-white leading-snug">
                {hotspot.title}
              </h3>
              {sceneName && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  Location: <span className="text-neutral-300 font-medium">{sceneName}</span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-info-modal-btn"
            className="p-1.5 rounded-xl bg-neutral-800/60 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {hotspot.description && (
            <p className="text-sm text-neutral-300 leading-relaxed">
              {hotspot.description}
            </p>
          )}

          {/* Specifications table */}
          {hotspot.specs && hotspot.specs.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
              <div className="px-3.5 py-2 bg-neutral-800/40 border-b border-neutral-800 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Technical Specifications
              </div>
              <div className="divide-y divide-neutral-800/60 text-xs">
                {hotspot.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3.5 py-2.5">
                    <span className="text-neutral-400">{spec.label}</span>
                    <span className="font-semibold text-white text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hotspot.actionUrl && (
            <div className="pt-2">
              <a
                href={hotspot.actionUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
              >
                <span>{hotspot.actionLabel || 'Learn More / Manufacturer Specs'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
