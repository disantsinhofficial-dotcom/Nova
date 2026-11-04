/**
 * Audio Engine for NovaWii HD
 * Uses Web Audio API for zero-latency, realistic Wii sound synthesis
 */

class WiiAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmTimer: number | null = null;
  private engineSoundOsc: OscillatorNode | null = null;
  private engineSoundGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;

  constructor() {
    // Initialized on first user interaction to comply with browser audio policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  // Play Wii Remote Pointer Hover / Select Sound
  public playWiimoteHover() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback safe
    }
  }

  // Play Wiimote A button click
  public playWiimoteClick() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.07); // E5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Play Wiimote Speaker Chime (iconic Lo-Fi speaker click/beep)
  public playWiimoteSpeakerBeep() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Square wave to mimic the tiny piezo speaker on the Wiimote
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }

  // Play Bowling roll and pin hit
  public playBowlingRoll() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      // White noise buffer for rolling sound
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(180, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start();
    } catch {}
  }

  public playPinStrike(isStrike: boolean = false) {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const frequencies = isStrike ? [420, 680, 940, 1260, 1600] : [510, 780, 1100];
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(isStrike ? 0.25 : 0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
      });
    } catch {}
  }

  // Play Mario Jump Sound
  public playMarioJump() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Play Star Bit Twinkle
  public playStarBit() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1318.5, this.ctx.currentTime); // E6
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.05); // A6
      osc.frequency.setValueAtTime(2093, this.ctx.currentTime + 0.1); // C7

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Mario Spin Attack / Launch Star
  public playSpinAttack() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.12);
      osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Zelda Sword Slash
  public playSwordSlash() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  // Kart Engine continuous sound
  public startKartEngine() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain || this.engineSoundOsc) return;

      this.engineSoundOsc = this.ctx.createOscillator();
      this.engineSoundGain = this.ctx.createGain();

      this.engineSoundOsc.type = 'sawtooth';
      this.engineSoundOsc.frequency.setValueAtTime(80, this.ctx.currentTime);

      this.engineSoundGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

      this.engineSoundOsc.connect(this.engineSoundGain);
      this.engineSoundGain.connect(this.sfxGain);
      this.engineSoundOsc.start();
    } catch {}
  }

  public updateKartEngineSpeed(speedRatio: number) {
    if (this.engineSoundOsc && this.ctx) {
      const baseFreq = 70;
      const maxFreq = 240;
      const targetFreq = baseFreq + speedRatio * (maxFreq - baseFreq);
      this.engineSoundOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    }
  }

  public stopKartEngine() {
    if (this.engineSoundOsc) {
      try {
        this.engineSoundOsc.stop();
        this.engineSoundOsc.disconnect();
      } catch {}
      this.engineSoundOsc = null;
      this.engineSoundGain = null;
    }
  }

  // Turbo boost burst
  public playTurboBoost() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }

  // Wii Disc Insertion Motor Sound
  public playDiscInsertSound() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1400, this.ctx.currentTime + 0.25);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);
    } catch {}
  }

  // Wii Channel Selection Ding
  public playChannelDing() {
    try {
      this.initCtx();
      if (!this.ctx || !this.sfxGain) return;
      const notes = [587.33, 880, 1174.66]; // D5, A5, D6
      notes.forEach((freq, index) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + index * 0.05);

        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + index * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime + index * 0.05);
        osc.stop(this.ctx.currentTime + index * 0.05 + 0.4);
      });
    } catch {}
  }

  // Ambient Wii Menu BGM loop (Calm soothing synth tones)
  public startWiiMenuBgm() {
    this.stopBgm();
    try {
      this.initCtx();
      if (!this.ctx || !this.bgmGain) return;

      const chords = [
        [329.63, 440, 523.25], // E4, A4, C5
        [293.66, 392, 493.88], // D4, G4, B4
        [261.63, 329.63, 392], // C4, E4, G4
        [293.66, 369.99, 440]  // D4, F#4, A4
      ];
      let chordIndex = 0;

      const playNextChord = () => {
        if (!this.ctx || !this.bgmGain || this.isMuted) return;
        const currentChord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        currentChord.forEach((note) => {
          if (!this.ctx || !this.bgmGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.2);

          osc.connect(gain);
          gain.connect(this.bgmGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 2.2);
        });
      };

      playNextChord();
      this.bgmTimer = window.setInterval(playNextChord, 2200);
    } catch {}
  }

  public stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmOscillator) {
      try {
        this.bgmOscillator.stop();
        this.bgmOscillator.disconnect();
      } catch {}
      this.bgmOscillator = null;
    }
  }
}

export const audioEngine = new WiiAudioEngine();
