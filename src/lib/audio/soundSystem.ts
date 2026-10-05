/**
 * Sutra Studio Sound System (Web Audio API Synthesizer)
 *
 * Provides ultra-low latency, crystal clear, synthesized audio cues
 * for studio notifications, order confirmations, welcomes, and payment settlements.
 *
 * Zero external audio files needed -> zero 404s, zero bandwidth overhead.
 * Automatically handles browser Autoplay policies by resuming AudioContext
 * upon the first user interaction.
 */

type SoundType =
  | "notification"
  | "order_success"
  | "thank_you"
  | "welcome"
  | "payment_success"
  | "reminder"
  | "tap"
  | "warning";

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      // Check saved preference
      const savedMute = localStorage.getItem("sutra_sound_muted");
      this.isMuted = savedMute === "true";

      // Register first user interaction listener to unlock AudioContext
      const unlockAudio = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume();
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
      };

      window.addEventListener("click", unlockAudio, { passive: true, once: true });
      window.addEventListener("touchstart", unlockAudio, { passive: true, once: true });
      window.addEventListener("keydown", unlockAudio, { passive: true, once: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.isInitialized = true;
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("sutra_sound_muted", String(this.isMuted));
      window.dispatchEvent(new CustomEvent("sutra_sound_mute_changed", { detail: { isMuted: this.isMuted } }));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("sutra_sound_muted", String(this.isMuted));
      window.dispatchEvent(new CustomEvent("sutra_sound_mute_changed", { detail: { isMuted: this.isMuted } }));
    }
  }

  /**
   * Synthesize and play a specific tone pattern
   */
  public play(sound: SoundType) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;

      switch (sound) {
        case "notification":
          // Warm dual-tone marimba chime (E5: 659.25Hz -> B5: 987.77Hz)
          this.playChime([659.25, 987.77], [0, 0.12], 0.35, "sine", 0.25);
          break;

        case "order_success":
        case "thank_you":
          // Celebratory 4-note ascending chord (C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50)
          this.playChime([523.25, 659.25, 783.99, 1046.5], [0, 0.1, 0.2, 0.32], 0.6, "triangle", 0.3);
          break;

        case "welcome":
          // Welcoming warm harp chime (A4: 440, C#5: 554.37, E5: 659.25, A5: 880)
          this.playChime([440, 554.37, 659.25, 880], [0, 0.12, 0.24, 0.38], 0.7, "sine", 0.25);
          break;

        case "payment_success":
          // Crisp resonant golden bell tone (D5: 587.33 -> F#5: 739.99 -> A5: 880)
          this.playChime([587.33, 739.99, 880], [0, 0.09, 0.18], 0.55, "triangle", 0.3);
          break;

        case "reminder":
          // Gentle double ping (G5: 783.99 -> G5: 783.99)
          this.playChime([783.99, 783.99], [0, 0.16], 0.3, "sine", 0.22);
          break;

        case "tap":
          // Ultra-subtle haptic tick
          this.playClick(now);
          break;

        case "warning":
          // Warm low mellow alert (D4: 293.66 -> C4: 261.63)
          this.playChime([293.66, 261.63], [0, 0.14], 0.4, "sine", 0.2);
          break;
      }
    } catch {
      // Audio autoplay gracefully handled
    }
  }

  private playChime(
    freqs: number[],
    delays: number[],
    noteDuration: number,
    type: OscillatorType,
    masterGainLevel: number
  ) {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(masterGainLevel, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = this.ctx.currentTime + (delays[idx] || 0);

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack & exponential decay
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(1.0, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + noteDuration + 0.05);
    });
  }

  private playClick(startTime: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, startTime);
    osc.frequency.exponentialRampToValueAtTime(200, startTime + 0.025);

    gain.gain.setValueAtTime(0.08, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.03);
  }
}

export const soundSystem = new SoundSystem();
