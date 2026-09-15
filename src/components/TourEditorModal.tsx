import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Trash2, 
  Check, 
  MapPin, 
  RotateCw, 
  Crosshair,
  FileCode,
  Sparkles
} from 'lucide-react';
import { TourData, Scene } from '../types/tour';
import { generateProceduralEquirectangular } from '../utils/panoramaHelper';

interface TourEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourData: TourData;
  onUpdateTourData: (newData: TourData) => void;
  currentSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onStartHotspotPlacement: () => void;
  onResetTour: () => void;
}

export const TourEditorModal: React.FC<TourEditorModalProps> = ({
  isOpen,
  onClose,
  tourData,
  onUpdateTourData,
  currentSceneId,
  onSelectScene,
  onStartHotspotPlacement,
  onResetTour,
}) => {
  const [activeTab, setActiveTab] = useState<'scenes' | 'addScene' | 'settings' | 'export'>('scenes');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Add scene state
  const [newSceneName, setNewSceneName] = useState('');
  const [newSceneCategory, setNewSceneCategory] = useState('Interior');
  const [newSceneImageUrl, setNewSceneImageUrl] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('living');

  // Tour metadata edit state
  const [title, setTitle] = useState(tourData.title);
  const [subtitle, setSubtitle] = useState(tourData.subtitle);
  const [address, setAddress] = useState(tourData.propertySpecs.address);
  const [price, setPrice] = useState(tourData.propertySpecs.price);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState(tourData.settings.autoRotateSpeed);

  if (!isOpen) return null;

  // Handle image upload from user computer
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewSceneImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Preset panorama options
  const presets = [
    { id: 'living', name: 'Luxury Villa Living Room', generatorType: 'living' as const },
    { id: 'kitchen', name: "Chef's Kitchen & Marble Island", generatorType: 'kitchen' as const },
    { id: 'terrace', name: 'Cantilevered Ocean Terrace', generatorType: 'terrace' as const },
    { id: 'master', name: 'Master Suite & Balcony', generatorType: 'master' as const },
    { id: 'theater', name: 'Private Cinema Screening Room', generatorType: 'theater' as const },
  ];

  const handleAddSceneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = newSceneImageUrl.trim();
    if (!finalImageUrl) {
      // Use procedural generator for chosen preset
      const presetObj = presets.find((p) => p.id === selectedPreset);
      finalImageUrl = generateProceduralEquirectangular(presetObj ? presetObj.generatorType : 'living');
    }

    const newId = `scene-${Date.now()}`;
    const newScene: Scene = {
      id: newId,
      name: newSceneName.trim() || 'New 360 Room',
      category: newSceneCategory.trim() || 'Custom',
      imageUrl: finalImageUrl,
      thumbnailUrl: finalImageUrl,
      initialPitch: 0,
      initialYaw: 0,
      initialFov: 75,
      floorPlanCoords: { x: 50, y: 50 },
      description: 'Custom 360 room added via Tour Studio.',
      hotspots: [],
    };

    onUpdateTourData({
      ...tourData,
      scenes: [...tourData.scenes, newScene],
    });

    onSelectScene(newId);
    setNewSceneName('');
    setNewSceneImageUrl('');
    setActiveTab('scenes');
  };

  const handleDeleteScene = (sceneId: string) => {
    if (tourData.scenes.length <= 1) {
      alert('A 360 virtual tour must contain at least one scene.');
      return;
    }
    const updated = tourData.scenes.filter((s) => s.id !== sceneId);
    onUpdateTourData({
      ...tourData,
      scenes: updated,
    });
    if (currentSceneId === sceneId) {
      onSelectScene(updated[0].id);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTourData({
      ...tourData,
      title,
      subtitle,
      propertySpecs: {
        ...tourData.propertySpecs,
        address,
        price,
      },
      settings: {
        ...tourData.settings,
        autoRotateSpeed,
      },
    });
    onClose();
  };

  // Export tour to JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tourData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${tourData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-tour.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import tour from JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.scenes && Array.isArray(parsed.scenes)) {
          onUpdateTourData(parsed);
          if (parsed.scenes.length > 0) {
            onSelectScene(parsed.scenes[0].id);
          }
          alert('Custom 360 Virtual Tour successfully loaded!');
          onClose();
        } else {
          alert('Invalid tour format. Expected a JSON with a "scenes" array.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="tour-studio-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="tour-studio-modal"
        className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                360° Virtual Tour Studio & Editor
              </h2>
              <p className="text-xs text-neutral-400">
                Manage panoramas, place interactive hotspots, and configure embedded video
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 px-5 pt-3 gap-4 bg-neutral-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scenes')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'scenes'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Scenes & Hotspots ({tourData.scenes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addScene')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'addScene'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add 360 Room</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tour Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Import / Export</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SCENES & CURRENT HOTSPOTS */}
          {activeTab === 'scenes' && (
            <div className="space-y-4">
              {/* Hotspot placement banner for active scene */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-indigo-400" />
                    Place Hotspots on Current View
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Click below, then click anywhere on the 360-degree panorama sphere to drop an interactive hotspot.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onStartHotspotPlacement();
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex-shrink-0"
                >
                  <Crosshair className="w-4 h-4" />
                  <span>Click to Place Hotspot</span>
                </button>
              </div>

              {/* List of tour scenes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
                  Virtual Tour Scenes ({tourData.scenes.length})
                </h4>

                <div className="space-y-2.5">
                  {tourData.scenes.map((scene, idx) => {
                    const isSelected = scene.id === currentSceneId;
                    return (
                      <div
                        key={scene.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                          isSelected
                            ? 'bg-neutral-800/90 border-indigo-500/50 ring-1 ring-indigo-500/30'
                            : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0">
                            <img
                              src={scene.thumbnailUrl || scene.imageUrl}
                              alt={scene.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-0.5 left-1 font-mono text-[9px] font-bold text-white bg-black/60 px-1 rounded">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-white truncate">
                                {scene.name}
                              </h5>
                              {isSelected && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                              <span>{scene.category || 'Interior'}</span>
                              <span>•</span>
                              <span className="text-emerald-400">
                                {scene.hotspots.length} Hotspots
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              onSelectScene(scene.id);
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                            }`}
                          >
                            {isSelected ? 'Viewing' : 'Jump Here'}
                          </button>

                          <button
                            onClick={() => handleDeleteScene(scene.id)}
                            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-rose-900/60 text-neutral-400 hover:text-rose-300 transition-colors cursor-pointer"
                            title="Delete scene"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD NEW 360 ROOM */}
          {activeTab === 'addScene' && (
            <form onSubmit={handleAddSceneSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Room / Scene Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newSceneName}
                    onChange={(e) => setNewSceneName(e.target.value)}
                    placeholder="e.g. Penthouse Rooftop Lounge"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={newSceneCategory}
                    onChange={(e) => setNewSceneCategory(e.target.value)}
                    placeholder="e.g. Upper Level, Outdoor, Amenity"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Panorama Image Source Options */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-neutral-300 block">
                  360 Equirectangular Image Source
                </label>

                {/* Upload from computer */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-neutral-950/40 hover:bg-neutral-950/70"
                >
                  <Upload className="w-7 h-7 mx-auto mb-2 text-indigo-400" />
                  <p className="text-xs font-semibold text-neutral-200">
                    Click or Drag & Drop 360° Equirectangular Photo
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Supports JPG, PNG (2:1 panoramic aspect ratio recommended)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Or paste Image URL */}
                <div className="relative">
                  <span className="text-[11px] text-neutral-400 block mb-1">
                    Or Enter Direct 360 Image URL:
                  </span>
                  <input
                    type="url"
                    value={newSceneImageUrl}
                    onChange={(e) => setNewSceneImageUrl(e.target.value)}
                    placeholder="https://.../equirectangular_panorama.jpg"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Or choose from architectural preset gallery */}
                <div>
                  <span className="text-[11px] text-neutral-400 block mb-1.5">
                    Or Select Instant Architectural Preset:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setNewSceneImageUrl('');
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          selectedPreset === preset.id && !newSceneImageUrl
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <div className="font-semibold truncate">{preset.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">Procedural 360 HD</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add Room Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Room to Tour</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TOUR SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Virtual Tour Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Subtitle / Location
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Property Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Listing Price
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Auto-rotate speed slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
                  <span>Auto-Rotation Speed</span>
                  <span className="font-mono text-indigo-400">{autoRotateSpeed} deg/s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={autoRotateSpeed}
                  onChange={(e) => setAutoRotateSpeed(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: IMPORT / EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    Download Tour as JSON
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Export your custom scenes, hotspots, video configs, and settings into a standalone JSON file.
                  </p>
                </div>
                <button
                  onClick={handleExportJSON}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-indigo-400" />
                    Import Tour JSON
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Load any previously saved virtual tour configuration directly into this viewer.
                  </p>
                </div>
                <button
                  onClick={() => jsonInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                >
                  <Upload className="w-4 h-4" />
                  <span>Load JSON</span>
                </button>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    Reset Tour to Default Villa Lumina Demo
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Restores all scenes, architectural specifications, and embedded video hotspots to initial state.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset to the default demo virtual tour?')) {
                      onResetTour();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-amber-900/40 text-neutral-300 hover:text-amber-300 border border-neutral-700 text-xs font-semibold transition-colors cursor-pointer flex-shrink-0"
                >
                  Reset Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
