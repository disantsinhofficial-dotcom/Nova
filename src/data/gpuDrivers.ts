import { GpuDriver } from '../types';

export const DEFAULT_GPU_DRIVERS: GpuDriver[] = [
  {
    id: 'turnip_v24_3',
    name: 'Mesa Turnip Driver (Adreno)',
    version: 'v24.3.0-devel-turnip',
    vendor: 'Mesa Turnip',
    api: 'Vulkan 1.3',
    description: 'Best performance & zero graphical bugs for Snapdragon 8 Gen 1/2/3, 888, 870, 865, and 7+ Gen. Multi-threaded shader pipeline.',
    hindiDescription: 'स्नैपड्रैगन / एड्रेनो के लिए सबसे बेस्ट ड्राइवर! 0% लैग और सबसे ज़्यादा FPS देता है।',
    stabilityRating: 'Ultra High FPS',
    isDefault: true,
  },
  {
    id: 'qualcomm_system_v744',
    name: 'ColorOS 13 Qualcomm System Driver',
    version: 'v744.12-proprietary',
    vendor: 'Qualcomm',
    api: 'Vulkan 1.3',
    description: 'Official OEM system driver from ColorOS 13 / OxygenOS firmware. Highest power efficiency and thermal cooling.',
    hindiDescription: 'कलर ओएस 13 ऑफिशियल सिस्टम ड्राइवर। लंबी बैटरी लाइफ और स्टेबल परफॉरमेंस।',
    stabilityRating: 'Maximum (Zero Crash)',
  },
  {
    id: 'arm_mali_valhall',
    name: 'Arm Mali Valhall/Bifrost Driver',
    version: 'v32.0.0-r38p0',
    vendor: 'Arm Mali',
    api: 'Vulkan 1.3',
    description: 'Optimized for MediaTek Dimensity 9000/9200/8100/1200 and Mali-G710/G78 GPUs. Threaded command buffers.',
    hindiDescription: 'मीडियाटेक डाइमेंसिटी और माली चिपसेट्स के लिए कस्टमाइज्ड ड्राइवर।',
    stabilityRating: 'Optimal Balance',
  },
  {
    id: 'vulkan_safe_universal',
    name: 'Universal Vulkan 1.3 Safe Driver',
    version: 'v1.3.280-safe-icd',
    vendor: 'Vulkan Generic',
    api: 'Vulkan 1.3',
    description: 'Fail-safe driver profile. Disables experimental extensions to prevent any device driver crashes or black screens.',
    hindiDescription: 'सेफ फॉलबैक ड्राइवर — कभी क्रैश या हैंग नहीं होता। 100% स्टेबल।',
    stabilityRating: 'Maximum (Zero Crash)',
  }
];

export const DEFAULT_CUSTOM_LAYOUT = {
  dpad: { x: 12, y: 16, scale: 1.0, visible: true },
  analogStick: { x: 12, y: 16, scale: 1.0, visible: true },
  faceButtons: { x: 88, y: 16, scale: 1.0, visible: true },
  wiimote: { x: 88, y: 24, scale: 1.0, visible: true },
  nunchuk: { x: 12, y: 18, scale: 1.0, visible: true },
  shoulderL: { x: 8, y: 72, scale: 1.0, visible: true },
  shoulderR: { x: 92, y: 72, scale: 1.0, visible: true },
  menuButtons: { x: 50, y: 5, scale: 1.0, visible: true },
  extraTriggers: { x: 18, y: 38, scale: 1.0, visible: true },
};

export const PHONE_THUMB_PRESET = {
  dpad: { x: 10, y: 14, scale: 0.95, visible: true },
  analogStick: { x: 10, y: 14, scale: 0.95, visible: true },
  faceButtons: { x: 90, y: 14, scale: 0.95, visible: true },
  wiimote: { x: 90, y: 22, scale: 0.95, visible: true },
  nunchuk: { x: 10, y: 16, scale: 0.95, visible: true },
  shoulderL: { x: 7, y: 68, scale: 0.9, visible: true },
  shoulderR: { x: 93, y: 68, scale: 0.9, visible: true },
  menuButtons: { x: 50, y: 5, scale: 0.9, visible: true },
  extraTriggers: { x: 16, y: 36, scale: 0.9, visible: true },
};

export const TABLET_WIDE_PRESET = {
  dpad: { x: 14, y: 18, scale: 1.2, visible: true },
  analogStick: { x: 14, y: 18, scale: 1.2, visible: true },
  faceButtons: { x: 86, y: 18, scale: 1.2, visible: true },
  wiimote: { x: 86, y: 26, scale: 1.15, visible: true },
  nunchuk: { x: 14, y: 20, scale: 1.15, visible: true },
  shoulderL: { x: 10, y: 76, scale: 1.1, visible: true },
  shoulderR: { x: 90, y: 76, scale: 1.1, visible: true },
  menuButtons: { x: 50, y: 6, scale: 1.0, visible: true },
  extraTriggers: { x: 22, y: 44, scale: 1.1, visible: true },
};
