import React, { useEffect, useRef, useState } from 'react';
import { RomGame, EmulatorSettings, ControllerState, EmulationStats } from '../types';
import { DualSystemRunner } from '../engine/DualSystemRunner';
import { audioEngine } from '../engine/audioEngine';
import {
  Maximize2,
  Minimize2,
  Tv,
  Sparkles,
  Smartphone,
  Layers,
  Columns,
  Rows,
  Sliders
} from 'lucide-react';

interface EmulatorScreenProps {
  game: RomGame;
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  controllerState: ControllerState;
  setControllerState: React.Dispatch<React.SetStateAction<ControllerState>>;
  stats: EmulationStats;
  setStats: React.Dispatch<React.SetStateAction<EmulationStats>>;
  onOpenHomeMenu: () => void;
}

export const EmulatorScreen: React.FC<EmulatorScreenProps> = ({
  game,
  settings,
  setSettings,
  controllerState,
  setControllerState,
  stats,
  setStats,
  onOpenHomeMenu,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<DualSystemRunner | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Initialize Dual System Runner (NDS or Wii)
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    if (runnerRef.current) {
      runnerRef.current.destroy();
      runnerRef.current = null;
    }

    const runner = new DualSystemRunner(
      container,
      game,
      settings,
      (fps, frameTime) => {
        setStats((prev) => ({
          ...prev,
          fps,
          frameTimeMs: frameTime,
        }));
      }
    );
    runnerRef.current = runner;

    const handleResize = () => {
      runnerRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (runnerRef.current) {
        runnerRef.current.destroy();
        runnerRef.current = null;
      }
    };
  }, [game.id, game.system]);

  // Feed controller state to active runner
  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.updateInput(controllerState);
    }
  }, [controllerState]);

  // Update layout if settings change
  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.updateNdsLayout();
    }
  }, [settings.ndsScreenLayout]);

  // Update resolution scaling
  useEffect(() => {
    if (runnerRef.current) {
      runnerRef.current.setResolutionScale(settings.resolutionScale);
    }
  }, [settings.resolutionScale]);

  // Direct touch tracking for Nintendo DS Touchscreen or Wii Pointer
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerCoords(e, true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      handlePointerCoords(e, true);
    } else {
      handlePointerCoords(e, false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerCoords(e, false);
  };

  const handlePointerCoords = (e: React.PointerEvent<HTMLDivElement>, isDown: boolean) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (game.system === 'NDS') {
      // In Vertical layout, bottom screen is the bottom half (0.5 to 1.0)
      let bottomX = x;
      let bottomY = y;

      if (settings.ndsScreenLayout === 'vertical') {
        bottomY = Math.max(0, Math.min(1, (y - 0.5) * 2));
      } else if (settings.ndsScreenLayout === 'horizontal') {
        // Bottom screen is right half (0.5 to 1.0)
        bottomX = Math.max(0, Math.min(1, (x - 0.5) * 2));
      }

      setControllerState((prev) => ({
        ...prev,
        touchX: bottomX,
        touchY: bottomY,
        touchDown: isDown,
      }));
    } else {
      // Wii Remote Pointer coordinates (0 to 1)
      setControllerState((prev) => ({
        ...prev,
        pointerX: x,
        pointerY: y,
        pointerActive: true,
      }));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.parentElement?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const cycleNdsLayout = () => {
    audioEngine.playWiimoteClick();
    const layouts: ('vertical' | 'horizontal' | 'focused_top')[] = [
      'vertical',
      'horizontal',
      'focused_top',
    ];
    const currentIndex = layouts.indexOf(settings.ndsScreenLayout as any);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    setSettings((prev) => ({ ...prev, ndsScreenLayout: nextLayout }));
  };

  const resolutionLabels: Record<number, string> = {
    1: 'Native',
    2: '720p HD',
    3: '1080p Full HD',
    4: '4K UHD',
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[calc(100vh-6rem)] bg-black overflow-hidden select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full aspect-video max-h-[85vh] cursor-crosshair overflow-hidden touch-none ${
          game.system === 'NDS' && settings.ndsScreenLayout === 'vertical'
            ? 'max-w-xl aspect-[3/4]'
            : 'max-w-6xl'
        }`}
      />

      {/* Optional CRT scanline shader filter */}
      {settings.crtFilter && <div className="absolute inset-0 crt-overlay pointer-events-none z-20" />}

      {/* Top Game HUD Bar */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex items-start justify-between">
        {/* Game Title & Frame status */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg bg-black/80 px-3 py-1 font-bold text-xs text-white backdrop-blur-md border border-white/10 shadow-lg">
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                game.system === 'NDS' ? 'bg-amber-500 text-gray-950' : 'bg-sky-500 text-white'
              }`}>
                {game.system}
              </span>
              <span>{game.title}</span>
            </span>

            <span className="rounded-lg bg-emerald-500/20 px-2 py-1 font-mono font-bold text-[11px] text-emerald-300 backdrop-blur-md border border-emerald-500/30 shadow-lg">
              {stats.fps.toFixed(1)} FPS
            </span>

            <span className="hidden sm:inline rounded-lg bg-sky-500/20 px-2 py-1 font-mono font-bold text-[11px] text-sky-300 backdrop-blur-md border border-sky-500/30">
              {resolutionLabels[settings.resolutionScale]}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-300">
            <span className="rounded bg-black/60 px-2 py-0.5 border border-white/10 font-mono">
              Code: {game.gameCode}
            </span>
            <span className="rounded bg-black/60 px-2 py-0.5 border border-white/10 font-mono">
              Size: {game.fileSize}
            </span>
            <span className="text-emerald-400 font-semibold">Zero Lag • HyperBoost 2.0</span>
          </div>
        </div>

        {/* Top Right Actions (DS Layout switch & Fullscreen) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {game.system === 'NDS' && (
            <button
              onClick={cycleNdsLayout}
              className="flex items-center gap-1.5 rounded-xl bg-black/75 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-500/30 hover:bg-black/90 active:scale-95 transition"
              title="Change DS Dual Screen Layout"
            >
              {settings.ndsScreenLayout === 'horizontal' ? <Columns size={14} /> : <Rows size={14} />}
              <span className="capitalize">{settings.ndsScreenLayout}</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/75 text-white backdrop-blur-md border border-white/10 hover:bg-black/90 active:scale-95 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
