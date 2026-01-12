import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import {
  Home,
  Swords,
  Eye,
  Flame,
  ShoppingBag,
  Plus,
  Check,
  X,
  SkipForward,
  Trophy,
  Zap,
  Coins,
  Heart,
  Calendar,
  Clock,
  Target,
  Scroll,
  Crown,
  Skull,
  Star,
  ChevronRight,
  AlertTriangle,
  Gift,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Shield,
  Sparkles,
  Volume2,
  VolumeX,
  ChevronLeft,
  User,
  Crosshair
} from 'lucide-react';

// ==================== SOUND & HAPTICS SYSTEM ====================
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
    this.hapticsEnabled = true;
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
    this.hapticsEnabled = enabled;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Vibration helper - pattern is array of [vibrate, pause, vibrate, pause, ...]
  vibrate(pattern) {
    if (!this.hapticsEnabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
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

  // Skip - warning tone
  skip() {
    this.init();
    this.playSequence([
      { freq: 400, duration: 0.1, gain: 0.2 },
      { freq: 300, duration: 0.15, gain: 0.15 }
    ], 0.08);
    this.vibrate([50, 30, 80]); // Warning pattern
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

// Create singleton instance
const soundManager = new SoundManager();

// Sound Context for React
const SoundContext = createContext(soundManager);

// ==================== CONSTANTS ====================
const RANKS = [
  { name: 'E-Rank', minLevel: 1, color: '#808080', title: 'Novice Hunter' },
  { name: 'D-Rank', minLevel: 5, color: '#00ff88', title: 'Apprentice' },
  { name: 'C-Rank', minLevel: 10, color: '#00ffff', title: 'Warrior' },
  { name: 'B-Rank', minLevel: 20, color: '#9d4edd', title: 'Elite Hunter' },
  { name: 'A-Rank', minLevel: 35, color: '#ffd700', title: 'Master' },
  { name: 'S-Rank', minLevel: 50, color: '#ff6600', title: 'Champion' },
  { name: 'National', minLevel: 70, color: '#ff3333', title: 'Legend' },
  { name: 'Monarch', minLevel: 100, color: '#ffffff', title: 'Shadow Monarch' }
];

const CLASSES = [
  { id: 'warrior', name: 'Warrior', icon: 'sword', desc: 'Strength through discipline', color: '#ff3333' },
  { id: 'mage', name: 'Mage', icon: 'zap', desc: 'Knowledge is power', color: '#9d4edd' },
  { id: 'assassin', name: 'Assassin', icon: 'target', desc: 'Swift and precise', color: '#00ff88' },
  { id: 'tank', name: 'Tank', icon: 'shield', desc: 'Unbreakable will', color: '#00ffff' }
];

const XP_PER_LEVEL = 1000;
const DAILY_LOGIN_XP = 50;
const MISSED_DAY_PENALTY = 100;
const MAX_HEALTH = 100;
const STREAK_BREAK_PENALTY = 20;

const DEFAULT_HABITS = [
  { id: '1', name: 'Meditate', icon: 'eye' },
  { id: '2', name: 'Exercise', icon: 'flame' },
  { id: '3', name: 'Code', icon: 'zap' },
  { id: '4', name: 'Read', icon: 'scroll' },
  { id: '5', name: 'Sleep 8h', icon: 'heart' }
];

// ==================== HELPER FUNCTIONS ====================
const getToday = () => new Date().toISOString().split('T')[0];

const getRank = (level) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) return RANKS[i];
  }
  return RANKS[0];
};

const getNextRank = (level) => {
  for (let i = 0; i < RANKS.length; i++) {
    if (level < RANKS[i].minLevel) return RANKS[i];
  }
  return null;
};

const calculateLevel = (totalXp) => Math.floor(totalXp / XP_PER_LEVEL) + 1;
const calculateXpProgress = (totalXp) => totalXp % XP_PER_LEVEL;

const formatTimeRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target - now;

  if (diff <= 0) return 'NOW';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// ==================== INITIAL STATE ====================
const getInitialState = () => {
  const saved = localStorage.getItem('theSystem');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  return {
    onboarded: false,
    player: {
      name: 'Hunter',
      class: 'warrior',
      totalXp: 0,
      gold: 100,
      health: MAX_HEALTH,
      lastLoginDate: null,
      checkedInToday: false,
      createdAt: getToday(),
      totalQuestsCompleted: 0,
      totalHabitsCompleted: 0,
      longestStreak: 0
    },
    quests: [],
    questLog: [],
    habits: DEFAULT_HABITS,
    habitLog: {},
    habitStreaks: {},
    vision: {
      fuel: '',
      fear: ''
    },
    rewards: [
      { id: '1', name: '1 Episode Netflix', cost: 200, icon: 'gift' },
      { id: '2', name: 'Snack Break', cost: 100, icon: 'gift' },
      { id: '3', name: '30min Gaming', cost: 300, icon: 'gift' }
    ],
    boss: {
      name: 'Weekly Review',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      reward: 500,
      penalty: 250
    }
  };
};

// ==================== PARTICLE SYSTEM ====================
const Particles = ({ type, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const count = type === 'levelUp' ? 50 : type === 'xp' ? 20 : 30;
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: type === 'gold' ? '#ffd700' : type === 'xp' ? '#00ffff' : type === 'streak' ? '#ff6600' : '#00ffff',
        delay: Math.random() * 0.5,
        duration: Math.random() * 1 + 1
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
};

// ==================== FLOATING TEXT ====================
const FloatingText = ({ text, type, position, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const color = type === 'xp' ? 'text-cyber-cyan' : type === 'gold' ? 'text-cyber-gold' : type === 'damage' ? 'text-cyber-red' : 'text-white';

  return (
    <div
      className={`fixed z-50 font-display font-black text-2xl ${color} animate-floatUp pointer-events-none`}
      style={{ left: position?.x || '50%', top: position?.y || '50%', transform: 'translateX(-50%)' }}
    >
      {text}
    </div>
  );
};

// ==================== LEVEL UP CELEBRATION ====================
const LevelUpCelebration = ({ level, rank, onClose }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    soundManager.levelUp();
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onClose(), 4000)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <Particles type="levelUp" />

      <div className="text-center">
        {phase >= 0 && (
          <div className={`transition-all duration-500 ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <p className="text-cyber-cyan text-lg tracking-[0.5em] mb-4 animate-pulse">LEVEL UP</p>
          </div>
        )}

        {phase >= 1 && (
          <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
            <div className="relative">
              <div className="text-[120px] font-display font-black text-white animate-levelNumber">
                {level}
              </div>
              <div className="absolute inset-0 text-[120px] font-display font-black text-cyber-cyan opacity-50 blur-lg animate-pulse">
                {level}
              </div>
            </div>
          </div>
        )}

        {phase >= 2 && (
          <div className={`transition-all duration-500 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-gray-400 text-sm tracking-wider mb-2">CURRENT RANK</p>
            <p className="font-display text-2xl font-bold" style={{ color: rank.color }}>
              {rank.name}
            </p>
            <p className="text-gray-500 text-sm mt-1">{rank.title}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== RANK UP CELEBRATION ====================
const RankUpCelebration = ({ rank, onClose }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    soundManager.rankUp();
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2000),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => onClose(), 5000)
    ];
    return () => timers.forEach(clearTimeout);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Background pulse */}
      <div
        className="absolute inset-0 animate-rankPulse"
        style={{ backgroundColor: rank.color, opacity: 0.1 }}
      />

      {/* Radial lines */}
      {phase >= 1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[200%] w-1 animate-rankLine"
              style={{
                backgroundColor: rank.color,
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.3,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}

      <Particles type="levelUp" />

      <div className="text-center relative z-10">
        {phase >= 1 && (
          <div className={`transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-white text-sm tracking-[0.5em] mb-2 animate-pulse">YOU HAVE ACHIEVED</p>
          </div>
        )}

        {phase >= 2 && (
          <div className={`transition-all duration-700 ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="relative py-8">
              <Crown
                className="mx-auto mb-4 animate-bounce"
                size={64}
                style={{ color: rank.color }}
              />
              <h1
                className="font-display text-5xl font-black tracking-wider animate-rankReveal"
                style={{ color: rank.color, textShadow: `0 0 30px ${rank.color}` }}
              >
                {rank.name}
              </h1>
            </div>
          </div>
        )}

        {phase >= 3 && (
          <div className={`transition-all duration-500 ${phase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-400 text-lg mt-4">{rank.title}</p>
            <p className="text-gray-600 text-sm mt-2">Your power grows stronger...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== STREAK CELEBRATION ====================
const StreakCelebration = ({ streak, habitName, onClose }) => {
  useEffect(() => {
    soundManager.streak(streak);
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose, streak]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <Particles type="streak" />

      <div className="text-center animate-streakPop">
        <div className="relative mb-4">
          <Flame className="mx-auto text-orange-500 animate-fireFlicker" size={80} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl font-black text-white">{streak}</span>
          </div>
        </div>

        <p className="text-orange-500 font-display font-bold text-xl tracking-wider">
          {streak} DAY STREAK!
        </p>
        <p className="text-gray-400 text-sm mt-2">{habitName}</p>

        {streak >= 7 && (
          <div className="mt-4 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg inline-block">
            <span className="font-bold">{streak}x</span> XP Multiplier Active!
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== QUEST COMPLETE CELEBRATION ====================
const QuestCompleteCelebration = ({ quest, onClose }) => {
  useEffect(() => {
    soundManager.questComplete();
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <Particles type="xp" />

      <div className="text-center animate-questComplete">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyber-cyan/20 flex items-center justify-center animate-checkPop">
          <Check className="text-cyber-cyan" size={48} />
        </div>

        <h3 className="font-display text-xl font-bold text-white mb-2">QUEST COMPLETE!</h3>
        <p className="text-gray-400 mb-4">{quest.name}</p>

        <div className="flex items-center justify-center gap-6">
          <div className="text-center animate-rewardPop" style={{ animationDelay: '0.2s' }}>
            <p className="text-cyber-cyan font-display text-2xl font-bold">+{quest.reward}</p>
            <p className="text-gray-500 text-xs">XP</p>
          </div>
          <div className="text-center animate-rewardPop" style={{ animationDelay: '0.4s' }}>
            <p className="text-cyber-gold font-display text-2xl font-bold">+{quest.goldReward}</p>
            <p className="text-gray-500 text-xs">GOLD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ONBOARDING SYSTEM ====================
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAwakening, setShowAwakening] = useState(false);

  const steps = [
    'intro',
    'name',
    'class',
    'explain',
    'awakening'
  ];

  const handleNext = () => {
    soundManager.click();
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setShowAwakening(true);
    }
  };

  const handleAwakeningComplete = () => {
    onComplete({
      name: playerName || 'Hunter',
      class: selectedClass || 'warrior'
    });
  };

  if (showAwakening) {
    return <AwakeningSequence onComplete={handleAwakeningComplete} playerName={playerName} />;
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? 'bg-cyber-cyan w-6' : i < step ? 'bg-cyber-cyan/50' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 overflow-y-auto">
        {/* Step: Intro */}
        {step === 0 && (
          <div className="text-center animate-fadeIn">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-cyber-cyan/50 flex items-center justify-center animate-pulse-glow">
                <Eye className="text-cyber-cyan" size={48} />
              </div>
              <h1 className="font-display text-3xl font-black text-white mb-2">
                THE SYSTEM
              </h1>
              <p className="text-gray-500 tracking-widest text-sm">HAS CHOSEN YOU</p>
            </div>

            <div className="bg-cyber-dark/50 rounded-xl p-6 border border-cyber-cyan/20 mb-8">
              <p className="text-gray-300 leading-relaxed">
                You have been selected to receive <span className="text-cyber-cyan font-bold">THE SYSTEM</span> — a power that will transform your discipline into strength.
              </p>
            </div>

            <p className="text-gray-600 text-sm animate-pulse">
              Your journey begins now...
            </p>
          </div>
        )}

        {/* Step: Name */}
        {step === 1 && (
          <div className="text-center animate-fadeIn">
            <User className="mx-auto text-cyber-cyan mb-4" size={48} />
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              IDENTIFY YOURSELF
            </h2>
            <p className="text-gray-500 mb-8">What shall THE SYSTEM call you?</p>

            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full bg-cyber-gray text-white text-center text-xl rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-cyber-cyan mb-4 font-display"
              maxLength={20}
            />

            <p className="text-gray-600 text-sm">
              {playerName ? `Welcome, ${playerName}.` : 'Choose wisely, Hunter.'}
            </p>
          </div>
        )}

        {/* Step: Class Selection */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <Shield className="mx-auto text-cyber-cyan mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                CHOOSE YOUR PATH
              </h2>
              <p className="text-gray-500">Select your discipline archetype</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`p-4 rounded-xl border-2 transition-all btn-press ${
                    selectedClass === cls.id
                      ? 'border-opacity-100 bg-opacity-20'
                      : 'border-opacity-30 bg-opacity-0 hover:bg-opacity-10'
                  }`}
                  style={{
                    borderColor: cls.color,
                    backgroundColor: selectedClass === cls.id ? cls.color : 'transparent'
                  }}
                >
                  <div
                    className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cls.color}20` }}
                  >
                    {cls.icon === 'sword' && <Swords size={24} style={{ color: cls.color }} />}
                    {cls.icon === 'zap' && <Zap size={24} style={{ color: cls.color }} />}
                    {cls.icon === 'target' && <Crosshair size={24} style={{ color: cls.color }} />}
                    {cls.icon === 'shield' && <Shield size={24} style={{ color: cls.color }} />}
                  </div>
                  <p className="font-display font-bold text-white">{cls.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{cls.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Explanation */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="text-center mb-6">
              <Scroll className="mx-auto text-cyber-cyan mb-4" size={48} />
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                THE RULES
              </h2>
              <p className="text-gray-500">Understand the system</p>
            </div>

            <div className="space-y-4">
              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-cyan/20 animate-slideRight" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-cyan/20 flex items-center justify-center">
                    <Swords className="text-cyber-cyan" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Quests</p>
                    <p className="text-gray-500 text-sm">Complete tasks. Gain XP & Gold.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-gold/20 animate-slideRight" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-gold/20 flex items-center justify-center">
                    <Flame className="text-cyber-gold" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Habits</p>
                    <p className="text-gray-500 text-sm">Build streaks. Multiply rewards.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-red/20 animate-slideRight" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-red/20 flex items-center justify-center">
                    <Skull className="text-cyber-red" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Penalties</p>
                    <p className="text-gray-500 text-sm">Fail or skip? Face consequences.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-xl p-4 border border-cyber-purple/20 animate-slideRight" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
                    <Crown className="text-cyber-purple" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-white">Rank Up</p>
                    <p className="text-gray-500 text-sm">Level up. Achieve new ranks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Vision Setup */}
        {step === 4 && (
          <div className="animate-fadeIn text-center">
            <Eye className="mx-auto text-cyber-purple mb-4" size={48} />
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              YOUR AWAKENING
            </h2>
            <p className="text-gray-500 mb-6">
              Before we begin, you must understand your purpose.
            </p>

            <div className="bg-gradient-to-b from-cyber-purple/20 to-transparent rounded-xl p-6 border border-cyber-purple/30">
              <p className="text-gray-300 leading-relaxed">
                THE SYSTEM amplifies <span className="text-cyber-cyan font-bold">intention</span>.
                <br /><br />
                You will define your <span className="text-cyber-cyan">vision</span> — who you want to become.
                <br /><br />
                And your <span className="text-cyber-red">anti-vision</span> — what happens if you fail.
                <br /><br />
                These will fuel your journey.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 safe-area-bottom">
        <button
          onClick={handleNext}
          disabled={step === 1 && !playerName.trim()}
          className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all btn-press ${
            (step === 1 && !playerName.trim()) || (step === 2 && !selectedClass)
              ? 'bg-gray-800 text-gray-600'
              : 'bg-cyber-cyan text-black'
          }`}
        >
          {step === steps.length - 1 ? 'BEGIN AWAKENING' : 'CONTINUE'}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full py-3 text-gray-500 mt-2"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
};

// ==================== AWAKENING SEQUENCE ====================
const AwakeningSequence = ({ onComplete, playerName }) => {
  const [phase, setPhase] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const sequence = [
      { delay: 500, action: () => { setPhase(1); soundManager.awakeningInit(); } },
      { delay: 2000, action: () => { setGlitching(true); soundManager.awakeningGlitch(); } },
      { delay: 2500, action: () => { setGlitching(false); setPhase(2); } },
      { delay: 4000, action: () => setPhase(3) },
      { delay: 6000, action: () => { setPhase(4); soundManager.awakeningArise(); } },
      { delay: 8000, action: () => setPhase(5) },
      { delay: 10000, action: onComplete }
    ];

    const timers = sequence.map(({ delay, action }) => setTimeout(action, delay));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 bg-black flex items-center justify-center ${glitching ? 'animate-glitch' : ''}`}>
      {phase >= 4 && <Particles type="levelUp" />}

      <div className="text-center px-6">
        {phase === 1 && (
          <div className="animate-fadeIn">
            <p className="text-cyber-cyan font-mono text-sm tracking-wider animate-typing">
              INITIALIZING SYSTEM...
            </p>
          </div>
        )}

        {phase === 2 && (
          <div className="animate-fadeIn">
            <p className="text-cyber-cyan font-mono text-sm tracking-wider">
              HUNTER DETECTED: <span className="text-white">{playerName}</span>
            </p>
          </div>
        )}

        {phase === 3 && (
          <div className="animate-fadeIn">
            <p className="text-gray-500 font-mono text-sm mb-4">SYNCHRONIZATION COMPLETE</p>
            <p className="text-cyber-cyan font-mono tracking-wider animate-pulse">
              AWAKENING PROTOCOL INITIATED
            </p>
          </div>
        )}

        {phase === 4 && (
          <div className="animate-scaleIn">
            <div className="mb-6">
              <Eye className="mx-auto text-cyber-cyan animate-pulse" size={80} />
            </div>
            <h1 className="font-display text-4xl font-black text-white mb-2 animate-glow">
              ARISE
            </h1>
            <p className="text-cyber-cyan tracking-[0.3em]">{playerName.toUpperCase()}</p>
          </div>
        )}

        {phase === 5 && (
          <div className="animate-fadeIn">
            <p className="text-gray-400 text-sm">
              THE SYSTEM is now bound to you.
            </p>
            <p className="text-cyber-cyan font-display mt-4">
              Level 1 • E-Rank
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== NOTIFICATION COMPONENT ====================
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-cyber-green/20 border-cyber-green' :
                  type === 'error' ? 'bg-cyber-red/20 border-cyber-red' :
                  type === 'gold' ? 'bg-cyber-gold/20 border-cyber-gold' :
                  'bg-cyber-cyan/20 border-cyber-cyan';

  const textColor = type === 'success' ? 'text-cyber-green' :
                    type === 'error' ? 'text-cyber-red' :
                    type === 'gold' ? 'text-cyber-gold' :
                    'text-cyber-cyan';

  return (
    <div className={`fixed top-4 left-4 right-4 z-40 p-4 rounded-lg border ${bgColor} animate-slideDown`}>
      <p className={`text-center font-bold ${textColor}`}>{message}</p>
    </div>
  );
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-6 animate-modalPop"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-display font-bold text-cyber-cyan mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// ==================== PLAYER DASHBOARD ====================
const Dashboard = ({ state, onLoginReward, showNotification, triggerCelebration, soundEnabled, onToggleSound }) => {
  const { player, quests, boss } = state;
  const level = calculateLevel(player.totalXp);
  const xpProgress = calculateXpProgress(player.totalXp);
  const rank = getRank(level);
  const nextRank = getNextRank(level);
  const activeQuests = quests.filter(q => !q.completed && !q.failed);
  const [showCheckinAnim, setShowCheckinAnim] = useState(false);

  const handleCheckIn = () => {
    if (!player.checkedInToday) {
      setShowCheckinAnim(true);
      setTimeout(() => setShowCheckinAnim(false), 1500);
      onLoginReward();
    }
  };

  const selectedClass = CLASSES.find(c => c.id === player.class) || CLASSES[0];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4 px-4">
      {/* Checkin Animation */}
      {showCheckinAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cyber-cyan/20 flex items-center justify-center animate-checkPop">
              <Calendar className="text-cyber-cyan" size={40} />
            </div>
            <p className="text-cyber-cyan font-display text-2xl font-bold">+{DAILY_LOGIN_XP} XP</p>
            <p className="text-gray-400">Daily Bonus!</p>
          </div>
          <Particles type="xp" />
        </div>
      )}

      {/* Header */}
      <div className="relative py-6">
        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="absolute top-6 right-0 p-2 rounded-lg bg-cyber-gray/50 text-gray-400 hover:text-cyber-cyan transition-colors btn-press"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        <div className="text-center">
          <h1 className="font-display text-3xl font-black gradient-text tracking-wider mb-1">
            THE SYSTEM
          </h1>
          <p className="text-gray-500 text-xs tracking-widest">ARISE, {player.name?.toUpperCase()}</p>
        </div>
      </div>

      {/* Player Card */}
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-cyan mb-4 relative overflow-hidden">
        {/* Class indicator */}
        <div
          className="absolute top-0 right-0 w-20 h-20 opacity-10"
          style={{
            background: `radial-gradient(circle at top right, ${selectedClass.color}, transparent 70%)`
          }}
        />

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Rank</p>
            <h2
              className="font-display text-2xl font-bold animate-glow"
              style={{ color: rank.color }}
            >
              {rank.name}
            </h2>
            <p className="text-gray-500 text-xs">{rank.title}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Level</p>
            <p className="font-display text-4xl font-black text-white">{level}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-cyber-cyan flex items-center gap-1">
              <Zap size={12} /> XP
            </span>
            <span className="text-gray-400">{xpProgress} / {XP_PER_LEVEL}</span>
          </div>
          <div className="h-3 bg-cyber-gray rounded-full overflow-hidden relative">
            <div
              className="h-full progress-bar-xp transition-all duration-500 rounded-full relative"
              style={{ width: `${(xpProgress / XP_PER_LEVEL) * 100}%` }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
          {nextRank && (
            <p className="text-gray-600 text-xs mt-1 text-right">
              Next: {nextRank.name} at Lv.{nextRank.minLevel}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyber-gray/50 rounded-lg p-3 text-center relative overflow-hidden group">
            <div className="flex items-center justify-center gap-2 text-cyber-gold mb-1">
              <Coins size={16} className="group-hover:animate-coinBounce" />
              <span className="font-display font-bold text-lg">{player.gold}</span>
            </div>
            <p className="text-gray-500 text-xs">Gold</p>
          </div>
          <div className="bg-cyber-gray/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-cyber-red mb-1">
              <Heart size={16} className={player.health < 30 ? 'animate-heartbeat' : ''} />
              <span className="font-display font-bold text-lg">{player.health}%</span>
            </div>
            <p className="text-gray-500 text-xs">Health</p>
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <button
        onClick={handleCheckIn}
        disabled={player.checkedInToday}
        className={`w-full py-4 rounded-xl font-bold mb-4 transition-all btn-press relative overflow-hidden ${
          player.checkedInToday
            ? 'bg-cyber-gray text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyber-cyan to-cyber-green text-black'
        }`}
      >
        {!player.checkedInToday && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
        {player.checkedInToday ? (
          <span className="flex items-center justify-center gap-2 relative z-10">
            <Check size={20} /> CHECKED IN TODAY
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 relative z-10">
            <Calendar size={20} /> DAILY CHECK-IN (+{DAILY_LOGIN_XP} XP)
          </span>
        )}
      </button>

      {/* Boss Countdown */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-red mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-red/5 to-transparent animate-pulse" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyber-red/20 flex items-center justify-center">
              <Skull className="text-cyber-red animate-pulse" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Next Boss</p>
              <p className="font-display font-bold text-white">{boss.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-cyber-red font-display font-bold text-xl">
              {formatTimeRemaining(boss.deadline)}
            </p>
            <p className="text-gray-500 text-xs">+{boss.reward} Gold</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-cyber-dark rounded-lg p-3 text-center glow-border-cyan">
          <p className="font-display text-xl font-bold text-cyber-cyan">{player.totalQuestsCompleted}</p>
          <p className="text-gray-500 text-xs">Quests</p>
        </div>
        <div className="bg-cyber-dark rounded-lg p-3 text-center glow-border-gold">
          <p className="font-display text-xl font-bold text-cyber-gold">{player.totalHabitsCompleted}</p>
          <p className="text-gray-500 text-xs">Habits</p>
        </div>
        <div className="bg-cyber-dark rounded-lg p-3 text-center glow-border-red">
          <p className="font-display text-xl font-bold text-orange-500">{player.longestStreak}</p>
          <p className="text-gray-500 text-xs">Best Streak</p>
        </div>
      </div>

      {/* Active Quests Summary */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-cyan">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-cyber-cyan flex items-center gap-2">
            <Swords size={18} /> Active Quests
          </h3>
          <span className="bg-cyber-cyan/20 text-cyber-cyan px-2 py-1 rounded text-xs font-bold">
            {activeQuests.length}
          </span>
        </div>
        {activeQuests.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No active quests. Create one!</p>
        ) : (
          <div className="space-y-2">
            {activeQuests.slice(0, 3).map((quest, i) => (
              <div
                key={quest.id}
                className="flex items-center justify-between py-2 border-b border-cyber-gray/50 last:border-0 animate-slideRight"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-gray-300 text-sm truncate flex-1 mr-2">{quest.name}</span>
                <span className="text-cyber-gold text-xs font-bold">+{quest.reward} XP</span>
              </div>
            ))}
            {activeQuests.length > 3 && (
              <p className="text-gray-500 text-xs text-center">+{activeQuests.length - 3} more quests</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== QUESTS SYSTEM ====================
const Quests = ({ state, onAddQuest, onCompleteQuest, onSkipQuest, onFailQuest, onDeleteQuest, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [newQuest, setNewQuest] = useState({
    name: '',
    reward: 50,
    penalty: 25,
    timeBlock: '',
    goldReward: 10
  });

  const activeQuests = state.quests.filter(q => !q.completed && !q.failed);

  const handleAddQuest = () => {
    if (!newQuest.name.trim()) return;
    onAddQuest({
      id: generateId(),
      name: newQuest.name,
      reward: parseInt(newQuest.reward) || 50,
      penalty: parseInt(newQuest.penalty) || 25,
      goldReward: parseInt(newQuest.goldReward) || 10,
      timeBlock: newQuest.timeBlock,
      createdAt: new Date().toISOString(),
      completed: false,
      failed: false
    });
    setNewQuest({ name: '', reward: 50, penalty: 25, timeBlock: '', goldReward: 10 });
    setShowAddModal(false);
    showNotification('Quest Added!', 'success');
  };

  return (
    <div className="flex flex-col h-full pb-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Swords className="text-cyber-cyan" /> Quests
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLog(!showLog)}
            className={`px-3 py-2 rounded-lg text-sm font-bold transition-all ${
              showLog ? 'bg-cyber-cyan text-black' : 'bg-cyber-gray text-gray-400'
            }`}
          >
            <Scroll size={16} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press hover:shadow-neon-cyan transition-all"
          >
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      {/* Quest List or Log */}
      <div className="flex-1 overflow-y-auto">
        {showLog ? (
          // Quest Log
          <div className="space-y-3">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Quest Log</h3>
            {state.questLog.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed quests yet.</p>
            ) : (
              state.questLog.slice().reverse().map((quest, i) => (
                <div
                  key={quest.id}
                  className={`bg-cyber-dark rounded-lg p-4 border animate-fadeIn ${
                    quest.completed ? 'border-cyber-green/30' : 'border-cyber-red/30'
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{quest.name}</span>
                    {quest.completed ? (
                      <span className="text-cyber-green text-xs font-bold flex items-center gap-1">
                        <Check size={14} /> +{quest.reward} XP
                      </span>
                    ) : (
                      <span className="text-cyber-red text-xs font-bold flex items-center gap-1">
                        <X size={14} /> -{quest.penaltyApplied} XP
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(quest.completedAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          // Active Quests
          <div className="space-y-3">
            {activeQuests.length === 0 ? (
              <div className="text-center py-12">
                <Swords className="mx-auto text-gray-600 mb-4 animate-pulse" size={48} />
                <p className="text-gray-500">No active quests.</p>
                <p className="text-gray-600 text-sm">Create a quest to begin your journey.</p>
              </div>
            ) : (
              activeQuests.map((quest, i) => (
                <div
                  key={quest.id}
                  className="bg-cyber-dark rounded-xl p-4 glow-border-cyan card-hover animate-slideUp"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{quest.name}</h4>
                      {quest.timeBlock && (
                        <p className="text-gray-500 text-xs flex items-center gap-1">
                          <Clock size={12} /> {quest.timeBlock}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteQuest(quest.id)}
                      className="text-gray-600 hover:text-cyber-red p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs">
                    <span className="bg-cyber-cyan/20 text-cyber-cyan px-2 py-1 rounded">
                      +{quest.reward} XP
                    </span>
                    <span className="bg-cyber-gold/20 text-cyber-gold px-2 py-1 rounded">
                      +{quest.goldReward} Gold
                    </span>
                    <span className="bg-cyber-red/20 text-cyber-red px-2 py-1 rounded">
                      -{quest.penalty} Penalty
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onCompleteQuest(quest)}
                      className="bg-cyber-green/20 text-cyber-green py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-green/30 hover:shadow-lg transition-all"
                    >
                      <Check size={14} /> Done
                    </button>
                    <button
                      onClick={() => onSkipQuest(quest)}
                      className="bg-cyber-gold/20 text-cyber-gold py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-gold/30 transition-all"
                    >
                      <SkipForward size={14} /> Skip
                    </button>
                    <button
                      onClick={() => onFailQuest(quest)}
                      className="bg-cyber-red/20 text-cyber-red py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-red/30 transition-all"
                    >
                      <X size={14} /> Fail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Quest Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Quest">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Quest Name</label>
            <input
              type="text"
              value={newQuest.name}
              onChange={e => setNewQuest({ ...newQuest, name: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="Enter quest name..."
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Time Block (optional)</label>
            <input
              type="text"
              value={newQuest.timeBlock}
              onChange={e => setNewQuest({ ...newQuest, timeBlock: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="e.g., 9:00 AM - 10:00 AM"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-cyber-cyan text-xs uppercase tracking-wider block mb-1">XP Reward</label>
              <input
                type="number"
                value={newQuest.reward}
                onChange={e => setNewQuest({ ...newQuest, reward: e.target.value })}
                className="w-full bg-cyber-gray text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyber-cyan text-center"
              />
            </div>
            <div>
              <label className="text-cyber-gold text-xs uppercase tracking-wider block mb-1">Gold</label>
              <input
                type="number"
                value={newQuest.goldReward}
                onChange={e => setNewQuest({ ...newQuest, goldReward: e.target.value })}
                className="w-full bg-cyber-gray text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyber-cyan text-center"
              />
            </div>
            <div>
              <label className="text-cyber-red text-xs uppercase tracking-wider block mb-1">Penalty</label>
              <input
                type="number"
                value={newQuest.penalty}
                onChange={e => setNewQuest({ ...newQuest, penalty: e.target.value })}
                className="w-full bg-cyber-gray text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-cyber-cyan text-center"
              />
            </div>
          </div>
          <button
            onClick={handleAddQuest}
            className="w-full bg-cyber-cyan text-black py-3 rounded-lg font-bold btn-press hover:shadow-neon-cyan transition-all"
          >
            Create Quest
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ==================== AWAKENING (VISION) ====================
const Awakening = ({ state, onUpdateVision, showNotification }) => {
  const [editing, setEditing] = useState(null);
  const [tempVision, setTempVision] = useState(state.vision);

  const handleSave = (type) => {
    onUpdateVision({ ...state.vision, [type]: tempVision[type] });
    setEditing(null);
    showNotification('Vision Saved!', 'success');
  };

  return (
    <div className="flex flex-col h-full pb-4 px-4 overflow-y-auto">
      {/* Header */}
      <div className="text-center py-6">
        <h2 className="font-display text-2xl font-bold text-white flex items-center justify-center gap-2 mb-1">
          <Eye className="text-cyber-purple animate-pulse" /> AWAKENING
        </h2>
        <p className="text-gray-500 text-sm">Remember why you fight.</p>
      </div>

      {/* The Fuel - Vision */}
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-cyan mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-cyan to-cyber-green" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 flex items-center justify-center">
              <Crown className="text-cyber-cyan" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-cyber-cyan">THE FUEL</h3>
              <p className="text-gray-500 text-xs">Who I want to become</p>
            </div>
          </div>
          {editing === 'fuel' ? (
            <button
              onClick={() => handleSave('fuel')}
              className="text-cyber-green p-2 hover:bg-cyber-green/20 rounded-lg transition-all"
            >
              <Save size={20} />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing('fuel');
                setTempVision({ ...state.vision });
              }}
              className="text-gray-400 p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              <Edit3 size={20} />
            </button>
          )}
        </div>
        {editing === 'fuel' ? (
          <textarea
            value={tempVision.fuel}
            onChange={e => setTempVision({ ...tempVision, fuel: e.target.value })}
            className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan resize-none h-32 transition-all"
            placeholder="Describe your ideal self... What does your future look like? What kind of person are you becoming?"
            autoFocus
          />
        ) : (
          <div className="bg-cyber-gray/50 rounded-lg p-4 min-h-[100px]">
            {state.vision.fuel ? (
              <p className="text-gray-300 whitespace-pre-wrap">{state.vision.fuel}</p>
            ) : (
              <p className="text-gray-600 italic">Tap edit to define your vision...</p>
            )}
          </div>
        )}
      </div>

      {/* The Fear - Anti-Vision */}
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-red mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-red to-orange-500" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyber-red/20 flex items-center justify-center">
              <Skull className="text-cyber-red" size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-cyber-red">THE FEAR</h3>
              <p className="text-gray-500 text-xs">What happens if I fail</p>
            </div>
          </div>
          {editing === 'fear' ? (
            <button
              onClick={() => handleSave('fear')}
              className="text-cyber-green p-2 hover:bg-cyber-green/20 rounded-lg transition-all"
            >
              <Save size={20} />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing('fear');
                setTempVision({ ...state.vision });
              }}
              className="text-gray-400 p-2 hover:bg-gray-800 rounded-lg transition-all"
            >
              <Edit3 size={20} />
            </button>
          )}
        </div>
        {editing === 'fear' ? (
          <textarea
            value={tempVision.fear}
            onChange={e => setTempVision({ ...tempVision, fear: e.target.value })}
            className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-red resize-none h-32 transition-all"
            placeholder="What does your life look like if you give up? What are the consequences of staying undisciplined?"
            autoFocus
          />
        ) : (
          <div className="bg-cyber-gray/50 rounded-lg p-4 min-h-[100px]">
            {state.vision.fear ? (
              <p className="text-gray-300 whitespace-pre-wrap">{state.vision.fear}</p>
            ) : (
              <p className="text-gray-600 italic">Tap edit to define your anti-vision...</p>
            )}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="bg-gradient-to-r from-cyber-purple/20 to-cyber-cyan/20 rounded-xl p-5 border border-cyber-purple/30">
        <p className="text-center text-gray-300 italic">
          "The gap between who you are and who you want to be is what you do."
        </p>
        <p className="text-center text-gray-500 text-sm mt-2">— Your daily reminder</p>
      </div>
    </div>
  );
};

// ==================== HABITS & HEATMAP ====================
const Habits = ({ state, onToggleHabit, onAddHabit, onDeleteHabit, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const today = getToday();

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    onAddHabit({
      id: generateId(),
      name: newHabit,
      icon: 'star'
    });
    setNewHabit('');
    setShowAddModal(false);
    showNotification('Habit Added!', 'success');
  };

  const getHabitIcon = (iconName) => {
    switch (iconName) {
      case 'eye': return <Eye size={16} />;
      case 'flame': return <Flame size={16} />;
      case 'zap': return <Zap size={16} />;
      case 'scroll': return <Scroll size={16} />;
      case 'heart': return <Heart size={16} />;
      default: return <Star size={16} />;
    }
  };

  const isHabitCompletedToday = (habitId) => {
    return state.habitLog[today]?.includes(habitId);
  };

  const getStreak = (habitId) => {
    return state.habitStreaks[habitId] || 0;
  };

  // Generate heatmap data (last 8 weeks)
  const generateHeatmapData = () => {
    const weeks = [];
    const todayDate = new Date();

    for (let week = 7; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        const dateStr = date.toISOString().split('T')[0];
        const completedCount = state.habitLog[dateStr]?.length || 0;
        weekData.push({
          date: dateStr,
          count: completedCount,
          intensity: Math.min(5, completedCount)
        });
      }
      weeks.push(weekData);
    }
    return weeks;
  };

  const heatmapData = generateHeatmapData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex flex-col h-full pb-4 px-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Flame className="text-cyber-gold animate-fireFlicker" /> Habits
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press hover:shadow-neon-cyan transition-all"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Daily Habits */}
      <div className="space-y-3 mb-6">
        {state.habits.map((habit, i) => {
          const completed = isHabitCompletedToday(habit.id);
          const streak = getStreak(habit.id);

          return (
            <div
              key={habit.id}
              className={`bg-cyber-dark rounded-xl p-4 flex items-center justify-between transition-all animate-slideRight ${
                completed ? 'glow-border-cyan' : 'border border-cyber-gray'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all btn-press ${
                    completed
                      ? 'bg-cyber-cyan text-black scale-110'
                      : 'bg-cyber-gray text-gray-400 hover:bg-cyber-gray/80'
                  }`}
                >
                  {completed ? (
                    <Check size={24} className="animate-checkPop" />
                  ) : (
                    getHabitIcon(habit.icon)
                  )}
                </button>
                <div>
                  <p className={`font-medium transition-colors ${completed ? 'text-cyber-cyan' : 'text-white'}`}>
                    {habit.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {streak > 0 ? (
                      <span className="flex items-center gap-1">
                        <Flame size={10} className="text-orange-500" />
                        {streak} day streak
                      </span>
                    ) : (
                      'Start your streak'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {streak >= 3 && (
                  <div className={`bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${streak >= 7 ? 'animate-pulse' : ''}`}>
                    <Flame size={12} /> {streak}x
                  </div>
                )}
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="text-gray-600 hover:text-cyber-red p-1 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-cyan">
        <h3 className="font-display font-bold text-cyber-cyan mb-4 flex items-center gap-2">
          <Calendar size={18} /> Activity Heatmap
        </h3>

        {/* Day labels */}
        <div className="flex mb-2">
          <div className="w-6"></div>
          {dayLabels.map((day, i) => (
            <div key={i} className="flex-1 text-center text-gray-500 text-xs">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-1">
              <div className="w-6 text-gray-600 text-xs flex items-center">
                {weekIndex === 0 ? 'W8' : weekIndex === 7 ? 'W1' : ''}
              </div>
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`flex-1 aspect-square rounded-sm heatmap-${day.intensity} transition-all hover:scale-110`}
                  title={`${day.date}: ${day.count} habits`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-gray-500 text-xs">Less</span>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-3 h-3 rounded-sm heatmap-${i}`} />
          ))}
          <span className="text-gray-500 text-xs">More</span>
        </div>
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Habit">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Habit Name</label>
            <input
              type="text"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>
          <button
            onClick={handleAddHabit}
            className="w-full bg-cyber-cyan text-black py-3 rounded-lg font-bold btn-press hover:shadow-neon-cyan transition-all"
          >
            Add Habit
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ==================== REWARDS SHOP ====================
const Shop = ({ state, onBuyReward, onAddReward, onDeleteReward, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [purchasedReward, setPurchasedReward] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', cost: 100 });

  const handleBuy = (reward) => {
    if (state.player.gold < reward.cost) {
      showNotification('Not enough Gold!', 'error');
      return;
    }
    onBuyReward(reward);
    setPurchasedReward(reward);
    setShowPurchaseAnimation(true);
    setTimeout(() => {
      setShowPurchaseAnimation(false);
      setPurchasedReward(null);
    }, 3000);
  };

  const handleAddReward = () => {
    if (!newReward.name.trim()) return;
    onAddReward({
      id: generateId(),
      name: newReward.name,
      cost: parseInt(newReward.cost) || 100,
      icon: 'gift'
    });
    setNewReward({ name: '', cost: 100 });
    setShowAddModal(false);
    showNotification('Reward Added!', 'success');
  };

  return (
    <div className="flex flex-col h-full pb-4 px-4 overflow-y-auto">
      {/* Purchase Animation Overlay */}
      {showPurchaseAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fadeIn">
          <Particles type="gold" />

          <div className="text-center">
            <div className="w-28 h-28 mx-auto mb-6 bg-cyber-gold/20 rounded-full flex items-center justify-center animate-rewardUnlock">
              <Gift className="text-cyber-gold" size={56} />
            </div>
            <h3 className="font-display text-3xl font-bold gradient-text-gold mb-2 animate-glow">
              REWARD UNLOCKED!
            </h3>
            <p className="text-white text-xl mb-4">{purchasedReward?.name}</p>
            <div className="bg-cyber-gold/20 text-cyber-gold px-6 py-2 rounded-lg inline-block animate-pulse">
              <span className="font-display font-bold">Enjoy your reward!</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingBag className="text-cyber-gold" /> Shop
        </h2>
        <div className="flex items-center gap-3">
          <div className="bg-cyber-gold/20 text-cyber-gold px-3 py-1 rounded-lg font-bold flex items-center gap-1">
            <Coins size={16} className="animate-coinBounce" /> {state.player.gold}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyber-cyan text-black px-3 py-2 rounded-lg font-bold flex items-center gap-1 btn-press hover:shadow-neon-cyan transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyber-gold/20 to-cyber-purple/20 rounded-xl p-4 mb-4 border border-cyber-gold/30">
        <p className="text-gray-300 text-sm text-center">
          Complete quests and habits to earn Gold. Spend it on rewards you deserve!
        </p>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {state.rewards.map((reward, i) => (
          <div
            key={reward.id}
            className="bg-cyber-dark rounded-xl p-4 glow-border-gold card-hover relative animate-fadeIn"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <button
              onClick={() => onDeleteReward(reward.id)}
              className="absolute top-2 right-2 text-gray-600 hover:text-cyber-red p-1 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="w-14 h-14 mx-auto mb-3 bg-cyber-gold/20 rounded-full flex items-center justify-center">
              <Gift className="text-cyber-gold" size={28} />
            </div>
            <h4 className="font-bold text-white text-center text-sm mb-2">{reward.name}</h4>
            <div className="text-cyber-gold text-center font-display font-bold mb-3 flex items-center justify-center gap-1">
              <Coins size={14} /> {reward.cost}
            </div>
            <button
              onClick={() => handleBuy(reward)}
              disabled={state.player.gold < reward.cost}
              className={`w-full py-2 rounded-lg font-bold text-sm btn-press transition-all ${
                state.player.gold >= reward.cost
                  ? 'bg-cyber-gold text-black hover:shadow-neon-gold'
                  : 'bg-cyber-gray text-gray-500 cursor-not-allowed'
              }`}
            >
              {state.player.gold >= reward.cost ? 'Buy' : 'Need Gold'}
            </button>
          </div>
        ))}
      </div>

      {/* Add Reward Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Reward">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Reward Name</label>
            <input
              type="text"
              value={newReward.name}
              onChange={e => setNewReward({ ...newReward, name: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="e.g., Watch a movie"
            />
          </div>
          <div>
            <label className="text-cyber-gold text-xs uppercase tracking-wider block mb-1">Cost (Gold)</label>
            <input
              type="number"
              value={newReward.cost}
              onChange={e => setNewReward({ ...newReward, cost: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
            />
          </div>
          <button
            onClick={handleAddReward}
            className="w-full bg-cyber-gold text-black py-3 rounded-lg font-bold btn-press hover:shadow-neon-gold transition-all"
          >
            Add Reward
          </button>
        </div>
      </Modal>
    </div>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  const [state, setState] = useState(getInitialState);
  const [activeTab, setActiveTab] = useState('home');
  const [notification, setNotification] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('theSystemSound');
    return saved !== 'false';
  });
  const previousLevel = useRef(calculateLevel(state.player.totalXp));
  const previousRank = useRef(getRank(calculateLevel(state.player.totalXp)));

  // Update sound manager when sound enabled changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    localStorage.setItem('theSystemSound', soundEnabled.toString());
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    soundManager.click();
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('theSystem', JSON.stringify(state));
  }, [state]);

  // Check for level/rank ups
  useEffect(() => {
    const currentLevel = calculateLevel(state.player.totalXp);
    const currentRank = getRank(currentLevel);

    if (currentLevel > previousLevel.current) {
      // Level up!
      if (currentRank.name !== previousRank.current.name) {
        // Rank up!
        setCelebration({ type: 'rankUp', rank: currentRank });
      } else {
        setCelebration({ type: 'levelUp', level: currentLevel, rank: currentRank });
      }
    }

    previousLevel.current = currentLevel;
    previousRank.current = currentRank;
  }, [state.player.totalXp]);

  // Check login status on mount
  useEffect(() => {
    if (!state.onboarded) return;

    const today = getToday();
    const lastLogin = state.player.lastLoginDate;

    if (lastLogin && lastLogin !== today) {
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        const penalty = MISSED_DAY_PENALTY * (diffDays - 1);
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            totalXp: Math.max(0, prev.player.totalXp - penalty),
            health: Math.max(0, prev.player.health - 10),
            lastLoginDate: today,
            checkedInToday: false
          }
        }));
        showNotification(`Missed ${diffDays - 1} days! -${penalty} XP`, 'error');
      } else {
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            lastLoginDate: today,
            checkedInToday: false
          }
        }));
      }
    }
  }, [state.onboarded]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const addFloatingText = useCallback((text, type, x, y) => {
    const id = generateId();
    setFloatingTexts(prev => [...prev, { id, text, type, position: { x, y } }]);
  }, []);

  const removeFloatingText = useCallback((id) => {
    setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
  }, []);

  const handleOnboardingComplete = (playerData) => {
    setState(prev => ({
      ...prev,
      onboarded: true,
      player: {
        ...prev.player,
        name: playerData.name,
        class: playerData.class,
        lastLoginDate: getToday()
      }
    }));
  };

  const handleLoginReward = () => {
    soundManager.checkIn();
    const today = getToday();
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: prev.player.totalXp + DAILY_LOGIN_XP,
        lastLoginDate: today,
        checkedInToday: true
      }
    }));
  };

  const handleAddQuest = (quest) => {
    soundManager.success();
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, quest]
    }));
  };

  const handleCompleteQuest = (quest) => {
    soundManager.coin();
    setCelebration({ type: 'quest', quest });
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: prev.player.totalXp + quest.reward,
        gold: prev.player.gold + quest.goldReward,
        totalQuestsCompleted: prev.player.totalQuestsCompleted + 1
      },
      quests: prev.quests.filter(q => q.id !== quest.id),
      questLog: [...prev.questLog, { ...quest, completed: true, completedAt: new Date().toISOString() }]
    }));
  };

  const handleSkipQuest = (quest) => {
    soundManager.skip();
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: Math.max(0, prev.player.totalXp - quest.penalty)
      },
      quests: prev.quests.filter(q => q.id !== quest.id),
      questLog: [...prev.questLog, { ...quest, completed: false, penaltyApplied: quest.penalty, completedAt: new Date().toISOString() }]
    }));
    showNotification(`Quest Skipped! -${quest.penalty} XP`, 'error');
  };

  const handleFailQuest = (quest) => {
    soundManager.penalty();
    const doublePenalty = quest.penalty * 2;
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: Math.max(0, prev.player.totalXp - doublePenalty),
        health: Math.max(0, prev.player.health - 5)
      },
      quests: prev.quests.filter(q => q.id !== quest.id),
      questLog: [...prev.questLog, { ...quest, completed: false, penaltyApplied: doublePenalty, completedAt: new Date().toISOString() }]
    }));
    showNotification(`Quest Failed! -${doublePenalty} XP -5 Health`, 'error');
  };

  const handleDeleteQuest = (questId) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId)
    }));
  };

  const handleUpdateVision = (vision) => {
    setState(prev => ({
      ...prev,
      vision
    }));
  };

  const handleToggleHabit = (habitId) => {
    const today = getToday();
    const todayHabits = state.habitLog[today] || [];
    const habit = state.habits.find(h => h.id === habitId);

    if (todayHabits.includes(habitId)) {
      // Remove habit
      soundManager.click();
      setState(prev => ({
        ...prev,
        habitLog: {
          ...prev.habitLog,
          [today]: prev.habitLog[today].filter(id => id !== habitId)
        },
        habitStreaks: {
          ...prev.habitStreaks,
          [habitId]: Math.max(0, (prev.habitStreaks[habitId] || 0) - 1)
        }
      }));
    } else {
      // Add habit
      soundManager.habitComplete();
      const currentStreak = state.habitStreaks[habitId] || 0;
      const newStreak = currentStreak + 1;
      const xpGain = 10 * newStreak;

      // Show streak celebration for milestones
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setCelebration({ type: 'streak', streak: newStreak, habitName: habit?.name });
      }

      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          totalXp: prev.player.totalXp + xpGain,
          gold: prev.player.gold + 5,
          totalHabitsCompleted: prev.player.totalHabitsCompleted + 1,
          longestStreak: Math.max(prev.player.longestStreak, newStreak)
        },
        habitLog: {
          ...prev.habitLog,
          [today]: [...todayHabits, habitId]
        },
        habitStreaks: {
          ...prev.habitStreaks,
          [habitId]: newStreak
        }
      }));
      showNotification(`+${xpGain} XP (${newStreak}x streak!)`, 'success');
    }
  };

  const handleAddHabit = (habit) => {
    soundManager.success();
    setState(prev => ({
      ...prev,
      habits: [...prev.habits, habit]
    }));
  };

  const handleDeleteHabit = (habitId) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== habitId)
    }));
  };

  const handleBuyReward = (reward) => {
    soundManager.rewardUnlock();
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        gold: prev.player.gold - reward.cost
      }
    }));
  };

  const handleAddReward = (reward) => {
    soundManager.success();
    setState(prev => ({
      ...prev,
      rewards: [...prev.rewards, reward]
    }));
  };

  const handleDeleteReward = (rewardId) => {
    setState(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== rewardId)
    }));
  };

  const handleCloseCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'quests', icon: Swords, label: 'Quests' },
    { id: 'awakening', icon: Eye, label: 'Vision' },
    { id: 'habits', icon: Flame, label: 'Habits' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' }
  ];

  // Show onboarding if not completed
  if (!state.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col max-w-[430px] mx-auto relative overflow-hidden">
      {/* Celebrations */}
      {celebration?.type === 'levelUp' && (
        <LevelUpCelebration
          level={celebration.level}
          rank={celebration.rank}
          onClose={handleCloseCelebration}
        />
      )}
      {celebration?.type === 'rankUp' && (
        <RankUpCelebration
          rank={celebration.rank}
          onClose={handleCloseCelebration}
        />
      )}
      {celebration?.type === 'streak' && (
        <StreakCelebration
          streak={celebration.streak}
          habitName={celebration.habitName}
          onClose={handleCloseCelebration}
        />
      )}
      {celebration?.type === 'quest' && (
        <QuestCompleteCelebration
          quest={celebration.quest}
          onClose={handleCloseCelebration}
        />
      )}

      {/* Floating Texts */}
      {floatingTexts.map(ft => (
        <FloatingText
          key={ft.id}
          text={ft.text}
          type={ft.type}
          position={ft.position}
          onComplete={() => removeFloatingText(ft.id)}
        />
      ))}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'home' && (
          <Dashboard
            state={state}
            onLoginReward={handleLoginReward}
            showNotification={showNotification}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        )}
        {activeTab === 'quests' && (
          <Quests
            state={state}
            onAddQuest={handleAddQuest}
            onCompleteQuest={handleCompleteQuest}
            onSkipQuest={handleSkipQuest}
            onFailQuest={handleFailQuest}
            onDeleteQuest={handleDeleteQuest}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'awakening' && (
          <Awakening
            state={state}
            onUpdateVision={handleUpdateVision}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'habits' && (
          <Habits
            state={state}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'shop' && (
          <Shop
            state={state}
            onBuyReward={handleBuyReward}
            onAddReward={handleAddReward}
            onDeleteReward={handleDeleteReward}
            showNotification={showNotification}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-cyber-dark border-t border-cyber-cyan/20 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab !== tab.id) {
                    soundManager.tabSwitch();
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all btn-press ${
                  isActive
                    ? 'text-cyber-cyan bg-cyber-cyan/10'
                    : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default App;
