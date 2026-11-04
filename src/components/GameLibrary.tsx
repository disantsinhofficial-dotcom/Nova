import React, { useRef, useState } from 'react';
import { RomGame, EmulatorSettings, SystemType } from '../types';
import { audioEngine } from '../engine/audioEngine';
import { parseRomFile } from '../engine/romLoader';
import {
  Play,
  Upload,
  HardDrive,
  Gamepad2,
  Sparkles,
  FileCode,
  Flame,
  Trash2,
  CheckCircle2,
  Layers,
  Smartphone,
  Plus
} from 'lucide-react';

interface GameLibraryProps {
  games: RomGame[];
  onSelectAndLaunch: (game: RomGame) => void;
  onAddCustomGame: (game: RomGame) => void;
  onDeleteGame?: (id: string) => void;
  settings: EmulatorSettings;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const GameLibrary: React.FC<GameLibraryProps> = ({
  games,
  onSelectAndLaunch,
  onAddCustomGame,
  onDeleteGame,
  settings,
  fileInputRef,
}) => {
  const [filterSystem, setFilterSystem] = useState<'ALL' | 'WII' | 'NDS'>('ALL');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsingRom, setIsParsingRom] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const isHindi = settings.language === 'hi';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processMultipleFiles(Array.from(files));
    e.target.value = ''; // Reset input
  };

  const processMultipleFiles = async (files: File[]) => {
    setIsParsingRom(true);
    audioEngine.playDiscInsertSound();

    let lastAddedGame: RomGame | null = null;
    let count = 0;

    for (const file of files) {
      try {
        setImportStatus(`Parsing ${file.name}...`);
        const parsed = await parseRomFile(file);
        if (parsed.success) {
          onAddCustomGame(parsed.game);
          lastAddedGame = parsed.game;
          count++;
        }
      } catch (err) {
        console.error('Error parsing ROM:', err);
      }
    }

    setIsParsingRom(false);
    setImportStatus(null);

    if (count > 0 && lastAddedGame) {
      audioEngine.playChannelDing();
      // If single file, launch immediately
      if (count === 1) {
        onSelectAndLaunch(lastAddedGame);
      }
    } else {
      alert(
        isHindi
          ? 'कृपया वैध .nds (Nintendo DS) या .iso / .wbfs (Nintendo Wii) ROM फ़ाइल चुनें।'
          : 'Please select a valid .nds (Nintendo DS) or .iso / .wbfs (Nintendo Wii) ROM file.'
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processMultipleFiles(files);
    }
  };

  const filteredGames = games.filter((g) => {
    if (filterSystem === 'ALL') return true;
    return g.system === filterSystem;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-6">
      {/* Hidden file input for multi-file ROM imports */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".nds,.dsi,.iso,.wbfs,.ciso,.wad,.dol,.elf,.zip"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Prominent ROM Drag & Drop Import Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-3xl p-6 md:p-8 text-center cursor-pointer border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-950/40 scale-[1.01]'
            : 'border-white/20 bg-gradient-to-r from-gray-900/90 via-sky-950/40 to-gray-900/90 hover:border-sky-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-emerald-500 text-white shadow-xl shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {isHindi
                    ? 'Nintendo DS (.NDS) और Nintendo Wii (.ISO / .WBFS) ROM लोड करें'
                    : 'Import Nintendo DS (.NDS) & Wii (.ISO / .WBFS) ROMs'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Full HD 60 FPS
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {isHindi
                  ? 'अपनी डाउनलोड की गई कोई भी गेम फ़ाइल यहाँ ड्रैग करें या फ़ोन/पीसी से सेलेक्ट करें। नो लैग, फुल एचडी और स्मूथ कंट्रोल्स।'
                  : 'Drag & drop your downloaded game files or click to browse local storage. Full HD 1080p, ultra-responsive controls, zero delay.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-xs font-black text-gray-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition shrink-0"
          >
            <HardDrive size={16} />
            <span>{isParsingRom ? importStatus || 'Parsing ROM...' : isHindi ? 'फ़ाइलें चुनें' : 'Select Game Files'}</span>
          </button>
        </div>
      </div>

      {/* Library Section Header & System Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <span>{isHindi ? 'आपकी डाउनलोडेड गेम्स लाइब्रेरी' : 'Downloaded ROMs Library'}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              {filteredGames.length} Games
            </span>
          </h2>
          <p className="text-xs text-gray-400">
            {isHindi
              ? 'केवल ओरिजिनल डाउनलोडेड ROMs — AI इनबिल्ट गेम्स हटा दिए गए हैं'
              : 'Pure downloaded ROM emulation — all artificial/demo mini-games removed as requested.'}
          </p>
        </div>

        {/* System Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10 text-xs font-bold">
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setFilterSystem('ALL');
            }}
            className={`rounded-xl px-3 py-1.5 transition ${
              filterSystem === 'ALL'
                ? 'bg-sky-500 text-gray-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All ROMs ({games.length})
          </button>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setFilterSystem('NDS');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              filterSystem === 'NDS'
                ? 'bg-amber-500 text-gray-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={13} />
            <span>Nintendo DS</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setFilterSystem('WII');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition ${
              filterSystem === 'WII'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={13} />
            <span>Nintendo Wii</span>
          </button>
        </div>
      </div>

      {/* ROM Cards Grid */}
      {filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-900/40 p-12 text-center border border-white/5 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-gray-400">
            <Upload size={32} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isHindi ? 'कोई गेम नहीं मिली' : 'No ROMs Found in this Category'}
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              {isHindi
                ? 'ऊपर दिए गए "ROM लोड करें" बटन पर क्लिक करके अपने फोन से .nds या .iso गेम जोड़ें।'
                : 'Click "Import Nintendo DS & Wii ROMs" above to add your downloaded game files.'}
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-bold text-gray-950 hover:bg-sky-400 transition"
          >
            <Plus size={15} />
            <span>{isHindi ? 'ROM इम्पोर्ट करें' : 'Import Game ROM'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gray-900/90 border border-white/10 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-500/10"
            >
              {/* Header Banner */}
              <div className={`relative h-28 w-full p-4 bg-gradient-to-tr ${game.bannerColor} flex items-start justify-between`}>
                <div className="flex items-center gap-3">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="h-12 w-12 rounded-xl border border-white/30 bg-black/40 p-1 object-contain shadow-md"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/30 border border-white/20 text-white font-black text-sm">
                      {game.system === 'NDS' ? 'DS' : 'Wii'}
                    </div>
                  )}

                  <div>
                    <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm ${
                      game.system === 'NDS' ? 'bg-amber-400 text-gray-950' : 'bg-sky-400 text-gray-950'
                    }`}>
                      {game.system === 'NDS' ? 'Nintendo DS' : 'Nintendo Wii'}
                    </span>
                    <div className="mt-1 text-xs font-mono font-bold text-white/90">
                      {game.gameCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-md border border-white/10">
                    {game.region}
                  </span>
                  {onDeleteGame && !game.isHomebrew && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        audioEngine.playWiimoteClick();
                        onDeleteGame(game.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-rose-300 hover:bg-rose-600 hover:text-white transition"
                      title="Remove from library"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {isHindi ? game.hindiTitle : game.title}
                  </h3>
                  <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {isHindi ? game.hindiDescription : game.description}
                  </p>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between text-[11px] text-gray-400 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-300">{game.fileSize}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px] text-gray-400">{game.fileName}</span>
                  </div>

                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Flame size={12} />
                    <span>60 FPS HD</span>
                  </span>
                </div>

                {/* Launch Button */}
                <button
                  onClick={() => onSelectAndLaunch(game)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-blue-500 active:scale-95 transition"
                >
                  <Play size={15} className="fill-current" />
                  <span>{isHindi ? 'गेम स्टार्ट करें (START 60 FPS)' : 'LAUNCH GAME (60 FPS)'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
