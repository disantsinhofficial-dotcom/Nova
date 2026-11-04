import React, { useState } from 'react';
import { RomGame, EmulatorSettings } from '../types';
import { audioEngine } from '../engine/audioEngine';
import {
  Disc,
  Smile,
  Image as ImageIcon,
  ShoppingBag,
  CloudSun,
  Newspaper,
  Globe,
  HardDriveUpload,
  Play,
  Sparkles,
  Palette
} from 'lucide-react';

interface WiiChannelGridProps {
  games: RomGame[];
  selectedGame: RomGame;
  onSelectGame: (game: RomGame) => void;
  onLaunchGame: (game: RomGame) => void;
  onUploadRomClick: () => void;
  settings: EmulatorSettings;
}

export const WiiChannelGrid: React.FC<WiiChannelGridProps> = ({
  games,
  selectedGame,
  onSelectGame,
  onLaunchGame,
  onUploadRomClick,
  settings,
}) => {
  const [activeChannelModal, setActiveChannelModal] = useState<string | null>(null);
  const [miiConfig, setMiiConfig] = useState({
    name: 'Player 1',
    shirtColor: '#3b82f6',
    hairStyle: 'Spiky',
    glasses: true,
  });

  const isHindi = settings.language === 'hi';

  const channels = [
    {
      id: 'disc',
      title: 'Disc Channel',
      hindiTitle: 'डिस्क चैनल',
      sub: selectedGame.title,
      icon: Disc,
      accent: 'from-blue-600 to-indigo-700',
      isDisc: true,
    },
    {
      id: 'mii',
      title: 'Mii Channel',
      hindiTitle: 'मी चैनल (Mii Creator)',
      sub: 'Mii Plaza & Avatar Maker',
      icon: Smile,
      accent: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'sd_card',
      title: 'SD Card / Custom ROM',
      hindiTitle: 'एसडी कार्ड / रोम लोडर',
      sub: 'Load .ISO / .WBFS file',
      icon: HardDriveUpload,
      accent: 'from-cyan-600 to-blue-700',
    },
    {
      id: 'weather',
      title: 'Forecast Channel',
      hindiTitle: 'मौसम चैनल',
      sub: 'Globe Weather 24°C Sunny',
      icon: CloudSun,
      accent: 'from-sky-500 to-blue-600',
    },
    {
      id: 'news',
      title: 'News Channel',
      hindiTitle: 'समाचार चैनल',
      sub: 'Gaming headlines & updates',
      icon: Newspaper,
      accent: 'from-amber-600 to-orange-700',
    },
    {
      id: 'shop',
      title: 'Wii Shop Channel',
      hindiTitle: 'वि शॉप चैनल',
      sub: 'Virtual Console Catalog',
      icon: ShoppingBag,
      accent: 'from-blue-700 to-indigo-800',
    },
    {
      id: 'photo',
      title: 'Photo Channel',
      hindiTitle: 'फ़ोटो चैनल',
      sub: 'Snapshots & Memories',
      icon: ImageIcon,
      accent: 'from-rose-600 to-pink-700',
    },
    {
      id: 'internet',
      title: 'Internet Channel',
      hindiTitle: 'इंटरनेट चैनल',
      sub: 'Web Browser Powered',
      icon: Globe,
      accent: 'from-teal-600 to-emerald-700',
    },
  ];

  const handleChannelClick = (chId: string) => {
    audioEngine.playChannelDing();
    if (chId === 'disc') {
      onLaunchGame(selectedGame);
    } else if (chId === 'sd_card') {
      onUploadRomClick();
    } else {
      setActiveChannelModal(chId);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-6">
      {/* 4x2 Grid of Iconic Wii Channels */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isSelectedDisc = ch.isDisc;

          return (
            <div
              key={ch.id}
              onMouseEnter={() => audioEngine.playWiimoteHover()}
              onClick={() => handleChannelClick(ch.id)}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 p-4 border border-white/10 shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-sky-400 hover:shadow-sky-500/20 active:scale-95 ${
                isSelectedDisc ? 'ring-2 ring-blue-500/80 bg-blue-950/20' : ''
              }`}
            >
              {/* Channel Corner Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-sky-300">
                  {isHindi ? ch.hindiTitle : ch.title}
                </span>
                {isSelectedDisc && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>

              {/* Channel Center Visual */}
              <div className="my-6 flex flex-col items-center justify-center text-center">
                {isSelectedDisc ? (
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 shadow-xl group-hover:rotate-180 transition-transform duration-700">
                    <Disc className="h-10 w-10 text-white animate-spin" style={{ animationDuration: '6s' }} />
                    <div className="absolute h-4 w-4 rounded-full bg-gray-950 border-2 border-white" />
                  </div>
                ) : (
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${ch.accent} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={26} />
                  </div>
                )}
              </div>

              {/* Subtitle / Action */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[11px]">
                <span className="truncate font-semibold text-gray-300 group-hover:text-white">
                  {ch.sub}
                </span>
                {isSelectedDisc ? (
                  <span className="flex items-center gap-1 font-bold text-sky-400">
                    <Play size={12} />
                    <span>PLAY</span>
                  </span>
                ) : (
                  <span className="text-gray-500 group-hover:text-sky-400">OPEN</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Mii Channel Modal */}
      {activeChannelModal === 'mii' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-gray-900 border border-white/10 p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Smile className="text-emerald-400" size={24} />
                <h3 className="font-bold text-lg">Mii Channel (मी क्रिएटर)</h3>
              </div>
              <button
                onClick={() => setActiveChannelModal(null)}
                className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {/* Mii Preview Avatar */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-950 rounded-2xl border border-white/5 mb-4">
              <div
                className="h-24 w-24 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white/20 transition-colors"
                style={{ backgroundColor: miiConfig.shirtColor }}
              >
                <div className="h-10 w-10 rounded-full bg-amber-200 border border-amber-400 flex items-center justify-center text-gray-900 font-bold text-xs shadow-inner">
                  {miiConfig.glasses ? '👓' : '👀'}
                </div>
                <span className="mt-1 text-[10px] font-black text-white uppercase tracking-wider">
                  {miiConfig.name}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-400">Registered to Wiimote Player 1</p>
            </div>

            {/* Customizer */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Mii Name</label>
                <input
                  type="text"
                  value={miiConfig.name}
                  onChange={(e) => setMiiConfig({ ...miiConfig, name: e.target.value })}
                  className="w-full rounded-xl bg-gray-800 border border-white/10 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Shirt Color</label>
                <div className="flex gap-2">
                  {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        audioEngine.playWiimoteClick();
                        setMiiConfig({ ...miiConfig, shirtColor: col });
                      }}
                      className="h-8 w-8 rounded-full border-2 border-white/30 hover:scale-110 transition-transform"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                audioEngine.playWiimoteClick();
                setActiveChannelModal(null);
              }}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-2.5 font-bold text-gray-950 hover:bg-emerald-400 transition"
            >
              Save Mii to Wiimote 1
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
