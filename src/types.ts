export type SystemType = 'WII' | 'NDS';

export interface RomGame {
  id: string;
  system: SystemType;
  title: string;
  hindiTitle: string;
  gameCode: string;
  fileName: string;
  fileSize: string;
  region: 'NTSC-U' | 'PAL' | 'NTSC-J' | 'GLOBAL';
  genre: string;
  releaseYear: number;
  description: string;
  hindiDescription: string;
  coverImage?: string;
  bannerColor: string;
  isHomebrew?: boolean;
  dateAdded: string;
  romData?: ArrayBuffer;
}

export type HyperBoostMode = 'pro_gamer' | 'balanced' | 'battery_saver';
export type GraphicsBackend = 'vulkan' | 'opengles' | 'software';
export type ResolutionScale = 1 | 2 | 3 | 4; // 1x Native, 2x 720p HD, 3x 1080p FHD, 4x 4K UHD
export type NdsLayoutMode = 'vertical' | 'horizontal' | 'focused_top' | 'focused_bottom';

export interface ControlElementPosition {
  x: number; // percentage from left (0 to 100)
  y: number; // percentage from bottom (0 to 100)
  scale: number; // 0.6 to 1.6
  visible: boolean;
}

export interface CustomLayoutMap {
  dpad: ControlElementPosition;
  analogStick: ControlElementPosition;
  faceButtons: ControlElementPosition; // A/B/X/Y or Wiimote A/B
  wiimote: ControlElementPosition; // Full Wii Remote Body
  nunchuk: ControlElementPosition; // Nunchuk Attachment
  shoulderL: ControlElementPosition;
  shoulderR: ControlElementPosition;
  menuButtons: ControlElementPosition; // Start/Select/Home
  extraTriggers: ControlElementPosition; // C/Z or Mic
}

export interface GpuDriver {
  id: string;
  name: string;
  version: string;
  vendor: 'Mesa Turnip' | 'Qualcomm' | 'Arm Mali' | 'Vulkan Generic' | 'Custom';
  api: 'Vulkan 1.3' | 'Vulkan 1.2' | 'OpenGL ES 3.2';
  description: string;
  hindiDescription: string;
  stabilityRating: 'Maximum (Zero Crash)' | 'Ultra High FPS' | 'Optimal Balance';
  isDefault?: boolean;
  isCustomInstalled?: boolean;
}

export interface EmulatorSettings {
  hyperBoostMode: HyperBoostMode;
  graphicsBackend: GraphicsBackend;
  resolutionScale: ResolutionScale;
  targetFps: 30 | 60 | 120;
  skipEfbAccess: boolean;
  fastDepthCalc: boolean;
  vertexStreamingHack: boolean;
  anisotropicFiltering: 0 | 4 | 8 | 16;
  audioDspMode: 'HLE_FAST' | 'LLE_ACCURATE';
  hapticFeedback: boolean;
  controllerOpacity: number;
  controllerScale: number;
  showFpsCounter: boolean;
  showFrametimeGraph: boolean;
  motionSensitivity: number;
  touchPointerMode: 'direct' | 'relative' | 'gyro';
  aspectRatio: '16:9' | '4:3';
  crtFilter: boolean;
  audioVolume: number;
  language: 'hi' | 'en';
  // DS Specific
  ndsScreenLayout: NdsLayoutMode;
  ndsScreenGap: number;
  controllerMode: 'auto' | 'nds' | 'wiimote' | 'classic';
  // Driver & Stability
  activeDriverId: string;
  stabilityProtection: boolean; // Auto-recover from WebGL context loss & GC cleanup
  autoDownscaleUnderLoad: boolean; // Downscales from 4K if FPS drops to maintain 60 FPS
  // Custom Controller Layout Map
  customLayout: CustomLayoutMap;
}

export interface SaveState {
  slot: number;
  gameId: string;
  gameTitle: string;
  system: SystemType;
  timestamp: string;
  screenshot: string;
}

export interface ControllerState {
  // Common / D-Pad
  dpadUp: boolean;
  dpadDown: boolean;
  dpadLeft: boolean;
  dpadRight: boolean;

  // Face Buttons
  btnA: boolean;
  btnB: boolean;
  btnX: boolean; // DS
  btnY: boolean; // DS

  // Shoulder Triggers
  btnL: boolean; // DS / Classic
  btnR: boolean; // DS / Classic
  btnZL: boolean;
  btnZR: boolean;

  // System
  btnStart: boolean;
  btnSelect: boolean;
  btnHome: boolean;
  btnMinus: boolean;
  btnPlus: boolean;
  btnOne: boolean; // Wiimote
  btnTwo: boolean; // Wiimote

  // Analog Sticks
  stickX: number; // -1 to 1
  stickY: number; // -1 to 1
  rightStickX: number;
  rightStickY: number;

  // Nunchuk & Motion
  btnC: boolean;
  btnZ: boolean;
  nunchukShake?: boolean;
  isShaking: boolean;
  swingAngle: number;
  pointerX: number; // 0 to 1
  pointerY: number; // 0 to 1
  pointerActive: boolean;

  // NDS Touch & Mic
  touchX: number; // 0 to 1 on bottom screen
  touchY: number; // 0 to 1 on bottom screen
  touchDown: boolean;
  micBlow: boolean;
}

export interface EmulationStats {
  fps: number;
  frameTimeMs: number;
  cpuUsagePct: number;
  gpuUsagePct: number;
  temperatureC: number;
  memoryMb: number;
  droppedFrames: number;
  drawCalls: number;
}
