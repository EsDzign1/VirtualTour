export type HotspotType = 'navigation' | 'info' | 'video';

export interface Hotspot {
  id: string;
  type: HotspotType;
  pitch: number; // -90 to +90 degrees (latitude)
  yaw: number;   // -180 to +180 degrees (longitude)
  title: string;
  description?: string;
  // Navigation specific
  targetSceneId?: string;
  targetSceneName?: string;
  previewImage?: string;
  // Video specific
  videoUrl?: string; // YouTube, Vimeo, or MP4 URL
  videoTitle?: string;
  videoDuration?: string;
  videoMode?: 'modal' | 'spatial';
  // Info specific
  imageUrl?: string;
  badgeText?: string;
  specs?: { label: string; value: string }[];
  actionUrl?: string;
  actionLabel?: string;
  // Customization
  customColor?: string;
  icon?: string;
}

export interface Scene {
  id: string;
  name: string;
  category?: string;
  imageUrl: string;
  thumbnailUrl: string;
  initialPitch: number;
  initialYaw: number;
  initialFov?: number;
  floorPlanCoords: { x: number; y: number }; // Percentage (0 - 100)
  description?: string;
  hotspots: Hotspot[];
}

export interface PropertySpecs {
  address: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  architect?: string;
}

export interface TourSettings {
  autoRotate: boolean;
  autoRotateSpeed: number; // deg per sec
  dampingFactor: number;
  enableSound: boolean;
  ambientAudioUrl?: string;
  showCompass: boolean;
  showFloorPlan: boolean;
}

export interface TourData {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  authorEmail?: string;
  authorPhone?: string;
  propertySpecs: PropertySpecs;
  scenes: Scene[];
  settings: TourSettings;
  floorPlanImage?: string;
}
