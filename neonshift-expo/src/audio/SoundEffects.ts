/**
 * Safe audio effect generator and player for Expo Go.
 * Uses dynamic discovery for expo-audio so that if any native audio module
 * is absent on a particular Expo Go client, the game continues running
 * without crashing.
 */

let createAudioPlayerFn: ((source: any, options?: any) => any) | null = null;
let setAudioModeAsyncFn: ((mode: any) => Promise<void>) | null = null;

try {
  // Safe dynamic require to avoid top-level bundle failures if native module is absent
  const ExpoAudio = require('expo-audio');
  if (ExpoAudio) {
    createAudioPlayerFn = ExpoAudio.createAudioPlayer;
    setAudioModeAsyncFn = ExpoAudio.setAudioModeAsync;
  }
} catch {
  // Native audio module not available in this client; falls back to silent operation
}

export class SoundEffects {
  private static sfxEnabled = true;
  private static musicEnabled = true;
  private static audioInitialized = false;
  private static bgmPlayer: any = null;
  private static isBgmPlaying = false;

  private static soundCache: Map<string, any> = new Map();

  public static setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  public static setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    } else {
      if (!this.isBgmPlaying) {
        this.startBgm();
      }
    }
  }

  public static isMusicActive(): boolean {
    return this.musicEnabled;
  }

  public static async init(): Promise<void> {
    if (this.audioInitialized) return;
    try {
      if (setAudioModeAsyncFn) {
        await setAudioModeAsyncFn({
          playsInSilentMode: true,
        });
      }
      this.audioInitialized = true;
    } catch {
      // Audio permission or platform limitation fallback
    }
  }

  /**
   * Generates a world-class, AAA high-energy cyber electro game anthem.
   * 128 BPM driving electro groove with pumping kick, rolling 16th-note octave bass,
   * sparkling 16th arpeggios, lush stereo pads, and anthemic heroic lead melody.
   */
  private static generateBgmWavUri(): string {
    const sampleRate = 22050;
    const bpm = 128;
    const beatDuration = 60 / bpm; // ~0.46875s
    const totalBeats = 16;
    const duration = totalBeats * beatDuration; // ~7.50s
    const numSamples = Math.floor(duration * sampleRate);

    // Dynamic Progression: Dm -> Bb -> C -> Am (Energetic World-Class Anthem)
    const chordRoots = [73.42, 58.27, 65.41, 55.00]; // D2, Bb1, C2, A1
    const chordPads = [
      [146.83, 220.00, 293.66, 349.23], // Dm (D3, A3, D4, F4)
      [116.54, 174.61, 233.08, 293.66], // Bb (Bb2, F3, Bb3, D4)
      [130.81, 196.00, 261.63, 329.63], // C  (C3, G3, C4, E4)
      [110.00, 164.81, 220.00, 261.63], // Am (A2, E3, A3, C4)
    ];

    // Uplifting World-Class Heroic Lead Hook across 16 beats
    const leadNotes = [
      440.00, 523.25, 587.33, 659.25, // A4, C5, D5, E5 (Heroic ascent)
      587.33, 523.25, 466.16, 587.33, // D5, C5, Bb4, D5 (High flight)
      523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5 (Apex rush)
      587.33, 523.25, 440.00, 392.00, // D5, C5, A4, G4 (Anthemic resolution)
    ];

    // Fast 16th-note sparkling arpeggiator notes per bar
    const arpNotes = [
      [293.66, 349.23, 440.00, 587.33], // Dm arpeggio
      [233.08, 293.66, 349.23, 466.16], // Bb arpeggio
      [261.63, 329.63, 392.00, 523.25], // C arpeggio
      [220.00, 261.63, 329.63, 440.00], // Am arpeggio
    ];

    return this.generateWavUri(duration, sampleRate, (t) => {
      const beat = (t / beatDuration) % totalBeats;
      const beatIndex = Math.floor(beat);
      const barIndex = Math.floor(beatIndex / 4) % 4;
      const beatFrac = beat % 1;
      const sixteenth = (beat * 4) % 1;
      const sixteenthIndex = Math.floor(beat * 4) % 4;

      // 1. Driving Pumping 4-on-the-floor Electro Kick (tight 58Hz punch, zero harsh noise)
      const kickFreq = 52 + 65 * Math.exp(-beatFrac * 18);
      const kick = Math.sin(2 * Math.PI * kickFreq * t) * Math.exp(-beatFrac * 8.5) * 0.18;

      // 2. Rolling 16th-note Electro Octave Bass (rich energetic drive)
      const rootF = chordRoots[barIndex];
      const octaveMult = (Math.floor(beat * 4) % 2 === 1) ? 2.0 : 1.0;
      const bassFreq = rootF * octaveMult;
      const bassEnv = Math.exp(-sixteenth * 3.8);
      const bass = (
        Math.sin(2 * Math.PI * bassFreq * t) * 0.22 +
        Math.sin(2 * Math.PI * (bassFreq * 1.5) * t) * 0.06
      ) * bassEnv;

      // 3. Sparkling High-Energy 16th-Note Arpeggiator (Game EDM feel)
      const currentArpNote = arpNotes[barIndex][sixteenthIndex];
      const arpEnv = Math.exp(-sixteenth * 5.0);
      const arp = Math.sin(2 * Math.PI * currentArpNote * t) * 0.055 * arpEnv;

      // 4. Lush Stereo Chorus Chord Pads (warm body)
      const pads = chordPads[barIndex];
      let pad = 0;
      for (let p = 0; p < pads.length; p++) {
        const fn = pads[p];
        pad += (
          Math.sin(2 * Math.PI * fn * t) +
          0.4 * Math.sin(2 * Math.PI * (fn * 1.005) * t)
        ) * 0.025;
      }

      // 5. Anthemic World-Class Heroic Lead Synth (soaring hook)
      const leadFreq = leadNotes[beatIndex];
      const leadEnv = Math.sin(Math.min(Math.PI, beatFrac * Math.PI * 1.15)) * Math.exp(-beatFrac * 0.45);
      const vib = 1 + Math.sin(2 * Math.PI * 5.2 * t) * 0.009;
      const lead = (
        Math.sin(2 * Math.PI * leadFreq * vib * t) * 0.70 +
        Math.sin(2 * Math.PI * (leadFreq * 2) * vib * t) * 0.16 +
        Math.sin(2 * Math.PI * (leadFreq * 3) * vib * t) * 0.05
      ) * 0.13 * leadEnv;

      // Master World-Class EDM mix with analog tape saturation
      const mix = (kick + bass + arp + pad + lead) * 0.65;
      return Math.tanh(mix);
    });
  }

  public static async startBgm(): Promise<void> {
    if (!this.musicEnabled || !createAudioPlayerFn) return;
    await this.init();

    try {
      if (!this.bgmPlayer) {
        const uri = this.generateBgmWavUri();
        this.bgmPlayer = createAudioPlayerFn({ uri });
      }

      if (this.bgmPlayer) {
        try {
          this.bgmPlayer.loop = true;
          if (typeof this.bgmPlayer.setLooping === 'function') {
            this.bgmPlayer.setLooping(true);
          }
          if (typeof this.bgmPlayer.setVolume === 'function') {
            this.bgmPlayer.setVolume(0.18); // Low, comfortable, non-intrusive volume
          }
        } catch {}

        if (typeof this.bgmPlayer.play === 'function') {
          this.bgmPlayer.play();
        }
        this.isBgmPlaying = true;
      }
    } catch {
      // Safe fallback
    }
  }

  public static pauseBgm(): void {
    if (this.bgmPlayer && typeof this.bgmPlayer.pause === 'function') {
      try {
        this.bgmPlayer.pause();
      } catch {}
    }
    this.isBgmPlaying = false;
  }

  public static resumeBgm(): void {
    if (this.musicEnabled && this.bgmPlayer && typeof this.bgmPlayer.play === 'function') {
      try {
        this.bgmPlayer.play();
        this.isBgmPlaying = true;
      } catch {}
    }
  }

  public static stopBgm(): void {
    if (this.bgmPlayer) {
      try {
        if (typeof this.bgmPlayer.pause === 'function') {
          this.bgmPlayer.pause();
        }
        if (typeof this.bgmPlayer.seekTo === 'function') {
          this.bgmPlayer.seekTo(0);
        }
      } catch {}
    }
    this.isBgmPlaying = false;
  }

  /**
   * Generates a base64 PCM 8-bit mono WAV data URI.
   */
  private static generateWavUri(durationSec: number, sampleRate: number, sampleFn: (t: number) => number): string {
    const numSamples = Math.floor(durationSec * sampleRate);
    const headerByteLength = 44;
    const totalByteLength = headerByteLength + numSamples;

    const buffer = new Uint8Array(totalByteLength);

    // RIFF chunk descriptor
    buffer[0] = 0x52; buffer[1] = 0x49; buffer[2] = 0x46; buffer[3] = 0x46; // "RIFF"
    const fileSize = totalByteLength - 8;
    buffer[4] = fileSize & 0xff;
    buffer[5] = (fileSize >> 8) & 0xff;
    buffer[6] = (fileSize >> 16) & 0xff;
    buffer[7] = (fileSize >> 24) & 0xff;
    buffer[8] = 0x57; buffer[9] = 0x41; buffer[10] = 0x56; buffer[11] = 0x45; // "WAVE"

    // "fmt " sub-chunk
    buffer[12] = 0x66; buffer[13] = 0x6d; buffer[14] = 0x74; buffer[15] = 0x20;
    buffer[16] = 16; buffer[17] = 0; buffer[18] = 0; buffer[19] = 0; // Subchunk1Size = 16
    buffer[20] = 1; buffer[21] = 0; // AudioFormat = 1 (PCM)
    buffer[22] = 1; buffer[23] = 0; // NumChannels = 1 (Mono)
    buffer[24] = sampleRate & 0xff;
    buffer[25] = (sampleRate >> 8) & 0xff;
    buffer[26] = (sampleRate >> 16) & 0xff;
    buffer[27] = (sampleRate >> 24) & 0xff;
    // ByteRate = SampleRate * 1 (8-bit mono)
    buffer[28] = sampleRate & 0xff;
    buffer[29] = (sampleRate >> 8) & 0xff;
    buffer[30] = (sampleRate >> 16) & 0xff;
    buffer[31] = (sampleRate >> 24) & 0xff;
    buffer[32] = 1; buffer[33] = 0; // BlockAlign = 1
    buffer[34] = 8; buffer[35] = 0; // BitsPerSample = 8

    // "data" sub-chunk
    buffer[36] = 0x64; buffer[37] = 0x61; buffer[38] = 0x74; buffer[39] = 0x61;
    buffer[40] = numSamples & 0xff;
    buffer[41] = (numSamples >> 8) & 0xff;
    buffer[42] = (numSamples >> 16) & 0xff;
    buffer[43] = (numSamples >> 24) & 0xff;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = sampleFn(t);
      sample = Math.max(-1, Math.min(1, sample));
      buffer[headerByteLength + i] = Math.floor((sample + 1) * 127.5);
    }

    // Convert buffer to Base64 in pure TypeScript
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let b64 = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i += 3) {
      const b0 = buffer[i];
      const b1 = i + 1 < len ? buffer[i + 1] : 0;
      const b2 = i + 2 < len ? buffer[i + 2] : 0;
      b64 += chars[b0 >> 2];
      b64 += chars[((b0 & 3) << 4) | (b1 >> 4)];
      b64 += i + 1 < len ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
      b64 += i + 2 < len ? chars[b2 & 63] : '=';
    }

    return `data:audio/wav;base64,${b64}`;
  }

  private static async playGenerated(key: string, duration: number, sampleFn: (t: number) => number): Promise<void> {
    if (!this.sfxEnabled || !createAudioPlayerFn) return;
    await this.init();

    try {
      let player = this.soundCache.get(key);
      if (!player) {
        const uri = this.generateWavUri(duration, 22050, sampleFn);
        player = createAudioPlayerFn({ uri });
        this.soundCache.set(key, player);
      }
      if (player) {
        if (typeof player.seekTo === 'function') {
          player.seekTo(0);
        }
        if (typeof player.play === 'function') {
          player.play();
        }
      }
    } catch {
      // Safe fallback: never crash UI
    }
  }

  public static async playLaneShift(): Promise<void> {
    await this.playGenerated('lane_shift', 0.08, (t) => {
      const freq = 600 - t * 2500;
      return Math.sin(2 * Math.PI * Math.max(200, freq) * t) * Math.exp(-t * 30);
    });
  }

  public static async playJump(): Promise<void> {
    await this.playGenerated('jump', 0.22, (t) => {
      const freq = 180 + t * 900;
      const wave = Math.sin(2 * Math.PI * freq * t);
      return wave * (1 - t / 0.22);
    });
  }

  public static async playLand(): Promise<void> {
    await this.playGenerated('land', 0.12, (t) => {
      const freq = 110 - t * 400;
      return Math.sin(2 * Math.PI * Math.max(50, freq) * t) * Math.exp(-t * 25);
    });
  }

  public static async playCollect(): Promise<void> {
    await this.playGenerated('collect', 0.16, (t) => {
      const freq = t < 0.08 ? 880 : 1320;
      const sub = Math.sin(2 * Math.PI * freq * t);
      const overtone = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
      return (sub + overtone) * Math.exp(-t * 12);
    });
  }

  public static async playNearMiss(): Promise<void> {
    await this.playGenerated('near_miss', 0.28, (t) => {
      const freq = 220 - t * 450;
      const noise = (Math.random() * 2 - 1) * 0.15;
      return (Math.sin(2 * Math.PI * Math.max(60, freq) * t) + noise) * Math.exp(-t * 8);
    });
  }

  public static async playPowerUp(): Promise<void> {
    await this.playGenerated('power_up', 0.35, (t) => {
      let freq = 440;
      if (t > 0.22) freq = 880;
      else if (t > 0.11) freq = 660;
      return Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.35);
    });
  }

  public static async playShieldBreak(): Promise<void> {
    await this.playGenerated('shield_break', 0.3, (t) => {
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 14);
      const ring = Math.sin(2 * Math.PI * 950 * t) * Math.exp(-t * 18);
      return (noise * 0.7 + ring * 0.3);
    });
  }

  public static async playCollision(): Promise<void> {
    await this.playGenerated('collision', 0.45, (t) => {
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 6);
      const sub = Math.sin(2 * Math.PI * 75 * t) * Math.exp(-t * 5);
      return (noise * 0.6 + sub * 0.4);
    });
  }

  public static async playWarning(): Promise<void> {
    await this.playGenerated('warning', 0.2, (t) => {
      const freq = 880;
      return Math.sin(2 * Math.PI * freq * t) * (1 - t / 0.2);
    });
  }

  public static async playBoost(): Promise<void> {
    await this.playGenerated('boost_ignite', 0.25, (t) => {
      const freq = 180 + t * 680;
      const noise = (Math.random() * 2 - 1) * 0.2;
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.8;
      return (wave + noise) * (1 - t / 0.25);
    });
  }

  public static async playBlaster(): Promise<void> {
    await this.playGenerated('blaster_shot', 0.12, (t) => {
      const freq = 1400 - t * 6000;
      const carrier = Math.sin(2 * Math.PI * Math.max(220, freq) * t);
      const sub = Math.sin(2 * Math.PI * Math.max(110, freq * 0.5) * t) * 0.4;
      return (carrier + sub) * (1 - t / 0.12);
    });
  }

  public static async playExplosion(): Promise<void> {
    await this.playGenerated('obstacle_blast', 0.36, (t) => {
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 9);
      const subBoom = Math.sin(2 * Math.PI * 65 * Math.exp(-t * 6) * t) * Math.exp(-t * 4);
      return (noise * 0.7 + subBoom * 0.6);
    });
  }

  public static async playStageClear(): Promise<void> {
    await this.playGenerated('stage_clear', 0.42, (t) => {
      // Ascending cyber chime fanfare
      let freq = 523.25; // C5
      if (t > 0.30) freq = 1046.50; // C6
      else if (t > 0.20) freq = 783.99; // G5
      else if (t > 0.10) freq = 659.25; // E5
      const wave = Math.sin(2 * Math.PI * freq * t);
      const harmonic = Math.sin(2 * Math.PI * (freq * 2) * t) * 0.3;
      return (wave + harmonic) * (1 - t / 0.42);
    });
  }
}
