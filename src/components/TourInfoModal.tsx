import React from 'react';
import { X, Home, MapPin, DollarSign, Calendar, Maximize, Phone, Mail, Award, Check } from 'lucide-react';
import { TourData } from '../types/tour';

interface TourInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourData: TourData;
}

export const TourInfoModal: React.FC<TourInfoModalProps> = ({
  isOpen,
  onClose,
  tourData,
}) => {
  if (!isOpen) return null;

  const { propertySpecs } = tourData;

  const amenities = [
    'Zero-Edge Heated Saline Pool',
    'Private THX Dolby Atmos Screening Room',
    '300-Bottle Temperature Wine Vault',
    'Smart Circadian Lutron Ketra Lighting',
    'Swiss Motorized Sky-Frame Glass Walls',
    'Vein-Cut Silver Travertine Hearth',
    'Tesla Solar Roof & Powerwall System',
    'Private Gated Cliffside Access',
  ];

  return (
    <div
      id="tour-info-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="tour-info-modal-container"
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800 bg-neutral-950/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold mb-1.5">
              <Award className="w-3 h-3" />
              Verified Architectural Tour
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {tourData.title}
            </h2>
            <div className="flex items-center gap-1 text-xs text-neutral-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
              <span>{propertySpecs.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Listing Price
              </span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                {propertySpecs.price}
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Living Area
              </span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {propertySpecs.area}
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Accommodations
              </span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {propertySpecs.bedrooms} Beds / {propertySpecs.bathrooms} Baths
              </span>
            </div>
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Completion Year
              </span>
              <span className="text-base font-bold text-white mt-0.5 block">
                {propertySpecs.yearBuilt}
              </span>
            </div>
          </div>

          {/* Architectural Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Architectural Concept & Design
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Conceived by <strong className="text-white">{propertySpecs.architect}</strong>, Villa Lumina is a masterclass in modern biophilic minimalism. Built into the terraced coastal ridges of Malibu, the estate utilizes board-formed concrete, floor-to-ceiling ultra-clear glass, and imported Italian travertine to erase the boundary between indoor living and the Pacific panorama.
            </p>
          </div>

          {/* Key Amenities Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Curated Estate Amenities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {amenities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-neutral-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Agent / Creator Contact Box */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-neutral-400 font-medium">Virtual Tour Production & Representation</p>
              <h5 className="text-sm font-bold text-white">{tourData.author}</h5>
            </div>
            <div className="flex items-center gap-2">
              {tourData.authorPhone && (
                <a
                  href={`tel:${tourData.authorPhone}`}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call</span>
                </a>
              )}
              {tourData.authorEmail && (
                <a
                  href={`mailto:${tourData.authorEmail}?subject=${encodeURIComponent(`Inquiry on ${tourData.title}`)}`}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
