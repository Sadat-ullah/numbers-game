class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  public isMusicPlaying = false;
  private musicIntervalId: number | null = null;

  public musicMuted = false;
  public sfxMuted = false;

  constructor() {
    // Read user audio preferences from localStorage
    const savedMusic = localStorage.getItem('nb_music_muted');
    const savedSfx = localStorage.getItem('nb_sfx_muted');
    this.musicMuted = savedMusic === 'true';
    this.sfxMuted = savedSfx === 'true';
  }

  public initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicMuted ? 0 : 0.28;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxMuted ? 0 : 0.45;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initContext();
    if (!this.musicMuted && !this.isMusicPlaying) {
      this.startStudioMusic();
    }
  }

  public setMusicMuted(muted: boolean) {
    this.musicMuted = muted;
    localStorage.setItem('nb_music_muted', String(muted));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(muted ? 0 : 0.28, this.ctx.currentTime, 0.05);
    }
    if (!muted && !this.isMusicPlaying) {
      this.startStudioMusic();
    }
  }

  public setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
    localStorage.setItem('nb_sfx_muted', String(muted));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(muted ? 0 : 0.45, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Tactile wooden tile pickup click
   */
  public playTilePickup() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, t);
    filter.Q.setValueAtTime(3, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Crisp mechanical / magnetic snap when tile slots into place
   */
  public playTileSnap() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Transient snap click
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    oscClick.type = 'sine';
    oscClick.frequency.setValueAtTime(1200, t);
    oscClick.frequency.exponentialRampToValueAtTime(240, t + 0.035);
    gainClick.gain.setValueAtTime(0.5, t);
    gainClick.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    oscClick.connect(gainClick);
    gainClick.connect(this.sfxGain);
    oscClick.start(t);
    oscClick.stop(t + 0.035);

    // Warm resonant wood/magnetic body
    const oscRes = this.ctx.createOscillator();
    const gainRes = this.ctx.createGain();
    oscRes.type = 'triangle';
    oscRes.frequency.setValueAtTime(440, t);
    oscRes.frequency.exponentialRampToValueAtTime(220, t + 0.08);
    gainRes.gain.setValueAtTime(0.4, t);
    gainRes.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    oscRes.connect(gainRes);
    gainRes.connect(this.sfxGain);
    oscRes.start(t);
    oscRes.stop(t + 0.08);
  }

  /**
   * Soft muted thud on invalid equation submit
   */
  public playInvalidShake() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, t);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Warm harmonic chord flourish upon level completion
   */
  public playLevelSuccess() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.85);
    });
  }

  /**
   * Cute procedural marimba voice chirp for mascot Pip
   */
  public playMascotChirp() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Two playful ascending marimba notes
    const freqs = [587.33, 880.00]; // D5, A5
    freqs.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const overtone = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 3, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      overtone.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      overtone.start(t);
      osc.stop(t + 0.25);
      overtone.stop(t + 0.25);
    });
  }

  /**
   * Excited celebratory trill when mascot cheers
   */
  public playMascotCelebrate() {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = this.ctx!.currentTime + idx * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  /**
   * Procedural Lo-Fi Kalimba ambient background loop
   */
  public startStudioMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 261.63, 349.23], // F major
      [196.00, 246.94, 293.66], // G major
    ];

    let step = 0;
    const playKalimbaNote = (freq: number, delaySec: number) => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime + delaySec;

      const osc = this.ctx.createOscillator();
      const oscOvertone = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(freq * 3.2, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      oscOvertone.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      oscOvertone.start(t);
      osc.stop(t + 1.25);
      oscOvertone.stop(t + 1.25);
    };

    const schedulePattern = () => {
      if (!this.isMusicPlaying) return;
      const chord = chords[step % chords.length];
      chord.forEach((freq, idx) => {
        playKalimbaNote(freq, idx * 0.45);
      });
      playKalimbaNote(chord[0] * 2, 0.9);
      step++;
    };

    schedulePattern();
    this.musicIntervalId = window.setInterval(schedulePattern, 2400);
  }

  public stopStudioMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const sound = new SoundEngine();

// Expose sound engine to window for root audio synchronization and testing
if (typeof window !== 'undefined') {
  (window as unknown as { __sound: SoundEngine }).__sound = sound;
}

// Auto-unlock Web Audio context and start music on very first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    sound.unlockAudio();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}
