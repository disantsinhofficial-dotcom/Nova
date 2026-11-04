import React, { useState, useEffect } from 'react';
import {
  EmulatorSettings,
  HyperBoostMode,
  GraphicsBackend,
  ResolutionScale,
  EmulationStats,
  SaveState
} from '../types';
import { audioEngine } from '../engine/audioEngine';
import {
  Flame,
  Zap,
  BatteryCharging,
  Cpu,
  Monitor,
  Volume2,
  VolumeX,
  Camera,
  Save,
  Download,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Layers,
  Sparkles,
  Gamepad2
} from 'lucide-react';

interface HyperBoostPanelProps {
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  stats: EmulationStats;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentGameTitle?: string;
  onTakeScreenshot: () => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onOpenControllerStudio?: () => void;
  saveStates: SaveState[];
}

export const HyperBoostPanel: React.FC<HyperBoostPanelProps> = ({
  settings,
  setSettings,
  stats,
  isOpen,
  setIsOpen,
  currentGameTitle,
  onTakeScreenshot,
  onQuickSave,
  onQuickLoad,
  onOpenControllerStudio,
  saveStates
}) => {
  const [activeTab, setActiveTab] = useState<'PERF' | 'GRAPHICS' | 'SAVES' | 'CHEATS'>('PERF');
  const [cheats, setCheats] = useState({
    infiniteLives: true,
    maxBoost: true,
    allPinsStrike: false,
    invincibleMario: false
  });

  const isHindi = settings.language === 'hi';

  const selectMode = (mode: HyperBoostMode) => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({
      ...prev,
      hyperBoostMode: mode,
      targetFps: mode === 'battery_saver' ? 30 : 60
    }));
  };

  const selectResolution = (scale: ResolutionScale) => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({ ...prev, resolutionScale: scale }));
  };

  const selectBackend = (backend: GraphicsBackend) => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({ ...prev, graphicsBackend: backend }));
  };

  return (
    <>
      {/* Floating Edge Tab (ColorOS 13 Side Pull Bar) */}
      {!isOpen && (
        <button
          onClick={() => {
            audioEngine.playWiimoteClick();
            setIsOpen(true);
          }}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1 rounded-r-2xl bg-gradient-to-r from-sky-600/90 to-blue-700/90 px-2 py-3.5 text-white shadow-xl shadow-sky-500/20 backdrop-blur-md border-y border-r border-sky-400/40 hover:translate-x-1 transition-transform group"
          title="ColorOS 13 HyperBoost Game Assistant"
        >
          <div className="flex flex-col items-center gap-1 text-[10px] font-black tracking-widest uppercase writing-vertical">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white text-[9px]">BOOST</span>
          </div>
          <ChevronRight size={14} className="text-sky-200 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Slide-out HyperBoost Assistant Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm sm:max-w-md flex-col bg-gray-950/95 backdrop-blur-2xl border-r border-white/10 text-gray-100 shadow-2xl animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 shadow-md">
                <Flame className="h-5 w-5 text-gray-950" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>ColorOS 13 HyperBoost</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    O-Sync 2.0
                  </span>
                </h3>
                <p className="text-[11px] text-gray-400">
                  {isHindi ? 'वि गेम्स टर्बो इंजन • नो लैग' : 'Zero-Lag Wii 60 FPS Engine'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-4 gap-2 border-b border-white/10 bg-gray-900/50 p-3">
            <div className="flex flex-col items-center rounded-xl bg-black/40 p-2 border border-white/5">
              <span className="text-[10px] font-medium text-gray-400">FPS</span>
              <span className="text-base font-extrabold text-emerald-400">
                {stats.fps.toFixed(1)}
              </span>
              <span className="text-[9px] text-gray-500">60 Hz</span>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-black/40 p-2 border border-white/5">
              <span className="text-[10px] font-medium text-gray-400">CPU</span>
              <span className="text-base font-extrabold text-sky-400">
                {stats.cpuUsagePct}%
              </span>
              <span className="text-[9px] text-gray-500">2.84 GHz</span>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-black/40 p-2 border border-white/5">
              <span className="text-[10px] font-medium text-gray-400">GPU</span>
              <span className="text-base font-extrabold text-amber-400">
                {stats.gpuUsagePct}%
              </span>
              <span className="text-[9px] text-gray-500">Vulkan</span>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-black/40 p-2 border border-white/5">
              <span className="text-[10px] font-medium text-gray-400">TEMP</span>
              <span className="text-base font-extrabold text-cyan-400">
                {stats.temperatureC.toFixed(1)}°C
              </span>
              <span className="text-[9px] text-emerald-400 font-semibold">Cool</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-gray-900/80 px-2 py-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('PERF')}
              className={`flex-1 py-1.5 text-center rounded-lg transition ${
                activeTab === 'PERF' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isHindi ? 'परफॉरमेंस' : 'Performance'}
            </button>
            <button
              onClick={() => setActiveTab('GRAPHICS')}
              className={`flex-1 py-1.5 text-center rounded-lg transition ${
                activeTab === 'GRAPHICS' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isHindi ? 'ग्राफ़िक्स HD' : 'Graphics HD'}
            </button>
            <button
              onClick={() => setActiveTab('SAVES')}
              className={`flex-1 py-1.5 text-center rounded-lg transition ${
                activeTab === 'SAVES' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isHindi ? 'सेव स्टेट' : 'Save States'}
            </button>
            <button
              onClick={() => setActiveTab('CHEATS')}
              className={`flex-1 py-1.5 text-center rounded-lg transition ${
                activeTab === 'CHEATS' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-gray-400 hover:text-white'
              }`}
            >
              {isHindi ? 'चीट्स' : 'Cheats'}
            </button>
          </div>

          {/* Scrollable Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'PERF' && (
              <div className="space-y-4">
                {/* HyperBoost Mode Toggles */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    {isHindi ? 'गेमिंग मोड (ColorOS 13)' : 'Gaming Profiles'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => selectMode('pro_gamer')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition ${
                        settings.hyperBoostMode === 'pro_gamer'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Zap className="h-5 w-5 mb-1 text-rose-400" />
                      <span className="text-xs font-bold">Pro Gamer</span>
                      <span className="text-[10px] text-gray-400">Solid 60 FPS</span>
                    </button>

                    <button
                      onClick={() => selectMode('balanced')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition ${
                        settings.hyperBoostMode === 'balanced'
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <Layers className="h-5 w-5 mb-1 text-sky-400" />
                      <span className="text-xs font-bold">Balanced</span>
                      <span className="text-[10px] text-gray-400">Cool Thermals</span>
                    </button>

                    <button
                      onClick={() => selectMode('battery_saver')}
                      className={`flex flex-col items-center p-3 rounded-xl border text-center transition ${
                        settings.hyperBoostMode === 'battery_saver'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <BatteryCharging className="h-5 w-5 mb-1 text-emerald-400" />
                      <span className="text-xs font-bold">Battery Saver</span>
                      <span className="text-[10px] text-gray-400">Low Power</span>
                    </button>
                  </div>
                </div>

                {/* Speed Hacks */}
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-sky-400 flex items-center justify-between">
                    <span>{isHindi ? 'स्पीड हैक्स (JIT कंपाइलर)' : 'Speed Hacks (Zero Lag)'}</span>
                    <span className="text-[10px] bg-sky-500/20 px-2 py-0.5 rounded text-sky-300">ACTIVE</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                      <span>Skip EFB Access from CPU</span>
                      <input
                        type="checkbox"
                        checked={settings.skipEfbAccess}
                        onChange={(e) => setSettings((prev) => ({ ...prev, skipEfbAccess: e.target.checked }))}
                        className="h-4 w-4 accent-sky-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                      <span>Fast Depth Calculation (Z-Buffer)</span>
                      <input
                        type="checkbox"
                        checked={settings.fastDepthCalc}
                        onChange={(e) => setSettings((prev) => ({ ...prev, fastDepthCalc: e.target.checked }))}
                        className="h-4 w-4 accent-sky-500 rounded"
                      />
                    </label>

                    <label className="flex items-center justify-between text-gray-300 cursor-pointer">
                      <span>Vertex Streaming Pipeline Hack</span>
                      <input
                        type="checkbox"
                        checked={settings.vertexStreamingHack}
                        onChange={(e) => setSettings((prev) => ({ ...prev, vertexStreamingHack: e.target.checked }))}
                        className="h-4 w-4 accent-sky-500 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={onTakeScreenshot}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/10 p-2.5 text-xs font-semibold text-gray-200 hover:bg-white/20 transition"
                  >
                    <Camera size={15} />
                    <span>{isHindi ? 'स्क्रीनशॉट' : 'Screenshot'}</span>
                  </button>

                  <button
                    onClick={() => {
                      audioEngine.playWiimoteClick();
                      setSettings((prev) => ({ ...prev, hapticFeedback: !prev.hapticFeedback }));
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-semibold transition ${
                      settings.hapticFeedback
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    <Sparkles size={15} />
                    <span>{settings.hapticFeedback ? 'Haptics ON' : 'Haptics OFF'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'GRAPHICS' && (
              <div className="space-y-4">
                {/* Resolution Multiplier */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    {isHindi ? 'रेसोल्यूशन स्केलिंग' : 'Internal Resolution Multiplier'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { scale: 1 as const, label: '1x Native', sub: '480p' },
                      { scale: 2 as const, label: '2x HD', sub: '720p' },
                      { scale: 3 as const, label: '3x FHD', sub: '1080p' },
                      { scale: 4 as const, label: '4x UHD', sub: '4K' },
                    ].map((item) => (
                      <button
                        key={item.scale}
                        onClick={() => selectResolution(item.scale)}
                        className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition ${
                          settings.resolutionScale === item.scale
                            ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] text-gray-500">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graphics Backend */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    {isHindi ? 'ग्राफ़िक्स बैकएंड' : 'Graphics Backend API'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => selectBackend('vulkan')}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.graphicsBackend === 'vulkan'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Vulkan 1.3</span>
                        <span className="text-[9px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">ColorOS 13 Recom.</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Lowest CPU overhead & fast frame pacing</p>
                    </button>

                    <button
                      onClick={() => selectBackend('opengles')}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.graphicsBackend === 'opengles'
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold">OpenGL ES 3.2</div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Universal fallback compatibility</p>
                    </button>
                  </div>
                </div>

                {/* Post Processing Filters */}
                <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 space-y-3">
                  <div className="text-xs font-semibold text-gray-300">
                    {isHindi ? 'पोस्ट-प्रोसेसिंग शेडर फ़िल्टर्स' : 'Shader Filters & Enhancements'}
                  </div>

                  <label className="flex items-center justify-between text-xs text-gray-300 cursor-pointer">
                    <span>CRT Scanlines Filter (Retro Arcade Look)</span>
                    <input
                      type="checkbox"
                      checked={settings.crtFilter}
                      onChange={(e) => setSettings((prev) => ({ ...prev, crtFilter: e.target.checked }))}
                      className="h-4 w-4 accent-sky-500 rounded"
                    />
                  </label>

                  <div>
                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                      <span>Anisotropic Texture Filtering</span>
                      <span className="font-bold text-sky-400">{settings.anisotropicFiltering}x</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      step={4}
                      value={settings.anisotropicFiltering}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          anisotropicFiltering: Number(e.target.value) as 0 | 4 | 8 | 16
                        }))
                      }
                      className="w-full accent-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SAVES' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={onQuickSave}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 p-2.5 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-blue-500 transition"
                  >
                    <Save size={15} />
                    <span>{isHindi ? 'त्वरित सेव (F1)' : 'Quick Save (F1)'}</span>
                  </button>

                  <button
                    onClick={onQuickLoad}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    <Download size={15} />
                    <span>{isHindi ? 'त्वरित लोड (F2)' : 'Quick Load (F2)'}</span>
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                    {isHindi ? 'सेव स्टेट स्लॉट्स (1-5)' : 'Save State Slots'}
                  </label>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((slot) => {
                      const existing = saveStates.find((s) => s.slot === slot);
                      return (
                        <div
                          key={slot}
                          className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 border border-white/10"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-400">
                              {slot}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-200">
                                {existing ? existing.gameTitle : `Slot ${slot}: Empty`}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {existing ? existing.timestamp : 'Ready to record state'}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={onQuickSave}
                              className="rounded-lg bg-sky-600/30 px-2 py-1 text-[10px] font-semibold text-sky-300 hover:bg-sky-600/50"
                            >
                              Save
                            </button>
                            {existing && (
                              <button
                                onClick={onQuickLoad}
                                className="rounded-lg bg-emerald-600/30 px-2 py-1 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-600/50"
                              >
                                Load
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CHEATS' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  {isHindi ? 'एक्शन रीप्ले / गीको चीट्स' : 'Action Replay / Gecko Cheat Codes'}
                </div>

                <div className="space-y-2 text-xs">
                  <label className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 cursor-pointer">
                    <div>
                      <div className="font-semibold text-amber-300">Infinite Health & Hearts</div>
                      <div className="text-[10px] text-gray-400">Never take damage in Zelda & Mario</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cheats.infiniteLives}
                      onChange={(e) => setCheats((prev) => ({ ...prev, infiniteLives: e.target.checked }))}
                      className="h-4 w-4 accent-amber-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 cursor-pointer">
                    <div>
                      <div className="font-semibold text-sky-300">Unlimited Mini-Turbo Boost</div>
                      <div className="text-[10px] text-gray-400">Instant top-speed boost in Mario Kart</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cheats.maxBoost}
                      onChange={(e) => setCheats((prev) => ({ ...prev, maxBoost: e.target.checked }))}
                      className="h-4 w-4 accent-sky-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 cursor-pointer">
                    <div>
                      <div className="font-semibold text-emerald-300">Perfect Bowling Strike Assist</div>
                      <div className="text-[10px] text-gray-400">Magnetic pin trajectory for 300 game</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={cheats.allPinsStrike}
                      onChange={(e) => setCheats((prev) => ({ ...prev, allPinsStrike: e.target.checked }))}
                      className="h-4 w-4 accent-emerald-500 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controller Sliders */}
          <div className="border-t border-white/10 bg-gray-900/90 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{isHindi ? 'ऑन-स्क्रीन कंट्रोल्स ओपेसिटी' : 'Virtual Controller Opacity'}</span>
              <span className="font-mono text-sky-400">{Math.round(settings.controllerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.05}
              value={settings.controllerOpacity}
              onChange={(e) => setSettings((prev) => ({ ...prev, controllerOpacity: parseFloat(e.target.value) }))}
              className="w-full accent-sky-500"
            />

            {onOpenControllerStudio && (
              <button
                onClick={() => {
                  audioEngine.playWiimoteClick();
                  setIsOpen(false);
                  onOpenControllerStudio();
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-black text-gray-950 shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-95 transition"
              >
                <Gamepad2 size={15} />
                <span>{isHindi ? 'कंट्रोलर लेआउट एडिट & वि रिमोट (Move/Resize)' : 'Edit Layout & Wii Remote Studio'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
