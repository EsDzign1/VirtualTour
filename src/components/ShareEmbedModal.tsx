import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, QrCode, Globe, Send } from 'lucide-react';
import { TourData } from '../types/tour';

interface ShareEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourData: TourData;
}

export const ShareEmbedModal: React.FC<ShareEmbedModalProps> = ({
  isOpen,
  onClose,
  tourData,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'embed' | 'qr'>('link');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://theasys.io/viewer/tour';
  const embedCode = `<iframe src="${currentUrl}" width="100%" height="600" frameborder="0" allow="accelerometer; gyroscope; fullscreen" allowfullscreen></iframe>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="share-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="share-modal-container"
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share & Embed 360 Tour</h3>
              <p className="text-xs text-neutral-400 truncate max-w-xs">{tourData.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-neutral-800 px-5 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'link'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Direct Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'embed'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Embed Code (iFrame)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'qr'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Mobile QR Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'link' && (
            <div className="space-y-3">
              <label className="text-xs text-neutral-400 block font-medium">
                Direct Viewer Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs font-mono text-neutral-200 outline-none select-all"
                />
                <button
                  onClick={() => handleCopy(currentUrl)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <p className="text-[11px] text-neutral-400 mb-2">Share to platforms:</p>
                <div className="flex gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this 360 virtual tour of ${tourData.title}: ${currentUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium text-center transition-colors"
                  >
                    Twitter / X
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Take a look at this 360 virtual tour: ${currentUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 text-xs font-medium text-center transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`360 Tour: ${tourData.title}`)}&body=${encodeURIComponent(`Experience the 360 virtual tour here: ${currentUrl}`)}`}
                    className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium text-center transition-colors"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-3">
              <label className="text-xs text-neutral-400 block font-medium">
                HTML Embed Code for Websites & Real Estate Portals
              </label>
              <textarea
                rows={4}
                readOnly
                value={embedCode}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-emerald-400 outline-none select-all resize-none"
              />
              <button
                onClick={() => handleCopy(embedCode)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Embed Code Copied to Clipboard!' : 'Copy Embed Code'}</span>
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xl">
                {/* SVG QR Code pattern */}
                <svg width="150" height="150" viewBox="0 0 100 100" fill="#000">
                  <rect width="100" height="100" fill="#fff" />
                  <rect x="10" y="10" width="25" height="25" fill="#000" />
                  <rect x="15" y="15" width="15" height="15" fill="#fff" />
                  <rect x="19" y="19" width="7" height="7" fill="#000" />

                  <rect x="65" y="10" width="25" height="25" fill="#000" />
                  <rect x="70" y="15" width="15" height="15" fill="#fff" />
                  <rect x="74" y="19" width="7" height="7" fill="#000" />

                  <rect x="10" y="65" width="25" height="25" fill="#000" />
                  <rect x="15" y="70" width="15" height="15" fill="#fff" />
                  <rect x="19" y="74" width="7" height="7" fill="#000" />

                  {/* QR random data modules */}
                  <rect x="42" y="15" width="5" height="10" />
                  <rect x="52" y="20" width="5" height="15" />
                  <rect x="40" y="40" width="20" height="20" />
                  <rect x="45" y="45" width="10" height="10" fill="#fff" />
                  <rect x="68" y="45" width="6" height="14" />
                  <rect x="25" y="45" width="8" height="6" />
                  <rect x="45" y="70" width="15" height="15" />
                  <rect x="70" y="70" width="15" height="5" />
                  <rect x="75" y="80" width="10" height="10" />
                </svg>
              </div>
              <p className="text-xs text-neutral-300 font-medium">
                Scan with any smartphone camera to open this 360 tour on mobile or in VR glasses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
