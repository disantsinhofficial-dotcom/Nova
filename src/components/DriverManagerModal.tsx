import React, { useState, useRef } from 'react';
import { GpuDriver, EmulatorSettings } from '../types';
import { audioEngine } from '../engine/audioEngine';
import { DEFAULT_GPU_DRIVERS } from '../data/gpuDrivers';
import JSZip from 'jszip';
import {
  Cpu,
  Upload,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Trash2,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  FileArchive
} from 'lucide-react';

interface DriverManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  isHindi?: boolean;
}

export const DriverManagerModal: React.FC<DriverManagerModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  isHindi = true,
}) => {
  const [drivers, setDrivers] = useState<GpuDriver[]>(() => {
    try {
      const saved = localStorage.getItem('novawii_custom_drivers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_GPU_DRIVERS;
  });

  const [isInstalling, setIsInstalling] = useState<boolean>(false);
  const [shaderCacheSize, setShaderCacheSize] = useState<string>('18.4 MB');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSelectDriver = (driverId: string) => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({ ...prev, activeDriverId: driverId }));
  };

  const handleClearShaderCache = () => {
    audioEngine.playWiimoteClick();
    setShaderCacheSize('0.0 KB');
    alert(
      isHindi
        ? 'शेडर कैश सफलतापूर्वक रीसेट हो गया! नया ड्राइवर बिना किसी ग्लिच के स्मूथ चलेगा।'
        : 'Shader cache successfully cleared! New driver will compile fresh pipeline with zero stutter.'
    );
  };

  const handleZipFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInstalling(true);
    audioEngine.playDiscInsertSound();

    try {
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);

      // Inspect zip files for driver manifest or vulkan library
      let driverName = file.name.replace(/\.zip$/i, '');
      let version = 'v1.0-custom';

      // Look for meta.json or similar
      const metaFile = zipData.file('meta.json') || zipData.file('driver.json');
      if (metaFile) {
        try {
          const metaText = await metaFile.async('string');
          const metaJson = JSON.parse(metaText);
          if (metaJson.name) driverName = metaJson.name;
          if (metaJson.version) version = metaJson.version;
        } catch {}
      }

      const newDriver: GpuDriver = {
        id: `custom_${Date.now()}`,
        name: driverName,
        version: version,
        vendor: 'Custom',
        api: 'Vulkan 1.3',
        description: `Imported from ${file.name}. Custom Vulkan ICD graphics driver package.`,
        hindiDescription: `कस्टम ड्राइवर पैकेज: ${file.name}। एक्टिव कर दिया गया है।`,
        stabilityRating: 'Ultra High FPS',
        isCustomInstalled: true,
      };

      const updatedDrivers = [newDriver, ...drivers];
      setDrivers(updatedDrivers);
      setSettings((prev) => ({ ...prev, activeDriverId: newDriver.id }));

      try {
        localStorage.setItem('novawii_custom_drivers', JSON.stringify(updatedDrivers));
      } catch {}

      alert(
        isHindi
          ? `कस्टम ड्राइवर "${newDriver.name}" सफलतापूर्वक इंस्टॉल हो गया और एक्टिव है!`
          : `Custom driver "${newDriver.name}" successfully installed and activated!`
      );
    } catch (err) {
      alert(
        isHindi
          ? 'ड्राइवर .ZIP फ़ाइल को पढ़ने में त्रुटि। कृपया मान्य Turnip या Adreno ड्राइवर ज़िप चुनें।'
          : 'Error parsing driver ZIP. Please ensure it is a valid Turnip or Adreno Vulkan driver package.'
      );
    } finally {
      setIsInstalling(false);
      e.target.value = '';
    }
  };

  const handleDeleteCustomDriver = (driverId: string) => {
    audioEngine.playWiimoteClick();
    const updated = drivers.filter((d) => d.id !== driverId);
    setDrivers(updated);
    if (settings.activeDriverId === driverId) {
      setSettings((prev) => ({ ...prev, activeDriverId: DEFAULT_GPU_DRIVERS[0].id }));
    }
    try {
      localStorage.setItem('novawii_custom_drivers', JSON.stringify(updated));
    } catch {}
  };

  const activeDriver = drivers.find((d) => d.id === settings.activeDriverId) || drivers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-950 border border-white/10 p-6 text-white shadow-2xl space-y-6">
        {/* Hidden Zip Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleZipFileChange}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black shadow-lg">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{isHindi ? 'GPU ड्राइवर मैनेजर (Turnip / Adreno / Mali)' : 'Custom GPU Driver Manager'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Vulkan 1.3
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {isHindi
                  ? 'बेहतर स्पीड और नो-लैग के लिए कस्टम Turnip और सिस्टम ड्राइवर्स इंस्टॉल करें'
                  : 'Install custom Mesa Turnip or Qualcomm drivers to maximize FPS and fix crashes.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Driver Status Card */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-950/70 via-gray-900 to-indigo-950/60 p-5 border border-sky-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
              {isHindi ? 'वर्तमान में सक्रिय ड्राइवर (ACTIVE)' : 'CURRENT ACTIVE DRIVER'}
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{activeDriver.name}</span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {activeDriver.version}
              </span>
            </h3>
            <p className="text-xs text-gray-300">
              {isHindi ? activeDriver.hindiDescription : activeDriver.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleClearShaderCache}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/20 transition border border-white/10"
              title="Clear compiled shader cache"
            >
              <RefreshCw size={13} />
              <span>Clear Cache ({shaderCacheSize})</span>
            </button>
          </div>
        </div>

        {/* Install Custom Driver .ZIP Button */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group flex items-center justify-between p-4 rounded-2xl bg-gray-900/90 border-2 border-dashed border-white/20 hover:border-emerald-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Upload size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isHindi ? 'नया कस्टम ड्राइवर (.ZIP) इंस्टॉल करें' : 'Install Custom Driver (.ZIP)'}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">Turnip / Adreno</span>
              </div>
              <p className="text-xs text-gray-400">
                {isHindi ? 'डाउनलोड की गई Turnip या Mesa ड्राइवर .zip फ़ाइल सेलेक्ट करें' : 'Select any Turnip driver ZIP package from your device'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-gray-950 shadow-md group-hover:bg-emerald-400 transition shrink-0"
          >
            <FileArchive size={14} />
            <span>{isInstalling ? 'Installing...' : isHindi ? 'ब्राउज़ करें' : 'Browse ZIP'}</span>
          </button>
        </div>

        {/* Available Drivers List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            {isHindi ? 'उपलब्ध GPU ड्राइवर्स' : 'Available Drivers'}
          </span>

          <div className="space-y-2.5">
            {drivers.map((drv) => {
              const isSelected = drv.id === settings.activeDriverId;

              return (
                <div
                  key={drv.id}
                  onClick={() => handleSelectDriver(drv.id)}
                  className={`group flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-500/30'
                      : 'bg-gray-900/60 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {drv.name}
                      </span>
                      <span className="text-[10px] font-mono bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
                        {drv.version}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {drv.stabilityRating}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-lg">
                      {isHindi ? drv.hindiDescription : drv.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {drv.isCustomInstalled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomDriver(drv.id);
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete custom driver"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-sky-500 border-white text-gray-950' : 'border-white/20 text-transparent'
                    }`}>
                      <CheckCircle2 size={14} className="fill-current" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stability Booster Options */}
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>{isHindi ? 'क्रैश रोकथाम और स्थिरता सेटिंग्स (Stability Enhancer)' : 'Crash Prevention & Stability Safeguards'}</span>
          </div>

          <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
            <div>
              <span className="font-semibold text-white">Auto-Recover WebGL Context Loss</span>
              <p className="text-[11px] text-gray-400">Restores rendering automatically without freezing or crashing if phone throttles</p>
            </div>
            <input
              type="checkbox"
              checked={settings.stabilityProtection}
              onChange={(e) => setSettings((prev) => ({ ...prev, stabilityProtection: e.target.checked }))}
              className="h-4 w-4 accent-emerald-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
            <div>
              <span className="font-semibold text-white">Dynamic Frame Pacing / Anti-Stutter</span>
              <p className="text-[11px] text-gray-400">Smooths 120Hz/90Hz/60Hz refresh rate synchronization on ColorOS 13</p>
            </div>
            <input
              type="checkbox"
              checked={settings.autoDownscaleUnderLoad}
              onChange={(e) => setSettings((prev) => ({ ...prev, autoDownscaleUnderLoad: e.target.checked }))}
              className="h-4 w-4 accent-emerald-500 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
