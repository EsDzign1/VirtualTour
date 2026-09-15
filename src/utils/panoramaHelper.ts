import * as THREE from 'three';

/**
 * Converts pitch & yaw (degrees) to 3D Cartesian coordinates on a sphere.
 * pitch: -90 (down) to +90 (up)
 * yaw: -180 to +180 (rotation around Y axis)
 */
export function sphericalToCartesian(pitch: number, yaw: number, radius = 500): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - pitch);
  const theta = THREE.MathUtils.degToRad(yaw + 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts a 3D point on the sphere back to pitch and yaw in degrees.
 */
export function cartesianToSpherical(point: THREE.Vector3): { pitch: number; yaw: number } {
  const normal = point.clone().normalize();
  // y = cos(phi) => phi = acos(y)
  const phi = Math.acos(Math.max(-1, Math.min(1, normal.y)));
  const pitch = 90 - THREE.MathUtils.radToDeg(phi);

  // x = -sin(phi)*cos(theta), z = sin(phi)*sin(theta)
  const theta = Math.atan2(normal.z, -normal.x);
  let yaw = THREE.MathUtils.radToDeg(theta) - 180;
  while (yaw < -180) yaw += 360;
  while (yaw > 180) yaw -= 360;

  return {
    pitch: Math.round(pitch * 10) / 10,
    yaw: Math.round(yaw * 10) / 10,
  };
}

/**
 * Parses video URL to detect YouTube, Vimeo, or standard HTML5 video.
 */
export function parseVideoEmbed(url?: string): {
  type: 'youtube' | 'vimeo' | 'html5' | 'unknown';
  embedUrl: string;
  videoId?: string;
} {
  if (!url) return { type: 'unknown', embedUrl: '' };

  const trimmed = url.trim();

  // YouTube match
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      videoId: ytMatch[1],
    };
  }

  // Vimeo match
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&title=0&byline=0`,
      videoId: vimeoMatch[1],
    };
  }

  // Direct MP4 / WebM
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.includes('commondatastorage.googleapis.com')) {
    return {
      type: 'html5',
      embedUrl: trimmed,
    };
  }

  // If already an embed url
  if (trimmed.includes('/embed/')) {
    return {
      type: 'youtube',
      embedUrl: trimmed,
    };
  }

  // Default fallback to YouTube search or direct iframe
  return {
    type: 'html5',
    embedUrl: trimmed,
  };
}

/**
 * Generates an equirectangular procedural architectural panorama on an HTML5 canvas.
 * This ensures that even without external network access or CDN latency, the 360 viewer
 * renders a crisp, ultra-high-resolution modern luxury interior with photorealistic lighting.
 */
export function generateProceduralEquirectangular(type: 'living' | 'kitchen' | 'terrace' | 'master' | 'theater'): string {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Sky / Ceiling gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  if (type === 'terrace') {
    // Sunset coastal sky
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.3, '#1e293b');
    grad.addColorStop(0.48, '#fb923c');
    grad.addColorStop(0.51, '#f97316');
    grad.addColorStop(0.55, '#0e7490');
    grad.addColorStop(0.7, '#082f49');
    grad.addColorStop(1, '#020617');
  } else if (type === 'theater') {
    // Dark moody cinema interior
    grad.addColorStop(0, '#050508');
    grad.addColorStop(0.45, '#111218');
    grad.addColorStop(0.5, '#1c1924');
    grad.addColorStop(0.6, '#0f0f15');
    grad.addColorStop(1, '#07070a');
  } else {
    // Warm luxury architectural interior
    grad.addColorStop(0, '#1e1b18');
    grad.addColorStop(0.35, '#292524');
    grad.addColorStop(0.48, '#3b3530');
    grad.addColorStop(0.52, '#2f2b27');
    grad.addColorStop(0.65, '#201d1a');
    grad.addColorStop(1, '#141210');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Horizon line
  const horizon = height * 0.5;

  // Draw architectural features according to type
  if (type === 'terrace') {
    // Ocean horizon with shimmering water reflection
    const waterGrad = ctx.createLinearGradient(0, horizon, 0, height);
    waterGrad.addColorStop(0, '#0284c7');
    waterGrad.addColorStop(0.15, '#0369a1');
    waterGrad.addColorStop(0.35, '#075985');
    waterGrad.addColorStop(0.7, '#0c4a6e');
    waterGrad.addColorStop(1, '#082f49');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // Distant mountain range / islands on horizon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    for (let x = 0; x <= width; x += 40) {
      const h = Math.sin(x * 0.008) * 25 + Math.cos(x * 0.02) * 12 - 10;
      ctx.lineTo(x, horizon - Math.max(0, h));
    }
    ctx.lineTo(width, horizon);
    ctx.closePath();
    ctx.fill();

    // Infinity pool deck
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, horizon + 120, width, height - (horizon + 120));

    // Warm teak wood planking
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
    ctx.lineWidth = 2;
    for (let y = horizon + 130; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Glass perimeter railings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 118);
    ctx.lineTo(width, horizon + 118);
    ctx.stroke();
  } else {
    // Interior: Floor
    const floorGrad = ctx.createLinearGradient(0, horizon, 0, height);
    if (type === 'theater') {
      floorGrad.addColorStop(0, '#1e1b2e');
      floorGrad.addColorStop(1, '#0b0a12');
    } else {
      floorGrad.addColorStop(0, '#382f28');
      floorGrad.addColorStop(1, '#1c1713');
    }
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizon, width, height - horizon);

    // Floor perspective lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < width; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, horizon);
      ctx.lineTo(i + (i - width / 2) * 0.8, height);
      ctx.stroke();
    }

    // Panoramic floor-to-ceiling glass window frame (spanning one quadrant)
    const windowStart = width * 0.2;
    const windowEnd = width * 0.65;
    const windowTop = height * 0.25;
    const windowBottom = horizon + 30;

    // Window scenic view (lush modern garden / estate)
    const viewGrad = ctx.createLinearGradient(0, windowTop, 0, windowBottom);
    viewGrad.addColorStop(0, '#38bdf8');
    viewGrad.addColorStop(0.4, '#bae6fd');
    viewGrad.addColorStop(0.5, '#4ade80');
    viewGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = viewGrad;
    ctx.fillRect(windowStart, windowTop, windowEnd - windowStart, windowBottom - windowTop);

    // Window architectural mullions
    ctx.fillStyle = '#18181b';
    ctx.fillRect(windowStart - 8, windowTop - 8, windowEnd - windowStart + 16, 16);
    ctx.fillRect(windowStart - 8, windowBottom - 4, windowEnd - windowStart + 16, 16);
    for (let x = windowStart; x <= windowEnd; x += (windowEnd - windowStart) / 4) {
      ctx.fillRect(x - 6, windowTop, 12, windowBottom - windowTop);
    }

    // Architectural feature wall with ambient LED strip
    const wallStart = width * 0.72;
    const wallWidth = width * 0.22;
    ctx.fillStyle = '#27272a';
    ctx.fillRect(wallStart, height * 0.2, wallWidth, horizon);

    // LED glow on wall
    ctx.shadowColor = type === 'theater' ? '#a855f7' : '#f59e0b';
    ctx.shadowBlur = 30;
    ctx.strokeStyle = type === 'theater' ? '#c084fc' : '#fbbf24';
    ctx.lineWidth = 4;
    ctx.strokeRect(wallStart + 20, height * 0.24, wallWidth - 40, horizon - height * 0.24 - 40);
    ctx.shadowBlur = 0;

    // High-tech Video Screen on wall (especially for media / theater / living)
    const screenX = wallStart + 40;
    const screenY = height * 0.28;
    const screenW = wallWidth - 80;
    const screenH = horizon * 0.5;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(screenX, screenY, screenW, screenH);
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX, screenY, screenW, screenH);

    // Screen content art
    const screenArt = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
    screenArt.addColorStop(0, '#065f46');
    screenArt.addColorStop(0.5, '#0d9488');
    screenArt.addColorStop(1, '#0284c7');
    ctx.fillStyle = screenArt;
    ctx.fillRect(screenX + 8, screenY + 8, screenW - 16, screenH - 16);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('4K ULTRA HD DISPLAY', screenX + screenW / 2, screenY + screenH / 2);

    // Ceiling recessed downlights
    for (let x = 120; x < width; x += 220) {
      ctx.fillStyle = 'rgba(254, 243, 199, 0.7)';
      ctx.beginPath();
      ctx.arc(x, height * 0.15, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas.toDataURL('image/jpeg', 0.88);
}
