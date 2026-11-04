import React from 'react';
import { audioEngine } from '../engine/audioEngine';
import { EmulatorSettings } from '../types';
import { Volume2, VolumeX, RotateCcw, Home, X, Gamepad2 } from 'lucide-react';

interface WiiHomeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReturnToMenu: () => void;
  onResetGame: () => void;
  onOpenControllerStudio?: () => void;
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
}

export const WiiHomeMenu: React.FC<WiiHomeMenuProps> = ({
  isOpen,
  onClose,
  onReturnToMenu,
  onResetGame,
  onOpenControllerStudio,
  settings,
  setSettings,
}) => {
  if (!isOpen) return null;

  const isHindi = settings.language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      {/* Wii Home Dialog Box */}
      <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-gray-200 to-gray-300 p-6 text-gray-800 shadow-2xl border-4 border-white/60">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-400/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <span className="text-xl">🏠</span>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-gray-900">
                {isHindi ? 'वि होम मेनू' : 'Wii HOME Menu'}
              </h2>
              <p className="text-xs text-gray-600">
                {isHindi ? 'कलर ओएस 13 वि एम्युलेटर' : 'ColorOS 13 HyperBoost Emulation'}
              </p>
            </div>
          </div>

          {/* Wiimote 1 Battery Indicator */}
          <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-1.5 shadow-sm border border-gray-300">
            <span className="text-[11px] font-bold text-gray-700">P1 Wiimote</span>
            <div className="flex gap-1">
              <div className="h-4 w-2 rounded-sm bg-blue-500 shadow-sm" />
              <div className="h-4 w-2 rounded-sm bg-blue-500 shadow-sm" />
              <div className="h-4 w-2 rounded-sm bg-blue-500 shadow-sm" />
              <div className="h-4 w-2 rounded-sm bg-blue-500 shadow-sm" />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="my-6 grid grid-cols-2 gap-4">
          {/* Wii Menu Button */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onReturnToMenu();
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-white to-gray-100 p-5 shadow-lg border-2 border-gray-300 hover:border-blue-500 hover:shadow-blue-500/20 active:scale-95 transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-black group-hover:scale-110 transition-transform">
              <Home size={22} />
            </div>
            <span className="text-base font-bold text-gray-900">
              {isHindi ? 'वि मेनू (Wii Menu)' : 'Wii Menu'}
            </span>
            <span className="text-[11px] text-gray-500 text-center">
              {isHindi ? 'गेम से बाहर निकलें' : 'Exit to Channel Grid'}
            </span>
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onResetGame();
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-white to-gray-100 p-5 shadow-lg border-2 border-gray-300 hover:border-amber-500 hover:shadow-amber-500/20 active:scale-95 transition group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white text-lg font-black group-hover:scale-110 transition-transform">
              <RotateCcw size={22} />
            </div>
            <span className="text-base font-bold text-gray-900">
              {isHindi ? 'रीसेट (Reset Game)' : 'Reset'}
            </span>
            <span className="text-[11px] text-gray-500 text-center">
              {isHindi ? 'गेम को फिर से शुरू करें' : 'Restart game from beginning'}
            </span>
          </button>
        </div>

        {/* Controller Layout & Wii Remote Customizer Button */}
        {onOpenControllerStudio && (
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onOpenControllerStudio();
            }}
            className="mb-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-3.5 text-xs font-black text-gray-950 shadow-md hover:from-amber-400 hover:to-orange-400 active:scale-95 transition"
          >
            <Gamepad2 size={18} />
            <span>{isHindi ? 'कंट्रोलर लेआउट एडिट & वि रिमोट बदलें (Edit Layout / Wii Remote)' : 'Edit Controller Layout & Wii Remote'}</span>
          </button>
        )}

        {/* Volume & Audio Settings */}
        <div className="rounded-2xl bg-white/80 p-4 shadow-sm border border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
              <Volume2 size={16} className="text-blue-600" />
              <span>{isHindi ? 'ऑडियो आवाज़ (Volume)' : 'Wii Remote / TV Sound'}</span>
            </span>
            <span className="text-xs font-mono font-bold text-blue-600">
              {Math.round(settings.audioVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.audioVolume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              audioEngine.setVolume(val);
              setSettings((prev) => ({ ...prev, audioVolume: val }));
            }}
            className="w-full accent-blue-600"
          />
        </div>

        {/* Close / Resume Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              onClose();
            }}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 px-8 py-3 text-sm font-black text-white shadow-lg hover:from-blue-500 hover:to-sky-500 active:scale-95 transition"
          >
            <X size={18} />
            <span>{isHindi ? 'गेम जारी रखें (Close / Resume)' : 'Close'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
