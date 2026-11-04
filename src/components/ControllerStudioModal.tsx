import React, { useState, useRef, useCallback } from 'react';
import {
  EmulatorSettings,
  CustomLayoutMap,
  ControllerState,
  SystemType
} from '../types';
import { DEFAULT_CUSTOM_LAYOUT, PHONE_THUMB_PRESET, TABLET_WIDE_PRESET } from '../data/gpuDrivers';
import { audioEngine } from '../engine/audioEngine';
import {
  Move,
  Check,
  RotateCcw,
  Plus,
  Minus,
  Smartphone,
  Tv,
  Gamepad2,
  Sliders,
  Sparkles,
  Zap,
  X,
  Compass,
  Vibrate,
  Eye,
  Crosshair,
  Volume2
} from 'lucide-react';

export type ControllerStyleMode =
  | 'wiimote_nunchuk'
  | 'wiimote_only'
  | 'wiimote_sideways'
  | 'wii_classic'
  | 'nds_dual';

interface ControllerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmulatorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EmulatorSettings>>;
  isHindi?: boolean;
}

export const ControllerStudioModal: React.FC<ControllerStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  isHindi = true,
}) => {
  if (!isOpen) return null;

  const [controllerStyle, setControllerStyle] = useState<ControllerStyleMode>('wiimote_nunchuk');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [activeDragKey, setActiveDragKey] = useState<keyof CustomLayoutMap | null>(null);

  // Live test controller state for visual feedback
  const [testState, setTestState] = useState<ControllerState>({
    dpadUp: false,
    dpadDown: false,
    dpadLeft: false,
    dpadRight: false,
    btnA: false,
    btnB: false,
    btnX: false,
    btnY: false,
    btnL: false,
    btnR: false,
    btnZL: false,
    btnZR: false,
    btnStart: false,
    btnSelect: false,
    btnHome: false,
    btnMinus: false,
    btnPlus: false,
    btnOne: false,
    btnTwo: false,
    stickX: 0,
    stickY: 0,
    rightStickX: 0,
    rightStickY: 0,
    btnC: false,
    btnZ: false,
    isShaking: false,
    swingAngle: 0,
    pointerX: 0.5,
    pointerY: 0.5,
    pointerActive: false,
    touchX: 0,
    touchY: 0,
    touchDown: false,
    micBlow: false,
  });

  const layout = {
    ...DEFAULT_CUSTOM_LAYOUT,
    ...(settings.customLayout || {}),
  };

  const stickBaseRef = useRef<HTMLDivElement>(null);
  const stickKnobRef = useRef<HTMLDivElement>(null);
  const irPointerPadRef = useRef<HTMLDivElement>(null);

  // Haptic feedback
  const triggerHaptic = useCallback(
    (duration: number = 18) => {
      if (settings.hapticFeedback && 'vibrate' in navigator) {
        try {
          navigator.vibrate(duration);
        } catch {}
      }
    },
    [settings.hapticFeedback]
  );

  const handleBtnDown = (btnKey: keyof ControllerState) => {
    triggerHaptic(15);
    audioEngine.playWiimoteClick();
    setTestState((prev) => ({ ...prev, [btnKey]: true }));
  };

  const handleBtnUp = (btnKey: keyof ControllerState) => {
    setTestState((prev) => ({ ...prev, [btnKey]: false }));
  };

  // Drag-and-move calculation
  const handleDragPointerDown = (key: keyof CustomLayoutMap, e: React.PointerEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    setActiveDragKey(key);
    triggerHaptic(25);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (key: keyof CustomLayoutMap, e: React.PointerEvent) => {
    if (!isEditMode || activeDragKey !== key) return;
    e.preventDefault();

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

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

  const handleDragPointerUp = () => {
    if (activeDragKey) {
      setActiveDragKey(null);
      triggerHaptic(15);
    }
  };

  // Scale +/-
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
    triggerHaptic(30);
    setSettings((prev) => ({ ...prev, customLayout: preset }));
  };

  // Motion simulate
  const triggerShake = () => {
    triggerHaptic(50);
    audioEngine.playWiimoteSpeakerBeep();
    setTestState((prev) => ({ ...prev, isShaking: true }));
    setTimeout(() => setTestState((prev) => ({ ...prev, isShaking: false })), 250);
  };

  const triggerSwing = () => {
    triggerHaptic(60);
    audioEngine.playBowlingRoll();
    setTestState((prev) => ({ ...prev, btnB: true }));
    setTimeout(() => setTestState((prev) => ({ ...prev, btnB: false })), 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950/95 backdrop-blur-2xl text-white overflow-hidden select-none touch-none">
      {/* 1. TOP HEADER & STUDIO BAR */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 sm:px-6 bg-gray-900/80 z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/25">
            <Gamepad2 size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>{isHindi ? 'कंट्रोलर लेआउट & वि रिमोट स्टूडियो' : 'Controller Layout & Wii Remote Studio'}</span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/30">
                LIVE MOVE & RESIZE
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              {isHindi
                ? 'बटन को ड्रैग करके मूव करें, [+] और [-] से साइज बड़ा/छोटा करें, या वि रिमोट स्टाइल चुनें।'
                : 'Drag move handles to position buttons, tap +/- to resize, and choose Wii Remote modes.'}
            </p>
          </div>
        </div>

        {/* Close & Save Button */}
        <button
          onClick={() => {
            audioEngine.playWiimoteClick();
            onClose();
          }}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-black text-gray-950 shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition"
        >
          <Check size={16} />
          <span>{isHindi ? 'सेव और पूरा करें (DONE)' : 'SAVE & EXIT'}</span>
        </button>
      </div>

      {/* 2. SECONDARY CONTROLLER SWITCHER & PRESETS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 bg-black/60 z-20">
        {/* Wii Remote Controller Modes */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-amber-300 uppercase mr-1">
            {isHindi ? 'कंट्रोलर स्टाइल:' : 'Style:'}
          </span>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setControllerStyle('wiimote_nunchuk');
            }}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition border ${
              controllerStyle === 'wiimote_nunchuk'
                ? 'bg-sky-500 text-gray-950 border-white shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>Wii Remote + Nunchuk (वि रिमोट + ननचक)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setControllerStyle('wiimote_only');
            }}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition border ${
              controllerStyle === 'wiimote_only'
                ? 'bg-sky-500 text-gray-950 border-white shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>Wii Remote Only (स्टैंडअलोन रिमोट)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setControllerStyle('wiimote_sideways');
            }}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition border ${
              controllerStyle === 'wiimote_sideways'
                ? 'bg-sky-500 text-gray-950 border-white shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>Wii Sideways (हॉरिजॉन्टल मारियो)</span>
          </button>

          <button
            onClick={() => {
              audioEngine.playWiimoteClick();
              setControllerStyle('nds_dual');
            }}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition border ${
              controllerStyle === 'nds_dual'
                ? 'bg-amber-400 text-gray-950 border-white shadow-md'
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>Nintendo DS Dual</span>
          </button>
        </div>

        {/* Move/Resize Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black border transition ${
              isEditMode
                ? 'bg-amber-400 text-gray-950 border-white ring-2 ring-amber-300'
                : 'bg-white/10 text-gray-300 border-white/10'
            }`}
          >
            <Move size={13} />
            <span>{isEditMode ? 'DRAG MODE ACTIVE' : 'LOCKED (TEST BUTTONS)'}</span>
          </button>

          <button
            onClick={() => applyPreset(PHONE_THUMB_PRESET)}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
          >
            <Smartphone size={13} />
            <span>Phone</span>
          </button>

          <button
            onClick={() => applyPreset(TABLET_WIDE_PRESET)}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
          >
            <Tv size={13} />
            <span>Tablet</span>
          </button>

          <button
            onClick={() => applyPreset(DEFAULT_CUSTOM_LAYOUT)}
            className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/20 transition"
            title="Reset to default coordinates"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 3. SETTINGS QUICK BAR (OPACITY & HAPTICS & SIMULATE) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-2 bg-gray-900/60 text-xs z-20">
        <div className="flex items-center gap-4">
          {/* Opacity Slider */}
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-sky-400" />
            <span className="text-gray-300 text-[11px]">{isHindi ? 'ट्रांसपेरेंसी:' : 'Opacity:'}</span>
            <input
              type="range"
              min={0.2}
              max={1.0}
              step={0.05}
              value={settings.controllerOpacity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSettings((prev) => ({ ...prev, controllerOpacity: val }));
              }}
              className="w-24 accent-sky-400 cursor-pointer"
            />
            <span className="text-sky-400 font-mono font-bold text-[10px]">
              {Math.round(settings.controllerOpacity * 100)}%
            </span>
          </div>

          {/* Haptic Toggle */}
          <button
            onClick={() => {
              const next = !settings.hapticFeedback;
              setSettings((prev) => ({ ...prev, hapticFeedback: next }));
              if (next && 'vibrate' in navigator) navigator.vibrate(30);
            }}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold text-[11px] border transition ${
              settings.hapticFeedback
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            <Vibrate size={13} />
            <span>{settings.hapticFeedback ? 'Vibration: ON' : 'Vibration: OFF'}</span>
          </button>
        </div>

        {/* Shake & Swing Test Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerShake}
            className="flex items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 font-bold text-[11px] text-amber-300 border border-amber-500/30 active:scale-95 transition"
          >
            <Sparkles size={12} />
            <span>{isHindi ? 'शेक टेस्ट' : 'Test Shake'}</span>
          </button>

          <button
            onClick={triggerSwing}
            className="flex items-center gap-1 rounded-lg bg-sky-500/20 px-2.5 py-1 font-bold text-[11px] text-sky-300 border border-sky-500/30 active:scale-95 transition"
          >
            <Zap size={12} />
            <span>{isHindi ? 'स्विंग टेस्ट' : 'Test Swing'}</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN INTERACTIVE CANVAS WITH GRID */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Interactive Notice */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 border border-white/10 backdrop-blur-md pointer-events-none z-10 text-[11px] text-gray-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {isEditMode
              ? (isHindi
                  ? 'ड्रैग हैंडल्स पकड़कर कहीं भी रखें • [+] [-] से रीसाइज़ करें'
                  : 'Drag cluster handles to reposition • Tap [+] and [-] to scale')
              : (isHindi
                  ? 'लाइव टेस्टिंग मोड: सभी बटन और स्टिक्स को दबाकर चेक करें'
                  : 'Testing Mode: Touch any button, IR pad, or stick to verify')}
          </span>
        </div>

        {/* ============================================================== */}
        {/* A. WII REMOTE (VERTICAL STANDALONE OR WITH NUNCHUK)             */}
        {/* ============================================================== */}
        {(controllerStyle === 'wiimote_nunchuk' || controllerStyle === 'wiimote_only') && (
          <div
            style={{
              left: `${layout.wiimote.x}%`,
              bottom: `${layout.wiimote.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.wiimote.scale})`,
              transformOrigin: 'center center',
            }}
            className="absolute flex flex-col items-center touch-none z-30"
          >
            {/* Move & Resize Bar */}
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('wiimote', e)}
                onPointerMove={(e) => handleDragPointerMove('wiimote', e)}
                onPointerUp={handleDragPointerUp}
                className="mb-1 flex items-center justify-between gap-2 rounded-xl bg-amber-500/25 border-2 border-dashed border-amber-400 px-3 py-1 text-amber-300 w-full cursor-move shadow-xl backdrop-blur-md"
              >
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                  <Move size={12} />
                  <span>WII REMOTE</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => adjustClusterScale('wiimote', -0.1, e)}
                    className="h-5 w-5 rounded bg-black/70 flex items-center justify-center font-bold text-xs hover:bg-black"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono font-bold">
                    {Math.round(layout.wiimote.scale * 100)}%
                  </span>
                  <button
                    onClick={(e) => adjustClusterScale('wiimote', 0.1, e)}
                    className="h-5 w-5 rounded bg-black/70 flex items-center justify-center font-bold text-xs hover:bg-black"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Wii Remote Controller Body */}
            <div className="relative flex flex-col items-center rounded-3xl bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 text-gray-900 p-3 shadow-2xl border-2 border-white/80 w-36">
              {/* IR Touchpad */}
              <div
                ref={irPointerPadRef}
                onPointerDown={() => triggerHaptic(15)}
                className="mb-2 h-7 w-full rounded-xl bg-gray-900 flex items-center justify-center border border-gray-700 shadow-inner cursor-crosshair"
              >
                <div className="flex items-center gap-1 text-[9px] font-black text-cyan-400 uppercase tracking-wider">
                  <Compass size={11} className="animate-spin" style={{ animationDuration: '8s' }} />
                  <span>IR AIM PAD</span>
                </div>
              </div>

              {/* B Rear Trigger */}
              <button
                onPointerDown={() => handleBtnDown('btnB')}
                onPointerUp={() => handleBtnUp('btnB')}
                className={`mb-2 h-9 w-28 rounded-xl text-xs font-black transition border shadow-md flex items-center justify-center ${
                  testState.btnB
                    ? 'bg-amber-500 text-white scale-95'
                    : 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-900 border-gray-500'
                }`}
              >
                <span>B TRIGGER</span>
              </button>

              {/* D-Pad */}
              <div className="relative h-20 w-20 flex items-center justify-center mb-2">
                <div className="h-6 w-6 bg-gray-400 rounded-sm" />
                <button
                  onPointerDown={() => handleBtnDown('dpadUp')}
                  onPointerUp={() => handleBtnUp('dpadUp')}
                  className={`absolute top-0 h-8 w-6 rounded-t-md flex items-center justify-center text-xs font-black transition ${
                    testState.dpadUp ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadDown')}
                  onPointerUp={() => handleBtnUp('dpadDown')}
                  className={`absolute bottom-0 h-8 w-6 rounded-b-md flex items-center justify-center text-xs font-black transition ${
                    testState.dpadDown ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  ▼
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadLeft')}
                  onPointerUp={() => handleBtnUp('dpadLeft')}
                  className={`absolute left-0 h-6 w-8 rounded-l-md flex items-center justify-center text-xs font-black transition ${
                    testState.dpadLeft ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  ◀
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadRight')}
                  onPointerUp={() => handleBtnUp('dpadRight')}
                  className={`absolute right-0 h-6 w-8 rounded-r-md flex items-center justify-center text-xs font-black transition ${
                    testState.dpadRight ? 'bg-sky-500 text-white' : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  ▶
                </button>
              </div>

              {/* Large A Button */}
              <button
                onPointerDown={() => handleBtnDown('btnA')}
                onPointerUp={() => handleBtnUp('btnA')}
                className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-black shadow-lg transition-all ${
                  testState.btnA
                    ? 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white scale-95 ring-4 ring-sky-300'
                    : 'bg-white text-gray-900 border-2 border-gray-400'
                }`}
              >
                A
              </button>

              {/* -, Home, + */}
              <div className="mt-2 flex items-center justify-between w-full px-1">
                <button
                  onPointerDown={() => handleBtnDown('btnMinus')}
                  onPointerUp={() => handleBtnUp('btnMinus')}
                  className="h-6 w-6 rounded-full bg-gray-400 text-xs font-bold text-gray-900 flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => audioEngine.playWiimoteClick()}
                  className="h-7 w-7 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center shadow-md"
                >
                  🏠
                </button>
                <button
                  onPointerDown={() => handleBtnDown('btnPlus')}
                  onPointerUp={() => handleBtnUp('btnPlus')}
                  className="h-6 w-6 rounded-full bg-gray-400 text-xs font-bold text-gray-900 flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* 1 and 2 buttons */}
              <div className="mt-2 flex gap-2">
                <button
                  onPointerDown={() => handleBtnDown('btnOne')}
                  onPointerUp={() => handleBtnUp('btnOne')}
                  className={`h-7 w-7 rounded-full text-xs font-bold border transition ${
                    testState.btnOne ? 'bg-sky-500 text-white' : 'bg-gray-300 text-gray-800 border-gray-400'
                  }`}
                >
                  1
                </button>
                <button
                  onPointerDown={() => handleBtnDown('btnTwo')}
                  onPointerUp={() => handleBtnUp('btnTwo')}
                  className={`h-7 w-7 rounded-full text-xs font-bold border transition ${
                    testState.btnTwo ? 'bg-sky-500 text-white' : 'bg-gray-300 text-gray-800 border-gray-400'
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

        {/* ============================================================== */}
        {/* B. NUNCHUK ATTACHMENT                                           */}
        {/* ============================================================== */}
        {controllerStyle === 'wiimote_nunchuk' && (
          <div
            style={{
              left: `${layout.nunchuk.x}%`,
              bottom: `${layout.nunchuk.y}%`,
              transform: `translate(-50%, 50%) scale(${layout.nunchuk.scale})`,
              transformOrigin: 'center center',
            }}
            className="absolute flex flex-col items-center touch-none z-30"
          >
            {isEditMode && (
              <div
                onPointerDown={(e) => handleDragPointerDown('nunchuk', e)}
                onPointerMove={(e) => handleDragPointerMove('nunchuk', e)}
                onPointerUp={handleDragPointerUp}
                className="mb-1 flex items-center justify-between gap-2 rounded-xl bg-amber-500/25 border-2 border-dashed border-amber-400 px-3 py-1 text-amber-300 w-full cursor-move shadow-xl backdrop-blur-md"
              >
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                  <Move size={12} />
                  <span>NUNCHUK</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => adjustClusterScale('nunchuk', -0.1, e)}
                    className="h-5 w-5 rounded bg-black/70 flex items-center justify-center font-bold text-xs hover:bg-black"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono font-bold">
                    {Math.round(layout.nunchuk.scale * 100)}%
                  </span>
                  <button
                    onClick={(e) => adjustClusterScale('nunchuk', 0.1, e)}
                    className="h-5 w-5 rounded bg-black/70 flex items-center justify-center font-bold text-xs hover:bg-black"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* C & Z Trigger Row */}
            <div className="mb-2 flex w-full justify-between gap-2">
              <button
                onPointerDown={() => handleBtnDown('btnC')}
                onPointerUp={() => handleBtnUp('btnC')}
                className={`h-9 flex-1 rounded-xl text-xs font-bold transition border ${
                  testState.btnC ? 'bg-sky-500 text-white scale-95' : 'bg-gray-900/90 text-gray-300 border-white/20'
                }`}
              >
                C
              </button>
              <button
                onPointerDown={() => handleBtnDown('btnZ')}
                onPointerUp={() => handleBtnUp('btnZ')}
                className={`h-9 flex-1 rounded-xl text-xs font-bold transition border ${
                  testState.btnZ ? 'bg-sky-500 text-white scale-95' : 'bg-gray-900/90 text-gray-300 border-white/20'
                }`}
              >
                Z Trg
              </button>
            </div>

            {/* Analog Nunchuk Stick */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-b from-gray-900/95 to-gray-950/95 shadow-2xl backdrop-blur-xl border border-white/20">
              <div className="absolute h-full w-[1px] bg-white/10" />
              <div className="absolute h-[1px] w-full bg-white/10" />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-gray-200 to-white shadow-xl border-2 border-gray-400">
                <div className="h-6 w-6 rounded-full bg-gray-300 border border-gray-400/50" />
              </div>
            </div>
            <span className="mt-1 text-[10px] font-black uppercase text-gray-400">NUNCHUK STICK</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* C. WII REMOTE SIDEWAYS (HORIZONTAL MARIO MODE)                  */}
        {/* ============================================================== */}
        {controllerStyle === 'wiimote_sideways' && (
          <>
            {/* Left D-pad */}
            <div
              style={{
                left: `${layout.dpad.x}%`,
                bottom: `${layout.dpad.y}%`,
                transform: `translate(-50%, 50%) scale(${layout.dpad.scale})`,
              }}
              className="absolute flex flex-col items-center touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('dpad', e)}
                  onPointerMove={(e) => handleDragPointerMove('dpad', e)}
                  onPointerUp={handleDragPointerUp}
                  className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
                >
                  <span>[MOVE D-PAD]</span>
                  <button onClick={(e) => adjustClusterScale('dpad', 0.1, e)}>+</button>
                  <button onClick={(e) => adjustClusterScale('dpad', -0.1, e)}>-</button>
                </div>
              )}
              <div className="relative h-28 w-28 flex items-center justify-center">
                <button
                  onPointerDown={() => handleBtnDown('dpadUp')}
                  onPointerUp={() => handleBtnUp('dpadUp')}
                  className="absolute top-0 h-10 w-8 rounded-t-lg bg-gray-800 text-white flex items-center justify-center text-xs font-bold"
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadDown')}
                  onPointerUp={() => handleBtnUp('dpadDown')}
                  className="absolute bottom-0 h-10 w-8 rounded-b-lg bg-gray-800 text-white flex items-center justify-center text-xs font-bold"
                >
                  ▼
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadLeft')}
                  onPointerUp={() => handleBtnUp('dpadLeft')}
                  className="absolute left-0 h-8 w-10 rounded-l-lg bg-gray-800 text-white flex items-center justify-center text-xs font-bold"
                >
                  ◀
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadRight')}
                  onPointerUp={() => handleBtnUp('dpadRight')}
                  className="absolute right-0 h-8 w-10 rounded-r-lg bg-gray-800 text-white flex items-center justify-center text-xs font-bold"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Right 1 and 2 Buttons */}
            <div
              style={{
                left: `${layout.faceButtons.x}%`,
                bottom: `${layout.faceButtons.y}%`,
                transform: `translate(-50%, 50%) scale(${layout.faceButtons.scale})`,
              }}
              className="absolute flex items-center gap-4 touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('faceButtons', e)}
                  onPointerMove={(e) => handleDragPointerMove('faceButtons', e)}
                  onPointerUp={handleDragPointerUp}
                  className="absolute -top-7 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
                >
                  <span>[MOVE 1/2]</span>
                  <button onClick={(e) => adjustClusterScale('faceButtons', 0.1, e)}>+</button>
                  <button onClick={(e) => adjustClusterScale('faceButtons', -0.1, e)}>-</button>
                </div>
              )}
              <button
                onPointerDown={() => handleBtnDown('btnOne')}
                onPointerUp={() => handleBtnUp('btnOne')}
                className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-black transition border shadow-lg ${
                  testState.btnOne ? 'bg-sky-500 text-white scale-95' : 'bg-gray-900 text-white border-white/30'
                }`}
              >
                1
              </button>
              <button
                onPointerDown={() => handleBtnDown('btnTwo')}
                onPointerUp={() => handleBtnUp('btnTwo')}
                className={`h-14 w-14 rounded-full flex items-center justify-center text-lg font-black transition border shadow-lg ${
                  testState.btnTwo ? 'bg-rose-500 text-white scale-95' : 'bg-gray-900 text-white border-white/30'
                }`}
              >
                2
              </button>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* D. NINTENDO DS DUAL CONTROLLER                                  */}
        {/* ============================================================== */}
        {controllerStyle === 'nds_dual' && (
          <>
            {/* L & R Bumpers */}
            <div
              style={{
                left: `${layout.shoulderL.x}%`,
                bottom: `${layout.shoulderL.y}%`,
                transform: `translate(-50%, 50%) scale(${layout.shoulderL.scale})`,
              }}
              className="absolute touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('shoulderL', e)}
                  onPointerMove={(e) => handleDragPointerMove('shoulderL', e)}
                  onPointerUp={handleDragPointerUp}
                  className="absolute -top-6 text-[9px] font-bold text-amber-400 cursor-move"
                >
                  [L]
                </div>
              )}
              <button
                onPointerDown={() => handleBtnDown('btnL')}
                onPointerUp={() => handleBtnUp('btnL')}
                className="h-11 w-20 rounded-2xl bg-gray-900/90 text-gray-300 border border-white/20 text-xs font-black"
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
              className="absolute touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('shoulderR', e)}
                  onPointerMove={(e) => handleDragPointerMove('shoulderR', e)}
                  onPointerUp={handleDragPointerUp}
                  className="absolute -top-6 text-[9px] font-bold text-amber-400 cursor-move"
                >
                  [R]
                </div>
              )}
              <button
                onPointerDown={() => handleBtnDown('btnR')}
                onPointerUp={() => handleBtnUp('btnR')}
                className="h-11 w-20 rounded-2xl bg-gray-900/90 text-gray-300 border border-white/20 text-xs font-black"
              >
                [ R ]
              </button>
            </div>

            {/* D-Pad */}
            <div
              style={{
                left: `${layout.dpad.x}%`,
                bottom: `${layout.dpad.y}%`,
                transform: `translate(-50%, 50%) scale(${layout.dpad.scale})`,
              }}
              className="absolute flex flex-col items-center touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('dpad', e)}
                  onPointerMove={(e) => handleDragPointerMove('dpad', e)}
                  onPointerUp={handleDragPointerUp}
                  className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
                >
                  <span>[MOVE D-PAD]</span>
                  <button onClick={(e) => adjustClusterScale('dpad', 0.1, e)}>+</button>
                  <button onClick={(e) => adjustClusterScale('dpad', -0.1, e)}>-</button>
                </div>
              )}
              <div className="relative h-32 w-32 flex items-center justify-center">
                <button
                  onPointerDown={() => handleBtnDown('dpadUp')}
                  onPointerUp={() => handleBtnUp('dpadUp')}
                  className="absolute top-0 h-12 w-10 rounded-t-xl bg-gray-900/90 text-gray-200 border border-white/20 flex items-center justify-center"
                >
                  ▲
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadDown')}
                  onPointerUp={() => handleBtnUp('dpadDown')}
                  className="absolute bottom-0 h-12 w-10 rounded-b-xl bg-gray-900/90 text-gray-200 border border-white/20 flex items-center justify-center"
                >
                  ▼
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadLeft')}
                  onPointerUp={() => handleBtnUp('dpadLeft')}
                  className="absolute left-0 h-10 w-12 rounded-l-xl bg-gray-900/90 text-gray-200 border border-white/20 flex items-center justify-center"
                >
                  ◀
                </button>
                <button
                  onPointerDown={() => handleBtnDown('dpadRight')}
                  onPointerUp={() => handleBtnUp('dpadRight')}
                  className="absolute right-0 h-10 w-12 rounded-r-xl bg-gray-900/90 text-gray-200 border border-white/20 flex items-center justify-center"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* A/B/X/Y Diamond */}
            <div
              style={{
                left: `${layout.faceButtons.x}%`,
                bottom: `${layout.faceButtons.y}%`,
                transform: `translate(-50%, 50%) scale(${layout.faceButtons.scale})`,
              }}
              className="absolute flex flex-col items-center touch-none z-30"
            >
              {isEditMode && (
                <div
                  onPointerDown={(e) => handleDragPointerDown('faceButtons', e)}
                  onPointerMove={(e) => handleDragPointerMove('faceButtons', e)}
                  onPointerUp={handleDragPointerUp}
                  className="mb-1 flex items-center justify-between gap-1 rounded-lg bg-amber-500/25 border border-amber-400 px-2 py-0.5 text-amber-300 cursor-move text-[9px] font-black"
                >
                  <span>[MOVE A/B/X/Y]</span>
                  <button onClick={(e) => adjustClusterScale('faceButtons', 0.1, e)}>+</button>
                  <button onClick={(e) => adjustClusterScale('faceButtons', -0.1, e)}>-</button>
                </div>
              )}
              <div className="relative h-36 w-36 flex items-center justify-center">
                <button
                  onPointerDown={() => handleBtnDown('btnX')}
                  onPointerUp={() => handleBtnUp('btnX')}
                  className="absolute top-0 h-12 w-12 rounded-full bg-gray-900/95 text-amber-300 border border-amber-500/40 flex items-center justify-center text-base font-black shadow-lg"
                >
                  X
                </button>
                <button
                  onPointerDown={() => handleBtnDown('btnA')}
                  onPointerUp={() => handleBtnUp('btnA')}
                  className="absolute right-0 h-12 w-12 rounded-full bg-gray-900/95 text-rose-300 border border-rose-500/40 flex items-center justify-center text-base font-black shadow-lg"
                >
                  A
                </button>
                <button
                  onPointerDown={() => handleBtnDown('btnB')}
                  onPointerUp={() => handleBtnUp('btnB')}
                  className="absolute bottom-0 h-12 w-12 rounded-full bg-gray-900/95 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-base font-black shadow-lg"
                >
                  B
                </button>
                <button
                  onPointerDown={() => handleBtnDown('btnY')}
                  onPointerUp={() => handleBtnUp('btnY')}
                  className="absolute left-0 h-12 w-12 rounded-full bg-gray-900/95 text-sky-300 border border-sky-500/40 flex items-center justify-center text-base font-black shadow-lg"
                >
                  Y
                </button>
              </div>
            </div>
          </>
        )}

        {/* Start / Select Row */}
        <div
          style={{
            left: `${layout.menuButtons.x}%`,
            bottom: `${layout.menuButtons.y}%`,
            transform: `translate(-50%, 50%) scale(${layout.menuButtons.scale})`,
          }}
          className="absolute flex items-center gap-4 touch-none z-30"
        >
          <button
            onPointerDown={() => handleBtnDown('btnSelect')}
            onPointerUp={() => handleBtnUp('btnSelect')}
            className="rounded-xl px-4 py-1.5 text-[11px] font-black bg-gray-900/90 text-gray-400 border border-white/10"
          >
            SELECT
          </button>
          <button
            onPointerDown={() => handleBtnDown('btnStart')}
            onPointerUp={() => handleBtnUp('btnStart')}
            className="rounded-xl px-4 py-1.5 text-[11px] font-black bg-gray-900/90 text-gray-400 border border-white/10"
          >
            START
          </button>
        </div>
      </div>
    </div>
  );
};
