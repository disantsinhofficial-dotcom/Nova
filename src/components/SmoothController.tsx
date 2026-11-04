import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ControllerState, EmulatorSettings, SystemType, CustomLayoutMap } from '../types';
import { audioEngine } from '../engine/audioEngine';
import { DEFAULT_CUSTOM_LAYOUT, PHONE_THUMB_PRESET, TABLET_WIDE_PRESET } from '../data/gpuDrivers';
import {
  RotateCcw,
  Sparkles,
  Zap,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Mic,
  PenTool,
  Gamepad2,
  Layout,
  Move,
  Check,
  Plus,
  Minus,
  Smartphone,
  Tv,
  Compass
} from 'lucide-react';

interface SmoothControllerProps {
  system: SystemType;
  controllerState: ControllerState;
  setControllerState: React.Dispatch<React.SetStateAction<ControllerState>>;
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  onOpenHomeMenu: () => void;
}

export type ControllerStyleMode = 'wiimote_nunchuk' | 'wiimote_only' | 'wiimote_sideways' | 'nds_dual';

export const SmoothController: React.FC<SmoothControllerProps> = ({
  system,
  controllerState,
  setControllerState,
  settings,
  setSettings,
  onOpenHomeMenu,
}) => {
  // Controller style selector
  const [controllerStyle, setControllerStyle] = useState<ControllerStyleMode>(() => {
    return system === 'NDS' ? 'nds_dual' : 'wiimote_nunchuk';
  });

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [activeDragKey, setActiveDragKey] = useState<keyof CustomLayoutMap | null>(null);

  // Safe layout fallback
  const layout = {
    ...DEFAULT_CUSTOM_LAYOUT,
    ...(settings.customLayout || {}),
  };

  const stickBaseRef = useRef<HTMLDivElement>(null);
  const stickKnobRef = useRef<HTMLDivElement>(null);
  const activeStickPointerIdRef = useRef<number | null>(null);
  const stickCenterRef = useRef<{ x: number; y: number } | null>(null);

  // Wiimote pointer touch pad ref
  const irPointerPadRef = useRef<HTMLDivElement>(null);

  // Tactile micro-haptic feedback
  const triggerHaptic = useCallback(
    (duration: number = 15) => {
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate(duration);
        } catch {}
      }
    },
    [settings.hapticFeedback]
  );

  // Instant zero-delay button down
  const handleBtnDown = useCallback(
    (buttonKey: keyof ControllerState, e?: React.PointerEvent) => {
      if (isEditMode) return;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      triggerHaptic(12);
      audioEngine.playWiimoteClick();
      setControllerState((prev) => ({ ...prev, [buttonKey]: true }));
    },
    [isEditMode, triggerHaptic, setControllerState]
  );

  const handleBtnUp = useCallback(
    (buttonKey: keyof ControllerState, e?: React.PointerEvent) => {
      if (isEditMode) return;
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setControllerState((prev) => ({ ...prev, [buttonKey]: false }));
    },
    [isEditMode, setControllerState]
  );

  const triggerShake = useCallback(() => {
    triggerHaptic(40);
    audioEngine.playWiimoteSpeakerBeep();
    setControllerState((prev) => ({ ...prev, isShaking: true }));
    setTimeout(() => {
      setControllerState((prev) => ({ ...prev, isShaking: false }));
    }, 220);
  }, [triggerHaptic, setControllerState]);

  const triggerSwing = useCallback(() => {
    triggerHaptic(50);
    audioEngine.playBowlingRoll();
    setControllerState((prev) => ({ ...prev, btnB: true }));
    setTimeout(() => {
      setControllerState((prev) => ({ ...prev, btnB: false }));
    }, 350);
  }, [triggerHaptic, setControllerState]);

  const triggerMicBlow = useCallback(() => {
    triggerHaptic(30);
    audioEngine.playWiimoteClick();
    setControllerState((prev) => ({ ...prev, micBlow: true }));
    setTimeout(() => {
      setControllerState((prev) => ({ ...prev, micBlow: false }));
    }, 400);
  }, [triggerHaptic, setControllerState]);

  // -------------------------------------------------------------
  // RELIABLE PERCENTAGE DRAG & MOVE IMPLEMENTATION
  // -------------------------------------------------------------
  const handleDragPointerDown = (key: keyof CustomLayoutMap, e: React.PointerEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveDragKey(key);
    triggerHaptic(20);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (key: keyof CustomLayoutMap, e: React.PointerEvent) => {
    if (!isEditMode || activeDragKey !== key) return;
    e.preventDefault();

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Direct percentage calculation:
    // x = 0% at left edge, 100% at right edge
    // y = 0% at bottom edge, 100% at top edge
    const pctX = Math.max(5, Math.min(95, (e.clientX / screenW) * 100));
    const pctY = Math.max(5, Math.min(95, ((screenH - e.clientY) / screenH) * 100));

    setSettings((prev) => ({
      ...prev,
      customLayout: {
        ...prev.customLayout,
        [key]: {
          ...prev.customLayout[key],
          x: parseFloat(pctX.toFixed(1)),
          y: parseFloat(pctY.toFixed(1)),
        },
      },
    }));
  };

  const handleDragPointerUp = (e: React.PointerEvent) => {
    if (activeDragKey) {
      setActiveDragKey(null);
      triggerHaptic(15);
    }
  };

  // Quick Resize +/- on individual cluster
  const adjustClusterScale = (key: keyof CustomLayoutMap, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    const currentScale = layout[key]?.scale || 1.0;
    const newScale = Math.max(0.6, Math.min(1.6, currentScale + delta));

    setSettings((prev) => ({
      ...prev,
      customLayout: {
        ...prev.customLayout,
        [key]: {
          ...prev.customLayout[key],
          scale: parseFloat(newScale.toFixed(2)),
        },
      },
    }));
  };

  // Presets
  const applyPreset = (preset: typeof DEFAULT_CUSTOM_LAYOUT) => {
    audioEngine.playWiimoteClick();
    setSettings((prev) => ({ ...prev, customLayout: preset }));
  };

  // -------------------------------------------------------------
  // IR SENSOR POINTER TOUCHPAD HANDLER (FOR WII REMOTE)
  // -------------------------------------------------------------
  const handleIrPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!irPointerPadRef.current) return;
    const rect = irPointerPadRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    setControllerState((prev) => ({
      ...prev,
      pointerX: x,
      pointerY: y,
      pointerActive: true,
    }));
  };

  // -------------------------------------------------------------
  // 360° NUNCHUK STICK HANDLERS
  // -------------------------------------------------------------
  const handleStickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    activeStickPointerIdRef.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    if (stickBaseRef.current) {
      const rect = stickBaseRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      stickCenterRef.current = { x: cx, y: cy };
      updateStickPosition(e.clientX, e.clientY, cx, cy, rect.width / 2);
    }
  };

  const handleStickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    if (activeStickPointerIdRef.current === e.pointerId && stickCenterRef.current && stickBaseRef.current) {
      e.preventDefault();
      const maxRadius = stickBaseRef.current.clientWidth / 2;
      updateStickPosition(e.clientX, e.clientY, stickCenterRef.current.x, stickCenterRef.current.y, maxRadius);
    }
  };

  const handleStickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditMode) return;
    if (activeStickPointerIdRef.current === e.pointerId) {
      e.preventDefault();
      activeStickPointerIdRef.current = null;
      stickCenterRef.current = null;

      if (stickKnobRef.current) {
        stickKnobRef.current.style.transform = 'translate(0px, 0px)';
      }

      setControllerState((prev) => ({
        ...prev,
        stickX: 0,
        stickY: 0,
      }));
    }
  };

  const updateStickPosition = (
    clientX: number,
    clientY: number,
    centerX: number,
    centerY: number,
    maxRadius: number
  ) => {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let normX = 0;
    let normY = 0;

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      normX = (Math.cos(angle) * clampedDist) / maxRadius;
      normY = (Math.sin(angle) * clampedDist) / maxRadius;

      if (Math.abs(normX) < 0.08) normX = 0;
      if (Math.abs(normY) < 0.08) normY = 0;

      if (stickKnobRef.current) {
        const knobDist = (clampedDist / maxRadius) * (maxRadius * 0.7);
        stickKnobRef.current.style.transform = `translate(${Math.cos(angle) * knobDist}px, ${Math.sin(angle) * knobDist}px)`;
      }
    }

    setControllerState((prev) => ({
      ...prev,
      stickX: normX,
      stickY: normY,
    }));
  };

  const opacityStyle = { opacity: isEditMode ? 0.95 : settings.controllerOpacity };

  return (
    <div
      className={`fixed inset-0 z-30 select-none overflow-hidden touch-none ${
        isEditMode ? 'pointer-events-auto bg-black/45' : 'pointer-events-none'
      }`}
      style={opacityStyle}
    >
      {/* Edit Grid Backdrop */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:28px_28px]" />
      )}

      {/* Top Controller Accessory & Layout Bar */}
      <div className="pointer-events-auto absolute top-14 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* EDIT LAYOUT TOGGLE BUTTON */}
          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setIsEditMode(!isEditMode);
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-black backdrop-blur-md border transition-all ${
              isEditMode
                ? 'bg-amber-400 text-gray-950 border-white shadow-xl shadow-amber-500/30 ring-2 ring-amber-300'
                : 'bg-gray-900/90 text-amber-300 border-amber-500/40 hover:bg-gray-800'
            }`}
          >
            <Move size={14} />
            <span>{isEditMode ? 'DONE / SAVE LAYOUT' : 'EDIT LAYOUT (MOVE & RESIZE)'}</span>
          </button>

          {/* CONTROLLER STYLE SELECTOR (Wii Remote vs Nunchuk vs DS) */}
          <div className="relative">
            <button
              onClick={() => {
                audioEngine.playWiimoteClick();
                setShowStyleMenu(!showStyleMenu);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md border border-sky-400/50 shadow-md hover:from-sky-500 hover:to-blue-600 transition"
            >
              <Gamepad2 size={14} />
              <span className="capitalize">
                {controllerStyle === 'wiimote_nunchuk' && 'Wii Remote + Nunchuk'}
                {controllerStyle === 'wiimote_only' && 'Wii Remote Only'}
                {controllerStyle === 'wiimote_sideways' && 'Wii Sideways (Mario)'}
                {controllerStyle === 'nds_dual' && 'Nintendo DS Dual'}
              </span>
            </button>

            {/* Controller Style Dropdown Menu */}
            {showStyleMenu && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-gray-950/95 border border-sky-500/40 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                <span className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 block">
                  Select Active Controller:
                </span>

                <button
                  onClick={() => {
                    audioEngine.playWiimoteClick();
                    setControllerStyle('wiimote_nunchuk');
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    controllerStyle === 'wiimote_nunchuk'
                      ? 'bg-sky-500 text-gray-950'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span>Wii Remote + Nunchuk (वि रिमोट + ननचक)</span>
                  {controllerStyle === 'wiimote_nunchuk' && <Check size={14} />}
                </button>

                <button
                  onClick={() => {
                    audioEngine.playWiimoteClick();
                    setControllerStyle('wiimote_only');
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    controllerStyle === 'wiimote_only'
                      ? 'bg-sky-500 text-gray-950'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span>Wii Remote Only (स्टैंडअलोन रिमोट)</span>
                  {controllerStyle === 'wiimote_only' && <Check size={14} />}
                </button>

                <button
                  onClick={() => {
                    audioEngine.playWiimoteClick();
                    setControllerStyle('wiimote_sideways');
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    controllerStyle === 'wiimote_sideways'
                      ? 'bg-sky-500 text-gray-950'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span>Wii Remote Sideways (हॉरिजॉन्टल मारियो मोड)</span>
                  {controllerStyle === 'wiimote_sideways' && <Check size={14} />}
                </button>

                <button
                  onClick={() => {
                    audioEngine.playWiimoteClick();
                    setControllerStyle('nds_dual');
                    setShowStyleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    controllerStyle === 'nds_dual'
                      ? 'bg-amber-400 text-gray-950'
                      : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  <span>Nintendo DS Dual Controller</span>
                  {controllerStyle === 'nds_dual' && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <button
            onClick={triggerShake}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-500/30 active:scale-95 transition"
            title="Simulate Wiimote Shake"
          >
            <Sparkles size={13} />
            <span>Shake Wiimote</span>
          </button>

          <button
            onClick={triggerSwing}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-sky-500/20 px-3 py-1.5 text-xs font-bold text-sky-300 backdrop-blur-md border border-sky-500/30 active:scale-95 transition"
            title="Simulate Bowling/Tennis Swing"
          >
            <Zap size={13} />
            <span>Auto Swing</span>
          </button>
        </div>

        {/* Home Pause Menu */}
        <button
          onClick={() => {
            triggerHaptic(20);
            onOpenHomeMenu();
          }}
          className="flex items-center gap-1.5 rounded-full bg-blue-600/90 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 backdrop-blur-md border border-blue-400 hover:bg-blue-500 active:scale-95 transition"
        >
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>PAUSE / MENU</span>
        </button>
      </div>

      {/* FLOATING TOP TOOLBAR IN EDIT MODE */}
      {isEditMode && (
        <div className="pointer-events-auto absolute top-28 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-gray-950/95 border border-amber-500/40 p-3 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Move size={14} />
              <span>Tap [Move] to drag • Tap [+/-] to resize</span>
            </span>
          </div>

          {/* Presets and Done Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => applyPreset(PHONE_THUMB_PRESET)}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
            >
              <Smartphone size={13} />
              <span>Phone</span>
            </button>

            <button
              onClick={() => applyPreset(TABLET_WIDE_PRESET)}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
            >
              <Tv size={13} />
              <span>Tablet</span>
            </button>

            <button
              onClick={() => applyPreset(DEFAULT_CUSTOM_LAYOUT)}
              className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-black text-gray-950 hover:bg-emerald-400 transition shadow-lg"
            >
              <Check size={14} />
              <span>Save & Done</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 1. NINTENDO WII REMOTE (VERTICAL STANDALONE OR WITH NUNCHUK)   */}
      {/* ============================================================= */}
      {(controllerStyle === 'wiimote_nunchuk' || controllerStyle === 'wiimote_only') && (
        <div
          style={{
            left: `${layout.wiimote.x}%`,
            bottom: `${layout.wiimote.y}%`,
            transform: `translate(-50%, 50%) scale(${layout.wiimote.scale})`,
            transformOrigin: 'center center',
          }}
          className="pointer-events-auto absolute flex flex-col items-center touch-none"
        >
          {/* Edit Mode Move & Resize Header */}
          {isEditMode && (
            <div
              onPointerDown={(e) => handleDragPointerDown('wiimote', e)}
              onPointerMove={(e) => handleDragPointerMove('wiimote', e)}
              onPointerUp={handleDragPointerUp}
              className="mb-1 flex items-center justify-between gap-2 rounded-xl bg-amber-500/20 border-2 border-dashed border-amber-400 px-2.5 py-1 text-amber-300 w-full cursor-move shadow-lg"
            >
              <span className="text-[10px] font-black uppercase flex items-center gap-1">
                <Move size={12} />
                <span>WII REMOTE</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => adjustClusterScale('wiimote', -0.1, e)}
                  className="h-5 w-5 rounded bg-black/50 flex items-center justify-center font-bold text-xs hover:bg-black"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold">
                  {Math.round(layout.wiimote.scale * 100)}%
                </span>
                <button
                  onClick={(e) => adjustClusterScale('wiimote', 0.1, e)}
                  className="h-5 w-5 rounded bg-black/50 flex items-center justify-center font-bold text-xs hover:bg-black"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Authentic Physical Wii Remote Chassis */}
          <div className="relative flex flex-col items-center rounded-3xl bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 text-gray-900 p-3 shadow-2xl border-2 border-white/80 w-36">
            {/* Top IR Sensor Diode & Optical Touchpad */}
            <div
              ref={irPointerPadRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handleIrPointerMove(e);
              }}
              onPointerMove={handleIrPointerMove}
              className="mb-2 h-7 w-full rounded-xl bg-gray-900 flex items-center justify-center border border-gray-700 shadow-inner cursor-crosshair group"
              title="Touch here to aim IR pointer"
            >
              <div className="flex items-center gap-1.5 text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                <Compass size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
                <span>IR AIM PAD</span>
              </div>
            </div>

            {/* Rear B Trigger (Top pill button) */}
            <button
              onPointerDown={(e) => handleBtnDown('btnB', e)}
              onPointerUp={(e) => handleBtnUp('btnB', e)}
              onPointerCancel={(e) => handleBtnUp('btnB', e)}
              className={`mb-2 h-9 w-28 rounded-xl text-xs font-black transition border shadow-md flex items-center justify-center gap-1 ${
                controllerState.btnB
                  ? 'bg-amber-500 text-white border-white scale-95 shadow-amber-500/40'
                  : 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-900 border-gray-500 active:scale-95'
              }`}
            >
              <span>B TRIGGER</span>
            </button>

            {/* Cross D-PAD */}
            <div className="relative h-20 w-20 flex items-center justify-center mb-2">
              <div className="h-6 w-6 bg-gray-400 rounded-sm" />

              <button
                onPointerDown={(e) => handleBtnDown('dpadUp', e)}
                onPointerUp={(e) => handleBtnUp('dpadUp', e)}
                onPointerCancel={(e) => handleBtnUp('dpadUp', e)}
                className={`absolute top-0 h-8 w-6 rounded-t-md flex items-center justify-center text-xs font-black transition border ${
                  controllerState.dpadUp ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200 border-gray-600'
                }`}
              >
                ▲
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadDown', e)}
                onPointerUp={(e) => handleBtnUp('dpadDown', e)}
                onPointerCancel={(e) => handleBtnUp('dpadDown', e)}
                className={`absolute bottom-0 h-8 w-6 rounded-b-md flex items-center justify-center text-xs font-black transition border ${
                  controllerState.dpadDown ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200 border-gray-600'
                }`}
              >
                ▼
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadLeft', e)}
                onPointerUp={(e) => handleBtnUp('dpadLeft', e)}
                onPointerCancel={(e) => handleBtnUp('dpadLeft', e)}
                className={`absolute left-0 h-6 w-8 rounded-l-md flex items-center justify-center text-xs font-black transition border ${
                  controllerState.dpadLeft ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200 border-gray-600'
                }`}
              >
                ◀
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadRight', e)}
                onPointerUp={(e) => handleBtnUp('dpadRight', e)}
                onPointerCancel={(e) => handleBtnUp('dpadRight', e)}
                className={`absolute right-0 h-6 w-8 rounded-r-md flex items-center justify-center text-xs font-black transition border ${
                  controllerState.dpadRight ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200 border-gray-600'
                }`}
              >
                ▶
              </button>
            </div>

            {/* Large Circular "A" Button */}
            <button
              onPointerDown={(e) => handleBtnDown('btnA', e)}
              onPointerUp={(e) => handleBtnUp('btnA', e)}
              onPointerCancel={(e) => handleBtnUp('btnA', e)}
              className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-black shadow-lg transition-all ${
                controllerState.btnA
                  ? 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white scale-95 ring-4 ring-sky-300'
                  : 'bg-white text-gray-900 border-2 border-gray-400 active:scale-95'
              }`}
            >
              A
            </button>

            {/* -, Home, + row */}
            <div className="mt-2 flex items-center justify-between w-full px-1">
              <button
                onPointerDown={(e) => handleBtnDown('btnMinus', e)}
                onPointerUp={(e) => handleBtnUp('btnMinus', e)}
                onPointerCancel={(e) => handleBtnUp('btnMinus', e)}
                className="h-6 w-6 rounded-full bg-gray-400 text-xs font-bold text-gray-900 flex items-center justify-center shadow-sm active:scale-90"
              >
                -
              </button>
              <button
                onClick={onOpenHomeMenu}
                className="h-7 w-7 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center shadow-md active:scale-90"
              >
                🏠
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('btnPlus', e)}
                onPointerUp={(e) => handleBtnUp('btnPlus', e)}
                onPointerCancel={(e) => handleBtnUp('btnPlus', e)}
                className="h-6 w-6 rounded-full bg-gray-400 text-xs font-bold text-gray-900 flex items-center justify-center shadow-sm active:scale-90"
              >
                +
              </button>
            </div>

            {/* 1 and 2 buttons */}
            <div className="mt-2 flex gap-2">
              <button
                onPointerDown={(e) => handleBtnDown('btnOne', e)}
                onPointerUp={(e) => handleBtnUp('btnOne', e)}
                onPointerCancel={(e) => handleBtnUp('btnOne', e)}
                className={`h-7 w-7 rounded-full text-xs font-bold transition border ${
                  controllerState.btnOne ? 'bg-sky-500 text-white' : 'bg-gray-300 text-gray-800 border-gray-400'
                }`}
              >
                1
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('btnTwo', e)}
                onPointerUp={(e) => handleBtnUp('btnTwo', e)}
                onPointerCancel={(e) => handleBtnUp('btnTwo', e)}
                className={`h-7 w-7 rounded-full text-xs font-bold transition border ${
                  controllerState.btnTwo ? 'bg-sky-500 text-white' : 'bg-gray-300 text-gray-800 border-gray-400'
                }`}
              >
                2
              </button>
            </div>

            {/* 4 Blue Player LEDs */}
            <div className="mt-2 flex gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. NUNCHUK ATTACHMENT (FOR WII REMOTE + NUNCHUK MODE)          */}
      {/* ============================================================= */}
      {controllerStyle === 'wiimote_nunchuk' && (
        <div
          style={{
            left: `${layout.nunchuk.x}%`,
            bottom: `${layout.nunchuk.y}%`,
            transform: `translate(-50%, 50%) scale(${layout.nunchuk.scale})`,
            transformOrigin: 'center center',
          }}
          className="pointer-events-auto absolute flex flex-col items-center touch-none"
        >
          {isEditMode && (
            <div
              onPointerDown={(e) => handleDragPointerDown('nunchuk', e)}
              onPointerMove={(e) => handleDragPointerMove('nunchuk', e)}
              onPointerUp={handleDragPointerUp}
              className="mb-1 flex items-center justify-between gap-2 rounded-xl bg-amber-500/20 border-2 border-dashed border-amber-400 px-2.5 py-1 text-amber-300 w-full cursor-move shadow-lg"
            >
              <span className="text-[10px] font-black uppercase flex items-center gap-1">
                <Move size={12} />
                <span>NUNCHUK</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => adjustClusterScale('nunchuk', -0.1, e)}
                  className="h-5 w-5 rounded bg-black/50 flex items-center justify-center font-bold text-xs hover:bg-black"
                >
                  -
                </button>
                <span className="text-[10px] font-mono font-bold">
                  {Math.round(layout.nunchuk.scale * 100)}%
                </span>
                <button
                  onClick={(e) => adjustClusterScale('nunchuk', 0.1, e)}
                  className="h-5 w-5 rounded bg-black/50 flex items-center justify-center font-bold text-xs hover:bg-black"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* C & Z Top Trigger Row */}
          <div className="mb-2 flex w-full justify-between gap-2">
            <button
              onPointerDown={(e) => handleBtnDown('btnC', e)}
              onPointerUp={(e) => handleBtnUp('btnC', e)}
              onPointerCancel={(e) => handleBtnUp('btnC', e)}
              className={`h-9 flex-1 rounded-xl text-xs font-bold transition border ${
                controllerState.btnC ? 'bg-sky-500 text-white border-white scale-95' : 'bg-gray-900/90 text-gray-300 border-white/20'
              }`}
            >
              C
            </button>
            <button
              onPointerDown={(e) => handleBtnDown('btnZ', e)}
              onPointerUp={(e) => handleBtnUp('btnZ', e)}
              onPointerCancel={(e) => handleBtnUp('btnZ', e)}
              className={`h-9 flex-1 rounded-xl text-xs font-bold transition border ${
                controllerState.btnZ ? 'bg-sky-500 text-white border-white scale-95' : 'bg-gray-900/90 text-gray-300 border-white/20'
              }`}
            >
              Z Trg
            </button>
          </div>

          {/* 360° Analog Joystick */}
          <div
            ref={stickBaseRef}
            onPointerDown={handleStickPointerDown}
            onPointerMove={handleStickPointerMove}
            onPointerUp={handleStickPointerUp}
            onPointerCancel={handleStickPointerUp}
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-b from-gray-900/95 to-gray-950/95 shadow-2xl backdrop-blur-xl border border-white/20 touch-none"
          >
            <div className="absolute h-full w-[1px] bg-white/10" />
            <div className="absolute h-[1px] w-full bg-white/10" />

            <div
              ref={stickKnobRef}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-gray-200 to-white shadow-xl border-2 border-gray-400 pointer-events-none transition-transform duration-75"
            >
              <div className="h-6 w-6 rounded-full bg-gray-300 border border-gray-400/50" />
            </div>
          </div>
          <span className="mt-1 text-[10px] font-black uppercase text-gray-400">NUNCHUK STICK</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. WII REMOTE SIDEWAYS (HORIZONTAL MARIO / RACING MODE)       */}
      {/* ============================================================= */}
      {controllerStyle === 'wiimote_sideways' && (
        <>
          {/* Left: D-Pad */}
          <div
            style={{
              left: `${layout.dpad.x}%`,
              bottom: `${layout.dpad.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.dpad.scale})`,
            }}
            className="pointer-events-auto absolute flex flex-col items-center touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('dpad', e)}
                onPointerMove={(e) => handleDragPointerMove('dpad', e)}
                onPointerUp={handleDragPointerUp}
                className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/20 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE D-PAD]</span>
                <button onClick={(e) => adjustClusterScale('dpad', 0.1, e)}>+</button>
              </div>
            )}
            {/* D-Pad Buttons */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <button
                onPointerDown={(e) => handleBtnDown('dpadUp', e)}
                onPointerUp={(e) => handleBtnUp('dpadUp', e)}
                className={`absolute top-0 h-10 w-8 rounded-t-lg flex items-center justify-center text-xs font-bold ${
                  controllerState.dpadUp ? 'bg-sky-500 text-white' : 'bg-gray-800 text-white border border-white/20'
                }`}
              >
                ▲
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadDown', e)}
                onPointerUp={(e) => handleBtnUp('dpadDown', e)}
                className={`absolute bottom-0 h-10 w-8 rounded-b-lg flex items-center justify-center text-xs font-bold ${
                  controllerState.dpadDown ? 'bg-sky-500 text-white' : 'bg-gray-800 text-white border border-white/20'
                }`}
              >
                ▼
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadLeft', e)}
                onPointerUp={(e) => handleBtnUp('dpadLeft', e)}
                className={`absolute left-0 h-8 w-10 rounded-l-lg flex items-center justify-center text-xs font-bold ${
                  controllerState.dpadLeft ? 'bg-sky-500 text-white' : 'bg-gray-800 text-white border border-white/20'
                }`}
              >
                ◀
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadRight', e)}
                onPointerUp={(e) => handleBtnUp('dpadRight', e)}
                className={`absolute right-0 h-8 w-10 rounded-r-lg flex items-center justify-center text-xs font-bold ${
                  controllerState.dpadRight ? 'bg-sky-500 text-white' : 'bg-gray-800 text-white border border-white/20'
                }`}
              >
                ▶
              </button>
            </div>
          </div>

          {/* Right: 1 and 2 Buttons */}
          <div
            style={{
              left: `${layout.faceButtons.x}%`,
              bottom: `${layout.faceButtons.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.faceButtons.scale})`,
            }}
            className="pointer-events-auto absolute flex items-center gap-4 touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('faceButtons', e)}
                onPointerMove={(e) => handleDragPointerMove('faceButtons', e)}
                onPointerUp={handleDragPointerUp}
                className="absolute -top-7 flex items-center justify-between gap-1 rounded-lg bg-amber-500/20 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE 1/2]</span>
                <button onClick={(e) => adjustClusterScale('faceButtons', 0.1, e)}>+</button>
              </div>
            )}
            <button
              onPointerDown={(e) => handleBtnDown('btnOne', e)}
              onPointerUp={(e) => handleBtnUp('btnOne', e)}
              className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-black transition border shadow-lg ${
                controllerState.btnOne ? 'bg-sky-500 text-white border-white scale-95' : 'bg-gray-900 text-white border-white/30'
              }`}
            >
              1
            </button>
            <button
              onPointerDown={(e) => handleBtnDown('btnTwo', e)}
              onPointerUp={(e) => handleBtnUp('btnTwo', e)}
              className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-black transition border shadow-lg ${
                controllerState.btnTwo ? 'bg-rose-500 text-white border-white scale-95' : 'bg-gray-900 text-white border-white/30'
              }`}
            >
              2
            </button>
          </div>
        </>
      )}

      {/* ============================================================= */}
      {/* 4. NINTENDO DS DUAL CONTROLLER (D-PAD + A/B/X/Y + L/R)         */}
      {/* ============================================================= */}
      {controllerStyle === 'nds_dual' && (
        <>
          {/* L & R Shoulder Bumpers */}
          <div
            style={{
              left: `${layout.shoulderL.x}%`,
              bottom: `${layout.shoulderL.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.shoulderL.scale})`,
            }}
            className="pointer-events-auto absolute touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('shoulderL', e)}
                onPointerMove={(e) => handleDragPointerMove('shoulderL', e)}
                onPointerUp={handleDragPointerUp}
                className="absolute -top-7 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE L]</span>
                <button onClick={(e) => adjustClusterScale('shoulderL', 0.1, e)}>+</button>
                <button onClick={(e) => adjustClusterScale('shoulderL', -0.1, e)}>-</button>
              </div>
            )}
            <button
              onPointerDown={(e) => handleBtnDown('btnL', e)}
              onPointerUp={(e) => handleBtnUp('btnL', e)}
              className={`h-11 w-20 rounded-2xl text-xs font-black transition border ${
                controllerState.btnL ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-300 border-white/20'
              }`}
            >
              [ L ]
            </button>
          </div>

          <div
            style={{
              left: `${layout.shoulderR.x}%`,
              bottom: `${layout.shoulderR.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.shoulderR.scale})`,
            }}
            className="pointer-events-auto absolute touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('shoulderR', e)}
                onPointerMove={(e) => handleDragPointerMove('shoulderR', e)}
                onPointerUp={handleDragPointerUp}
                className="absolute -top-7 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE R]</span>
                <button onClick={(e) => adjustClusterScale('shoulderR', 0.1, e)}>+</button>
                <button onClick={(e) => adjustClusterScale('shoulderR', -0.1, e)}>-</button>
              </div>
            )}
            <button
              onPointerDown={(e) => handleBtnDown('btnR', e)}
              onPointerUp={(e) => handleBtnUp('btnR', e)}
              className={`h-11 w-20 rounded-2xl text-xs font-black transition border ${
                controllerState.btnR ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-300 border-white/20'
              }`}
            >
              [ R ]
            </button>
          </div>

          {/* D-Pad on Left */}
          <div
            style={{
              left: `${layout.dpad.x}%`,
              bottom: `${layout.dpad.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.dpad.scale})`,
            }}
            className="pointer-events-auto absolute flex flex-col items-center touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('dpad', e)}
                onPointerMove={(e) => handleDragPointerMove('dpad', e)}
                onPointerUp={handleDragPointerUp}
                className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/20 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE D-PAD]</span>
                <button onClick={(e) => adjustClusterScale('dpad', 0.1, e)}>+</button>
                <button onClick={(e) => adjustClusterScale('dpad', -0.1, e)}>-</button>
              </div>
            )}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <button
                onPointerDown={(e) => handleBtnDown('dpadUp', e)}
                onPointerUp={(e) => handleBtnUp('dpadUp', e)}
                className={`absolute top-0 h-12 w-10 rounded-t-xl flex items-center justify-center text-sm font-black transition border ${
                  controllerState.dpadUp ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-200 border-white/20'
                }`}
              >
                ▲
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadDown', e)}
                onPointerUp={(e) => handleBtnUp('dpadDown', e)}
                className={`absolute bottom-0 h-12 w-10 rounded-b-xl flex items-center justify-center text-sm font-black transition border ${
                  controllerState.dpadDown ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-200 border-white/20'
                }`}
              >
                ▼
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadLeft', e)}
                onPointerUp={(e) => handleBtnUp('dpadLeft', e)}
                className={`absolute left-0 h-10 w-12 rounded-l-xl flex items-center justify-center text-sm font-black transition border ${
                  controllerState.dpadLeft ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-200 border-white/20'
                }`}
              >
                ◀
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('dpadRight', e)}
                onPointerUp={(e) => handleBtnUp('dpadRight', e)}
                className={`absolute right-0 h-10 w-12 rounded-r-xl flex items-center justify-center text-sm font-black transition border ${
                  controllerState.dpadRight ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-200 border-white/20'
                }`}
              >
                ▶
              </button>
            </div>
          </div>

          {/* Right: A/B/X/Y Diamond */}
          <div
            style={{
              left: `${layout.faceButtons.x}%`,
              bottom: `${layout.faceButtons.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.faceButtons.scale})`,
            }}
            className="pointer-events-auto absolute flex flex-col items-center touch-none"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('faceButtons', e)}
                onPointerMove={(e) => handleDragPointerMove('faceButtons', e)}
                onPointerUp={handleDragPointerUp}
                className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/20 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
              >
                <span>[MOVE A/B/X/Y]</span>
                <button onClick={(e) => adjustClusterScale('faceButtons', 0.1, e)}>+</button>
                <button onClick={(e) => adjustClusterScale('faceButtons', -0.1, e)}>-</button>
              </div>
            )}
            <div className="relative h-36 w-36 flex items-center justify-center">
              <button
                onPointerDown={(e) => handleBtnDown('btnX', e)}
                onPointerUp={(e) => handleBtnUp('btnX', e)}
                className={`absolute top-0 h-12 w-12 rounded-full flex items-center justify-center text-base font-black transition shadow-lg border ${
                  controllerState.btnX ? 'bg-amber-400 text-gray-950 scale-95' : 'bg-gray-900/95 text-amber-300 border-amber-500/40'
                }`}
              >
                X
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('btnA', e)}
                onPointerUp={(e) => handleBtnUp('btnA', e)}
                className={`absolute right-0 h-12 w-12 rounded-full flex items-center justify-center text-base font-black transition shadow-lg border ${
                  controllerState.btnA ? 'bg-rose-500 text-white scale-95' : 'bg-gray-900/95 text-rose-300 border-rose-500/40'
                }`}
              >
                A
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('btnB', e)}
                onPointerUp={(e) => handleBtnUp('btnB', e)}
                className={`absolute bottom-0 h-12 w-12 rounded-full flex items-center justify-center text-base font-black transition shadow-lg border ${
                  controllerState.btnB ? 'bg-emerald-500 text-white scale-95' : 'bg-gray-900/95 text-emerald-300 border-emerald-500/40'
                }`}
              >
                B
              </button>
              <button
                onPointerDown={(e) => handleBtnDown('btnY', e)}
                onPointerUp={(e) => handleBtnUp('btnY', e)}
                className={`absolute left-0 h-12 w-12 rounded-full flex items-center justify-center text-base font-black transition shadow-lg border ${
                  controllerState.btnY ? 'bg-sky-400 text-gray-950 scale-95' : 'bg-gray-900/95 text-sky-300 border-sky-500/40'
                }`}
              >
                Y
              </button>
            </div>
          </div>
        </>
      )}

      {/* Start and Select Row */}
      <div
        style={{
          left: `${layout.menuButtons.x}%`,
          bottom: `${layout.menuButtons.y}%`,
          transform: `translate(-50%, 50%) scale(${layout.menuButtons.scale})`,
        }}
        className="pointer-events-auto absolute flex flex-col items-center touch-none"
      >
        {isEditMode && (
          <div
            onPointerDown={(e) => handleDragPointerDown('menuButtons', e)}
            onPointerMove={(e) => handleDragPointerMove('menuButtons', e)}
            onPointerUp={handleDragPointerUp}
            className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
          >
            <span>[MOVE MENU]</span>
            <button onClick={(e) => adjustClusterScale('menuButtons', 0.1, e)}>+</button>
            <button onClick={(e) => adjustClusterScale('menuButtons', -0.1, e)}>-</button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            onPointerDown={(e) => handleBtnDown('btnSelect', e)}
            onPointerUp={(e) => handleBtnUp('btnSelect', e)}
            className={`rounded-xl px-4 py-1.5 text-[11px] font-black transition border ${
              controllerState.btnSelect ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-400 border-white/10 active:scale-95'
            }`}
          >
            SELECT
          </button>

          <button
            onPointerDown={(e) => handleBtnDown('btnStart', e)}
            onPointerUp={(e) => handleBtnUp('btnStart', e)}
            className={`rounded-xl px-4 py-1.5 text-[11px] font-black transition border ${
              controllerState.btnStart ? 'bg-sky-500 text-white' : 'bg-gray-900/90 text-gray-400 border-white/10 active:scale-95'
            }`}
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
};
