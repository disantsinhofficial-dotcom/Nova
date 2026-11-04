import React, { useState, useEffect } from 'react';
import { EmulatorSettings } from '../types';
import { audioEngine } from '../engine/audioEngine';
import {
  Wifi,
  Battery,
  Flame,
  Volume2,
  VolumeX,
  Languages,
  SlidersHorizontal,
  Home,
  Cpu,
  Gamepad2
} from 'lucide-react';

interface HeaderProps {
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  onToggleHyperBoost: () => void;
  onHomeClick: () => void;
  onOpenApkModal: () => void;
  onOpenDriverModal: () => void;
  onOpenControllerStudio: () => void;
  isPlaying: boolean;
  currentGameTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  setSettings,
  onToggleHyperBoost,
  onHomeClick,
  onOpenApkModal,
  onOpenDriverModal,
  onOpenControllerStudio,
  isPlaying,
  currentGameTitle
}) => {
  const [timeStr, setTimeStr] = useState<string>('12:00');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleLanguage = () => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({
      ...prev,
      language: prev.language === 'hi' ? 'en' : 'hi'
    }));
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audioEngine.setMuted(newMuted);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      {/* 1. Android ColorOS 13 System Status Bar */}
      <div className="flex h-6 items-center justify-between px-4 text-[11px] font-semibold text-gray-400 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-200">{timeStr}</span>
          <span className="hidden sm:inline text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
            ColorOS 13.1
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold">HyperBoost ON</span>
          </div>
          <span className="text-[10px] text-gray-300 font-mono">5G</span>
          <Wifi size={13} className="text-gray-300" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-300 font-mono">100%</span>
            <Battery size={14} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <span className="text-lg">🐬</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-white group-hover:text-sky-300 transition-colors">
                NovaWii HD
              </span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-sky-400 border border-sky-500/30">
                PRO 60 FPS
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              {isPlaying && currentGameTitle ? currentGameTitle : 'Android ColorOS 13 Edition'}
            </p>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 rounded-xl bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition border border-white/5"
            title="Switch Language (Hindi / English)"
          >
            <Languages size={14} className="text-sky-400" />
            <span>{settings.language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition border border-white/5"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={15} className="text-rose-400" /> : <Volume2 size={15} className="text-sky-400" />}
          </button>

          {/* Controller Studio / Wii Remote Layout Editor */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onOpenControllerStudio();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2.5 py-1.5 text-xs font-black text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 transition border border-amber-500/40 shadow-sm"
            title="कंट्रोलर लेआउट एडिट & वि रिमोट (Controller Layout & Wii Remote)"
          >
            <Gamepad2 size={14} className="text-amber-400" />
            <span className="hidden sm:inline">वि रिमोट / Controls</span>
          </button>

          {/* GPU Driver Manager Trigger */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onOpenDriverModal();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-white/20 transition border border-sky-400/30"
            title="GPU Driver Manager (Turnip / Adreno)"
          >
            <Cpu size={14} className="text-sky-400" />
            <span className="hidden md:inline">Drivers</span>
          </button>

          {/* APK & GitHub Download Modal Trigger */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onOpenApkModal();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition"
            title="Download APK / GitHub Link"
          >
            <span className="text-sm">📥</span>
            <span className="font-bold">APK / GitHub</span>
          </button>

          {/* HyperBoost Assistant Trigger */}
          <button
            onClick={onToggleHyperBoost}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-blue-500 active:scale-95 transition"
          >
            <Flame size={14} className="text-amber-300" />
            <span className="hidden sm:inline">HyperBoost</span>
          </button>
        </div>
      </div>
    </header>
  );
};
