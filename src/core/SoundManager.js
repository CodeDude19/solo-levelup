/**
 * SoundManager - Web Audio API wrapper for procedurally generated sound effects and haptic feedback
 * Singleton pattern ensures consistent audio context across the application
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5; // 0-1 range
    this.volumeLevel = 2; // 1-4 level (maps to 0.25, 0.5, 0.75, 1.0)
    this.initialized = false;
    this.hapticsEnabled = true;
    this.vibrationStrength = 2; // 1-4 level (multiplier for pattern durations)
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  setHapticsEnabled(enabled) {
    this.hapticsEnabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setVolumeLevel(level) {
    this.volumeLevel = Math.max(1, Math.min(4, level));
    this.volume = this.volumeLevel * 0.25; // Maps 1-4 to 0.25-1.0
  }

  setVibrationStrength(level) {
    this.vibrationStrength = Math.max(1, Math.min(4, level));
  }

  // Vibration helper - pattern is array of [vibrate, pause, vibrate, pause, ...]
  // Strength multiplier adjusts duration (1=0.5x, 2=1x, 3=1.5x, 4=2x)
  vibrate(pattern) {
    if (!this.hapticsEnabled) return;
    if ('vibrate' in navigator) {
      try {
        const strengthMultiplier = this.vibrationStrength * 0.5; // 0.5, 1.0, 1.5, 2.0
        const adjustedPattern = Array.isArray(pattern)
          ? pattern.map(duration => Math.round(duration * strengthMultiplier))
          : Math.round(pattern * strengthMultiplier);
        navigator.vibrate(adjustedPattern);
      } catch (e) {
        // Vibration not supported or blocked
      }
    }
  }

  // Create oscillator with envelope
  playTone(frequency, duration, type = 'sine', gainValue = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    const now = this.audioContext.currentTime;
    const adjustedGain = gainValue * this.volume;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedGain, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Play multiple tones in sequence
  playSequence(notes, interval = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note.freq, note.duration || 0.2, note.type || 'sine', note.gain || 0.3);
      }, index * interval * 1000);
    });
  }

  // UI Click - subtle tick
  click() {
    this.init();
    this.playTone(800, 0.05, 'sine', 0.1);
    this.vibrate(10); // Quick tap
  }

  // Success - bright ding
  success() {
    this.init();
    this.playSequence([
      { freq: 880, duration: 0.1, gain: 0.2 },
      { freq: 1100, duration: 0.15, gain: 0.25 }
    ], 0.08);
    this.vibrate([30, 50, 30]); // Double tap
  }

  // Quest Complete - triumphant chord
  questComplete() {
    this.init();
    this.playSequence([
      { freq: 523, duration: 0.15, gain: 0.3 },
      { freq: 659, duration: 0.15, gain: 0.3 },
      { freq: 784, duration: 0.2, gain: 0.35 },
      { freq: 1047, duration: 0.4, gain: 0.4 }
    ], 0.1);
    // Strong celebratory pattern
    this.vibrate([50, 30, 50, 30, 100]);
  }

  // Habit Complete - satisfying pop
  habitComplete() {
    this.init();
    this.playTone(600, 0.08, 'sine', 0.25);
    setTimeout(() => this.playTone(900, 0.12, 'sine', 0.3), 60);
    this.vibrate(40); // Satisfying single tap
  }

  // Streak - fire whoosh with ascending tones
  streak(streakCount) {
    this.init();
    const baseFreq = 300 + (streakCount * 50);
    this.playSequence([
      { freq: baseFreq, duration: 0.1, type: 'sawtooth', gain: 0.15 },
      { freq: baseFreq * 1.25, duration: 0.1, type: 'sawtooth', gain: 0.2 },
      { freq: baseFreq * 1.5, duration: 0.15, type: 'sawtooth', gain: 0.25 },
      { freq: baseFreq * 2, duration: 0.25, type: 'sine', gain: 0.3 }
    ], 0.07);
    // Pulsing fire pattern - more intense for higher streaks
    const intensity = Math.min(streakCount, 10);
    const pattern = [];
    for (let i = 0; i < intensity; i++) {
      pattern.push(20 + i * 5, 30);
    }
    pattern.push(100); // Final burst
    this.vibrate(pattern);
  }

  // Level Up - epic fanfare
  levelUp() {
    this.init();
    this.playSequence([
      { freq: 392, duration: 0.15, gain: 0.3 },
      { freq: 523, duration: 0.15, gain: 0.35 },
      { freq: 659, duration: 0.15, gain: 0.35 },
      { freq: 784, duration: 0.2, gain: 0.4 },
      { freq: 1047, duration: 0.5, gain: 0.45 }
    ], 0.12);
    // Epic ascending vibration pattern
    this.vibrate([100, 50, 100, 50, 100, 50, 200]);
  }

  // Rank Up - majestic ascension
  rankUp() {
    this.init();
    // Low rumble vibration
    this.vibrate([200, 100, 50, 50, 50, 50, 50, 50, 100, 100, 150, 50, 300]);
    // Low rumble sound
    this.playTone(80, 0.8, 'sine', 0.2);
    // Ascending fanfare
    setTimeout(() => {
      this.playSequence([
        { freq: 262, duration: 0.2, gain: 0.3 },
        { freq: 330, duration: 0.2, gain: 0.35 },
        { freq: 392, duration: 0.2, gain: 0.35 },
        { freq: 523, duration: 0.25, gain: 0.4 },
        { freq: 659, duration: 0.25, gain: 0.4 },
        { freq: 784, duration: 0.3, gain: 0.45 },
        { freq: 1047, duration: 0.6, gain: 0.5 }
      ], 0.15);
    }, 300);
  }

  // Gold/Coin collect
  coin() {
    this.init();
    this.playSequence([
      { freq: 1200, duration: 0.05, gain: 0.2 },
      { freq: 1800, duration: 0.08, gain: 0.25 }
    ], 0.04);
    this.vibrate([15, 30, 25]); // Coin jingle feel
  }

  // Gold spend
  coinSpend() {
    this.init();
    this.playSequence([
      { freq: 800, duration: 0.08, gain: 0.2 },
      { freq: 600, duration: 0.1, gain: 0.15 },
      { freq: 400, duration: 0.12, gain: 0.1 }
    ], 0.06);
    this.vibrate(50);
  }

  // Reward unlock - magical sparkle
  rewardUnlock() {
    this.init();
    this.playSequence([
      { freq: 800, duration: 0.1, gain: 0.2 },
      { freq: 1000, duration: 0.1, gain: 0.25 },
      { freq: 1200, duration: 0.1, gain: 0.25 },
      { freq: 1600, duration: 0.15, gain: 0.3 },
      { freq: 2000, duration: 0.3, gain: 0.35 }
    ], 0.08);
    // Magical sparkle pattern
    this.vibrate([30, 30, 30, 30, 30, 30, 50, 50, 100]);
  }

  // Penalty/Fail - negative buzz
  penalty() {
    this.init();
    this.playTone(150, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this.playTone(100, 0.4, 'sawtooth', 0.15), 150);
    // Harsh warning vibration
    this.vibrate([100, 50, 150]);
  }

  // Daily check-in - warm welcome
  checkIn() {
    this.init();
    this.playSequence([
      { freq: 440, duration: 0.1, gain: 0.2 },
      { freq: 554, duration: 0.1, gain: 0.25 },
      { freq: 659, duration: 0.15, gain: 0.3 },
      { freq: 880, duration: 0.25, gain: 0.35 }
    ], 0.1);
    // Welcoming double pulse
    this.vibrate([40, 60, 40, 60, 80]);
  }

  // XP gain - quick ascending blip
  xpGain() {
    this.init();
    this.playSequence([
      { freq: 600, duration: 0.05, gain: 0.15 },
      { freq: 800, duration: 0.08, gain: 0.2 }
    ], 0.04);
    this.vibrate(20);
  }

  // Notification
  notification() {
    this.init();
    this.playTone(880, 0.1, 'sine', 0.2);
    this.vibrate([30, 50, 30]);
  }

  // Error
  error() {
    this.init();
    this.playSequence([
      { freq: 200, duration: 0.15, type: 'square', gain: 0.15 },
      { freq: 150, duration: 0.2, type: 'square', gain: 0.1 }
    ], 0.1);
    this.vibrate([80, 40, 120]); // Error buzz
  }

  // Awakening sequence sounds
  awakeningInit() {
    this.init();
    this.playTone(100, 1, 'sine', 0.1);
    setTimeout(() => this.playTone(150, 0.8, 'sine', 0.15), 500);
    this.vibrate([50, 100, 50, 100, 100]);
  }

  awakeningGlitch() {
    this.init();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(Math.random() * 500 + 100, 0.05, 'sawtooth', 0.1);
      }, i * 50);
    }
    // Glitchy rapid vibrations
    this.vibrate([20, 20, 20, 20, 20, 20, 20, 20, 20, 20]);
  }

  awakeningArise() {
    this.init();
    // Epic ARISE vibration - building intensity
    this.vibrate([100, 50, 150, 50, 200, 50, 300, 100, 500]);
    // Deep bass
    this.playTone(60, 1.5, 'sine', 0.3);
    // Rising tone
    setTimeout(() => {
      if (!this.audioContext) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 1);

      gain.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

      osc.start();
      osc.stop(this.audioContext.currentTime + 1.2);
    }, 200);
  }

  // Tab switch
  tabSwitch() {
    this.init();
    this.playTone(600, 0.04, 'sine', 0.08);
    this.vibrate(8); // Subtle tick
  }

  // Modal open
  modalOpen() {
    this.init();
    this.playSequence([
      { freq: 400, duration: 0.05, gain: 0.1 },
      { freq: 600, duration: 0.08, gain: 0.15 }
    ], 0.03);
    this.vibrate(15);
  }

  // Modal close
  modalClose() {
    this.init();
    this.playSequence([
      { freq: 500, duration: 0.05, gain: 0.1 },
      { freq: 350, duration: 0.08, gain: 0.08 }
    ], 0.03);
    this.vibrate(10);
  }
}

// Create and export singleton instance
export const soundManager = new SoundManager();
export default soundManager;
