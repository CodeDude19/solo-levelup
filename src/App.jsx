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
  Crosshair,
  Download,
  Smartphone,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Undo2
} from 'lucide-react';

// Core constants and configuration
import { RANKS, QUEST_RANKS, BASE_URL, DAILY_LOGIN_XP, MISSED_DAY_PENALTY, MAX_HEALTH, STREAK_BREAK_PENALTY } from './core/constants';
import { getInitialState } from './core/state';

// Utilities
import { getToday, formatTimeRemaining } from './utils/formatters';
import { getRank, getNextRank, calculateLevel, calculateXpProgress } from './utils/helpers';
import { generateId } from './utils/generators';

// Configuration
import { TRACKS } from './config/tracks';
import { REWARD_TIERS, HABIT_ICONS, FALLBACK_QUOTES, TAB_INFO } from './config/rewards';

// Sound system
import soundManager from './core/SoundManager';
import SoundContext from './contexts/SoundContext';


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
              <img
                src={rank.icon}
                alt={rank.name}
                className="w-32 h-32 mx-auto object-contain animate-levelNumber"
                style={{ filter: `drop-shadow(0 0 30px ${rank.color})` }}
              />
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
              <img
                src={rank.icon}
                alt={rank.name}
                className="mx-auto mb-4 w-24 h-24 object-contain animate-bounce"
                style={{ filter: `drop-shadow(0 0 20px ${rank.color})` }}
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
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showAwakening, setShowAwakening] = useState(false);
  const [fuel, setFuel] = useState('');
  const [fear, setFear] = useState('');

  const steps = [
    'intro',
    'name',
    'track',
    'explain',
    'vision',
    'credits',
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
    const track = TRACKS.find(t => t.id === selectedTrack) || TRACKS[0];
    onComplete({
      name: playerName || 'Hunter',
      track: selectedTrack || 'custom',
      habits: track.habits,
      quests: track.quests.map(q => ({
        ...q,
        id: generateId(),
        rank: q.rank || 'B',
        createdAt: new Date().toISOString(),
        completed: false,
        failed: false
      })),
      rewards: (track.rewards || []).map(r => ({
        ...r,
        id: generateId()
      })),
      vision: {
        fuel: fuel.trim(),
        fear: fear.trim()
      }
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

      <div className="flex-1 flex flex-col px-6 overflow-y-auto py-4">
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
              onChange={(e) => setPlayerName(e.target.value.trimStart())}
              placeholder="Enter your name..."
              className="w-full bg-cyber-gray text-white text-center text-xl rounded-xl px-6 py-4 outline-none focus:ring-2 focus:ring-cyber-cyan mb-4 font-display"
              maxLength={20}
            />

            <p className="text-gray-600 text-sm">
              {playerName ? `Welcome, ${playerName.trim()}` : 'Choose wisely, Hunter.'}
            </p>
          </div>
        )}

        {/* Step: Track Selection */}
        {step === 2 && (
          <div className="animate-fadeIn flex-1">
            <div className="text-center mb-4 pt-2">
              <Target className="mx-auto text-cyber-cyan mb-2" size={36} />
              <h2 className="font-display text-xl font-bold text-white mb-1">
                CHOOSE YOUR TRACK
              </h2>
              <p className="text-gray-500 text-sm">Select your discipline path</p>
            </div>

            <div className="space-y-2">
              {TRACKS.map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => {
                    soundManager.click();
                    setSelectedTrack(track.id);
                  }}
                  className={`w-full p-3 rounded-xl border-2 transition-all btn-press text-left animate-slideRight ${
                    selectedTrack === track.id
                      ? 'border-opacity-100'
                      : 'border-opacity-30 hover:border-opacity-50'
                  }`}
                  style={{
                    borderColor: track.color,
                    backgroundColor: selectedTrack === track.id ? `${track.color}20` : 'transparent',
                    animationDelay: `${i * 0.05}s`
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${track.color}20` }}
                    >
                      {track.icon === 'sparkles' && <Sparkles size={22} style={{ color: track.color }} />}
                      {track.icon === 'zap' && <Zap size={22} style={{ color: track.color }} />}
                      {track.icon === 'heart' && <Heart size={22} style={{ color: track.color }} />}
                      {track.icon === 'crown' && <Crown size={22} style={{ color: track.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-white text-base">{track.name}</p>
                      <p className="text-gray-400 text-xs">{track.desc}</p>
                      {track.habits.length > 0 && (
                        <p className="text-[10px] mt-0.5" style={{ color: track.color }}>
                          {track.habits.length} habits • {track.quests.length} quests
                        </p>
                      )}
                      {track.id === 'custom' && (
                        <p className="text-[10px] mt-0.5 text-gray-500">
                          Build your own path
                        </p>
                      )}
                    </div>
                    {selectedTrack === track.id && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center animate-checkPop flex-shrink-0"
                        style={{ backgroundColor: track.color }}
                      >
                        <Check size={16} className="text-black" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Explanation */}
        {step === 3 && (
          <div className="animate-fadeIn flex flex-col justify-center flex-1">
            <div className="text-center mb-4">
              <Scroll className="mx-auto text-cyber-cyan mb-2" size={36} />
              <h2 className="font-display text-xl font-bold text-white mb-1">
                THE RULES
              </h2>
              <p className="text-gray-500 text-sm">Understand the system</p>
            </div>

            <div className="space-y-2">
              <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-cyan/20 animate-slideRight" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                    <Swords className="text-cyber-cyan" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Quests</p>
                    <p className="text-gray-500 text-xs">Complete tasks. Gain XP & Gold.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-gold/20 animate-slideRight" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyber-gold/20 flex items-center justify-center flex-shrink-0">
                    <Flame className="text-cyber-gold" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Habits</p>
                    <p className="text-gray-500 text-xs">Build streaks. Multiply rewards.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-red/20 animate-slideRight" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                    <Skull className="text-cyber-red" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Penalties</p>
                    <p className="text-gray-500 text-xs">Fail? Face consequences.</p>
                  </div>
                </div>
              </div>

              <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-purple/20 animate-slideRight" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyber-purple/20 flex items-center justify-center flex-shrink-0">
                    <Crown className="text-cyber-purple" size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Rank Up</p>
                    <p className="text-gray-500 text-xs">Level up. Achieve new ranks.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step: Vision Input */}
        {step === 4 && (
          <div className="animate-fadeIn flex flex-col justify-center flex-1">
            {/* The Fuel */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                <Crown className="text-cyber-cyan" size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">THE FUEL</h2>
                <p className="text-gray-500 text-xs">What drives you? Who do you want to become?</p>
              </div>
            </div>

            <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-cyan/30 mb-4">
              <textarea
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                placeholder="I want to become a disciplined person who achieves their goals..."
                className="w-full bg-transparent text-white text-sm rounded-lg px-2 py-1 outline-none resize-none h-20 placeholder:text-gray-600"
                maxLength={300}
              />
              <div className="flex justify-end">
                <span className="text-gray-600 text-[10px]">{fuel.length}/300</span>
              </div>
            </div>

            {/* The Fear */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                <Skull className="text-cyber-red" size={20} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-white">THE FEAR</h2>
                <p className="text-gray-500 text-xs">What happens if you fail? Your anti-vision.</p>
              </div>
            </div>

            <div className="bg-cyber-dark rounded-lg p-3 border border-cyber-red/30">
              <textarea
                value={fear}
                onChange={(e) => setFear(e.target.value)}
                placeholder="If I give up, I'll remain stuck, broke, and full of regret..."
                className="w-full bg-transparent text-white text-sm rounded-lg px-2 py-1 outline-none resize-none h-20 placeholder:text-gray-600"
                maxLength={300}
              />
              <div className="flex justify-end">
                <span className="text-gray-600 text-[10px]">{fear.length}/300</span>
              </div>
            </div>
          </div>
        )}

        {/* Step: Credits */}
        {step === 5 && (
          <div className="animate-fadeIn flex flex-col justify-center items-center flex-1">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-cyber-cyan/50 animate-pulse-glow">
                <img
                  src="https://media.licdn.com/dms/image/v2/D4D03AQEaCeHaN-cHzQ/profile-displayphoto-crop_800_800/B4DZjbqFDCGgAI-/0/1756031899355?e=1769644800&v=beta&t=SO7Zsqb1K4h9U1g55pPa4mdgjy6CACrKa9JsPnKunPk"
                  alt="Yasser Arafat"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-gray-400 text-sm mb-1">Made with</p>
              <p className="text-cyber-red text-2xl mb-1">❤</p>
              <p className="text-gray-400 text-sm mb-3">by</p>

              <h2 className="font-display text-2xl font-bold text-cyber-cyan mb-2">
                Yasser Arafat
              </h2>

              <a
                href="https://www.linkedin.com/in/yasserarafat007"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyber-cyan/20 text-cyber-cyan px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyber-cyan/30 transition-all"
                onClick={() => soundManager.click()}
              >
                <User size={16} />
                Connect on LinkedIn
              </a>

              <div className="mt-6 bg-cyber-dark/50 rounded-xl p-4 border border-cyber-cyan/20">
                <p className="text-gray-400 text-xs leading-relaxed">
                  Built with passion to help you level up your life.
                  <br />
                  Transform discipline into power. Arise, Hunter.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step: Ready to Awaken */}
        {step === 6 && (
          <div className="animate-fadeIn text-center flex flex-col justify-center flex-1">
            <Eye className="mx-auto text-cyber-purple mb-4 animate-pulse" size={56} />
            <h2 className="font-display text-xl font-bold text-white mb-2">
              READY TO AWAKEN
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Your purpose is set. Your path is clear.
            </p>

            <div className="bg-gradient-to-b from-cyber-purple/20 to-transparent rounded-xl p-4 border border-cyber-purple/30">
              <p className="text-gray-300 text-sm leading-relaxed">
                THE SYSTEM will now bind to your soul.
                <br /><br />
                <span className="text-cyber-cyan font-bold">Discipline</span> becomes <span className="text-cyber-gold font-bold">Power</span>.
                <br /><br />
                <span className="text-gray-500 text-xs">There is no turning back.</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="p-6 safe-area-bottom">
        <button
          onClick={handleNext}
          disabled={(step === 1 && !playerName.trim()) || (step === 2 && !selectedTrack)}
          className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all btn-press ${
            (step === 1 && !playerName.trim()) || (step === 2 && !selectedTrack)
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
              Level 1 • Silver Rank
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
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-cyber-green/60 border-cyber-green' :
                  type === 'error' ? 'bg-cyber-red/60 border-cyber-red' :
                  type === 'gold' ? 'bg-cyber-gold/60 border-cyber-gold' :
                  'bg-cyber-cyan/60 border-cyber-cyan';

  const textColor = type === 'success' ? 'text-white' :
                    type === 'error' ? 'text-white' :
                    type === 'gold' ? 'text-black' :
                    'text-black';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none px-4">
      <div className={`px-6 py-3 rounded-xl border-2 ${bgColor} animate-scaleIn backdrop-blur-sm`}>
        <p className={`text-center font-bold ${textColor}`}>{message}</p>
      </div>
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

// ==================== REFLECT PAGE ====================
const Dashboard = ({ state, onLoginReward, showNotification }) => {
  const { player, habits, habitLog, habitStreaks, questLog } = state;
  const today = getToday();

  // Rank & Level
  const rank = getRank(player.totalXp);
  const nextRank = getNextRank(player.totalXp);
  const xpProgress = calculateXpProgress(player.totalXp);
  const level = rank.level;

  // Power Level calculation
  const totalStreakBonus = Object.values(habitStreaks).reduce((sum, s) => sum + s * 10, 0);
  const powerLevel = player.totalXp + totalStreakBonus;

  const [showCheckinAnim, setShowCheckinAnim] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const handleCheckIn = () => {
    if (!player.checkedInToday) {
      setShowCheckinAnim(true);
      setTimeout(() => setShowCheckinAnim(false), 1500);
      onLoginReward();
    }
  };

  // Helper to get dates for a week (using local date to avoid timezone issues)
  const getWeekDates = (weekOffset = 0) => {
    const dates = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.push(localDate);
    }
    return dates;
  };

  // Helper to get month dates (using local date to avoid timezone issues)
  const getMonthDates = (monthOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      // Use local date formatting to avoid timezone shifts
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push(localDate);
    }
    return dates;
  };

  // Current week stats
  const currentWeekDates = getWeekDates(0);
  const pastWeekDates = getWeekDates(1);

  const calculateWeekStats = (dates) => {
    let habitsCompleted = 0;
    let questsCompleted = 0;
    let questsFailed = 0;
    let daysActive = 0;

    dates.forEach(date => {
      const dayHabits = habitLog[date]?.length || 0;
      if (dayHabits > 0) daysActive++;
      habitsCompleted += dayHabits;
    });

    // Quest log stats for the week
    (questLog || []).forEach(q => {
      if (q.completedAt) {
        // Convert ISO timestamp to local date
        const d = new Date(q.completedAt);
        const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (dates.includes(qDate)) {
          if (q.completed) questsCompleted++;
          else questsFailed++;
        }
      }
    });

    return { habitsCompleted, questsCompleted, questsFailed, daysActive };
  };

  const currentWeekStats = calculateWeekStats(currentWeekDates);
  const pastWeekStats = calculateWeekStats(pastWeekDates);

  // Monthly calendar data (uses monthOffset for navigation)
  const currentMonthDates = getMonthDates(monthOffset);
  const selectedMonthDate = new Date();
  selectedMonthDate.setMonth(selectedMonthDate.getMonth() + monthOffset);
  const monthName = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate month stats
  const monthHabitsCompleted = currentMonthDates.reduce((sum, date) => sum + (habitLog[date]?.length || 0), 0);
  const monthQuestsCompleted = (questLog || []).filter(q => {
    if (!q.completedAt || !q.completed) return false;
    // Convert ISO timestamp to local date
    const d = new Date(q.completedAt);
    const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return currentMonthDates.includes(qDate);
  }).length;

  // Actual active days (days with at least one habit or quest activity)
  const activeDays = (() => {
    const activeDates = new Set();

    // Add dates from habit log
    Object.keys(habitLog).forEach(date => {
      if (habitLog[date]?.length > 0) {
        activeDates.add(date);
      }
    });

    // Add dates from quest log
    (questLog || []).forEach(q => {
      if (q.completedAt) {
        // Convert ISO timestamp to local date
        const d = new Date(q.completedAt);
        const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        activeDates.add(qDate);
      }
    });

    return activeDates.size;
  })();

  // Get day labels
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get first day of month offset (for the selected month)
  const firstDayOffset = (() => {
    if (currentMonthDates.length === 0) return 0;
    // Parse date string manually to avoid timezone issues
    const [year, month, day] = currentMonthDates[0].split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
  })();

  return (
    <div className="h-full overflow-y-auto pb-4 px-4">
      {/* Checkin Animation */}
      {showCheckinAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyber-cyan/20 flex items-center justify-center animate-checkPop">
              <Calendar className="text-cyber-cyan" size={32} />
            </div>
            <p className="text-cyber-cyan font-display text-xl font-bold">+{DAILY_LOGIN_XP} XP</p>
            <p className="text-gray-400 text-sm">Daily Bonus!</p>
          </div>
          <Particles type="xp" />
        </div>
      )}

      {/* Ranks Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn" onClick={() => setShowRanksModal(false)}>
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-4 animate-modalPop" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-cyber-cyan flex items-center gap-2">
                <Crown size={16} /> Hunter Ranks
              </h3>
              <button onClick={() => setShowRanksModal(false)} className="text-gray-500 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {RANKS.map((r) => {
                const isCurrentRank = r.name === rank.name;
                const isUnlocked = player.totalXp >= r.minXp;
                return (
                  <div
                    key={r.name}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCurrentRank ? 'bg-cyber-cyan/10 border border-cyber-cyan/30' : 'bg-cyber-gray/30'
                    } ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}
                  >
                    <img src={r.icon} alt={r.name} className="w-8 h-8 object-contain" />
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm" style={{ color: r.color }}>{r.name}</p>
                      <p className="text-gray-500 text-[10px]">{r.minXp.toLocaleString()} XP</p>
                    </div>
                    {isCurrentRank && (
                      <span className="text-cyber-cyan text-[10px] font-bold bg-cyber-cyan/20 px-2 py-0.5 rounded">YOU</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="font-display text-xl font-black text-white flex items-center gap-2">
          <Eye className="text-cyber-cyan" size={20} /> Reflect
        </h1>
        <p className="text-gray-500 text-[10px] tracking-widest">HUNTER {player.name?.toUpperCase()}</p>
      </div>

      {/* Daily Check-in Button */}
      {!player.checkedInToday && (
        <button
          onClick={handleCheckIn}
          className="w-full mb-3 py-3 px-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all btn-press relative overflow-hidden bg-gradient-to-r from-cyber-cyan/20 to-cyber-green/20 text-cyber-cyan border border-cyber-cyan/50 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <Calendar size={18} />
          <span>Daily Check-in</span>
          <span className="text-cyber-green font-bold">+{DAILY_LOGIN_XP} XP</span>
        </button>
      )}

      {/* Current Status Card */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-cyan mb-3">
        {/* Main Row: Icon + Power Level + Road to Next */}
        <div className="flex items-center gap-3 mb-3">
          {/* Rank Icon */}
          <button
            onClick={() => { soundManager.click(); setShowRanksModal(true); }}
            className="flex-shrink-0 hover:scale-105 transition-transform btn-press"
          >
            <img src={rank.icon} alt={rank.name} className="w-14 h-14 object-contain" style={{ filter: `drop-shadow(0 0 8px ${rank.color}40)` }} />
          </button>

          {/* Power Level */}
          <div className="flex-shrink-0">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Power</p>
            <p className="font-display text-2xl font-black text-white">{powerLevel.toLocaleString()}</p>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-700 mx-1" />

          {/* Road to Next Rank */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                {nextRank ? `Road to ${nextRank.name}` : 'Max Rank'}
              </p>
              <p className="text-cyber-cyan text-[10px] font-bold">{Math.round(xpProgress.percent)}%</p>
            </div>
            <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
              <div className="h-full progress-bar-xp rounded-full transition-all" style={{ width: `${xpProgress.percent}%` }} />
            </div>
            <p className="text-gray-600 text-[9px] mt-1">{xpProgress.current.toLocaleString()} / {xpProgress.total.toLocaleString()} XP</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Coins size={14} className="text-cyber-gold mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-gold">{player.gold}</p>
            <p className="text-gray-500 text-[8px]">GOLD</p>
          </div>
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Trophy size={14} className="text-cyber-purple mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-purple">{player.totalQuestsCompleted}</p>
            <p className="text-gray-500 text-[8px]">QUESTS</p>
          </div>
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Calendar size={14} className="text-cyber-green mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-green">{activeDays}</p>
            <p className="text-gray-500 text-[8px]">ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-cyber-cyan/20">
        <h3 className="font-display font-bold text-cyber-cyan flex items-center gap-2 text-sm mb-3">
          <Zap size={14} /> Weekly Progress
        </h3>

        <div className="bg-cyber-gray/30 rounded-lg overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-2 border-b border-gray-700/50">
            <div className="p-2 text-center border-r border-gray-700/50">
              <p className="text-cyber-cyan text-[10px] uppercase tracking-wider font-bold">This Week</p>
            </div>
            <div className="p-2 text-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Last Week</p>
            </div>
          </div>

          {/* Stats Rows */}
          <div className="grid grid-cols-2">
            {/* This Week */}
            <div className="p-3 border-r border-gray-700/50">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Habits</span>
                  <span className="text-cyber-cyan font-bold text-sm">{currentWeekStats.habitsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Quests</span>
                  <span className="text-cyber-green font-bold text-sm">{currentWeekStats.questsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Active Days</span>
                  <span className="text-white font-bold text-sm">{currentWeekStats.daysActive}/7</span>
                </div>
              </div>
            </div>

            {/* Last Week */}
            <div className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Habits</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.habitsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Quests</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.questsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Active Days</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.daysActive}/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Comparison Indicator */}
        {pastWeekStats.habitsCompleted > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-2">
              {currentWeekStats.habitsCompleted >= pastWeekStats.habitsCompleted ? (
                <>
                  <ChevronUp className="text-cyber-green" size={16} />
                  <span className="text-cyber-green text-xs font-bold">
                    {currentWeekStats.habitsCompleted > pastWeekStats.habitsCompleted
                      ? `+${currentWeekStats.habitsCompleted - pastWeekStats.habitsCompleted} habits vs last week`
                      : 'Same as last week'}
                  </span>
                </>
              ) : (
                <>
                  <ChevronDown className="text-cyber-red" size={16} />
                  <span className="text-cyber-red text-xs font-bold">
                    {pastWeekStats.habitsCompleted - currentWeekStats.habitsCompleted} fewer habits vs last week
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Calendar */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-cyber-purple/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-cyber-purple flex items-center gap-2 text-sm">
            <Calendar size={14} /> {monthName}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(prev => prev - 1);
              }}
              className="p-1.5 rounded-lg bg-cyber-gray/50 text-gray-400 hover:text-cyber-purple hover:bg-cyber-purple/20 transition-all btn-press"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(0);
              }}
              disabled={monthOffset === 0}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                monthOffset === 0
                  ? 'bg-cyber-gray/30 text-gray-600 cursor-not-allowed'
                  : 'bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/30 btn-press'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(prev => prev + 1);
              }}
              disabled={monthOffset >= 0}
              className={`p-1.5 rounded-lg transition-all ${
                monthOffset >= 0
                  ? 'bg-cyber-gray/30 text-gray-600 cursor-not-allowed'
                  : 'bg-cyber-gray/50 text-gray-400 hover:text-cyber-purple hover:bg-cyber-purple/20 btn-press'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayLabels.map((day, i) => (
            <div key={i} className="text-center text-gray-500 text-[10px]">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {[...Array(firstDayOffset)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {currentMonthDates.map((date) => {
            // Parse date string manually to avoid timezone issues
            const dayNum = parseInt(date.split('-')[2], 10);
            const habitsCount = habitLog[date]?.length || 0;
            const isToday = date === today && monthOffset === 0;
            const intensity = Math.min(5, habitsCount);

            return (
              <div
                key={date}
                className={`aspect-square rounded-sm flex items-center justify-center text-[10px] relative ${
                  isToday ? 'ring-1 ring-cyber-cyan' : ''
                } heatmap-${intensity}`}
                title={`${date}: ${habitsCount} habits`}
              >
                <span className={habitsCount > 0 ? 'text-white' : 'text-gray-600'}>{dayNum}</span>
              </div>
            );
          })}
        </div>

        {/* Month Summary */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-500" />
              <span className="text-xs text-gray-400">{monthHabitsCompleted} habits</span>
            </div>
            <div className="flex items-center gap-1">
              <Swords size={12} className="text-cyber-cyan" />
              <span className="text-xs text-gray-400">{monthQuestsCompleted} quests</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-[8px]">Less</span>
            {[0, 2, 4, 5].map(i => (
              <div key={i} className={`w-2 h-2 rounded-sm heatmap-${i}`} />
            ))}
            <span className="text-gray-600 text-[8px]">More</span>
          </div>
        </div>
      </div>

      {/* Best Streaks */}
      {Object.keys(habitStreaks).length > 0 && (
        <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-orange-500/20">
          <h3 className="font-display font-bold text-orange-400 flex items-center gap-2 text-xs mb-2">
            <Flame size={12} /> Best Streaks
          </h3>
          <div className="space-y-2">
            {Object.entries(habitStreaks)
              .filter(([_, streak]) => streak > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([habitId, streak]) => {
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return null;
                return (
                  <div key={habitId} className="flex items-center justify-between bg-cyber-gray/30 rounded-lg px-3 py-2">
                    <span className="text-gray-300 text-xs truncate flex-1">{habit.name}</span>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame size={12} />
                      <span className="font-bold text-sm">{streak}</span>
                      <span className="text-gray-500 text-[10px]">days</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
};

// ==================== QUESTS SYSTEM ====================
const Quests = ({ state, onAddQuest, onCompleteQuest, onFailQuest, onDeleteQuest, onUndoQuest, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('questIntroSeen');
  });
  const [newQuest, setNewQuest] = useState({
    name: '',
    dueDate: '',
    rank: 'B'
  });
  const dateInputRef = useRef(null);

  // Get active quests sorted by: earliest due date → threat level → no date last
  const rankOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
  const activeQuests = state.quests
    .filter(q => !q.completed && !q.failed)
    .sort((a, b) => {
      // Quests with due dates come first, sorted by earliest date
      const hasDateA = !!a.dueDate;
      const hasDateB = !!b.dueDate;

      if (hasDateA && !hasDateB) return -1; // A has date, B doesn't → A first
      if (!hasDateA && hasDateB) return 1;  // B has date, A doesn't → B first

      if (hasDateA && hasDateB) {
        // Both have dates - sort by earliest date first
        const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
      }

      // Same date or both no date - sort by threat level (S > A > B > C)
      const rankA = rankOrder[a.rank] ?? 2;
      const rankB = rankOrder[b.rank] ?? 2;
      return rankA - rankB;
    });

  const getQuestRankInfo = (rankId) => {
    return QUEST_RANKS.find(r => r.id === rankId) || QUEST_RANKS[2];
  };

  const getRankIcon = (rankId) => {
    const rankInfo = getQuestRankInfo(rankId);
    const iconStyle = { color: rankInfo.color };
    switch (rankId) {
      case 'S': return <Skull size={20} style={iconStyle} />;
      case 'A': return <Flame size={20} style={iconStyle} />;
      case 'B': return <Swords size={20} style={iconStyle} />;
      case 'C': return <Scroll size={20} style={iconStyle} />;
      default: return <Swords size={20} style={iconStyle} />;
    }
  };

  const handleAddQuest = () => {
    if (!newQuest.name.trim()) return;
    const rankInfo = getQuestRankInfo(newQuest.rank);
    // Fixed base values
    const baseReward = 50;
    const baseGold = 50;
    const basePenalty = 25;

    onAddQuest({
      id: generateId(),
      name: newQuest.name,
      reward: Math.round(baseReward * rankInfo.multiplier),
      penalty: Math.round(basePenalty * rankInfo.multiplier),
      goldReward: Math.round(baseGold * rankInfo.multiplier),
      dueDate: newQuest.dueDate,
      rank: newQuest.rank,
      createdAt: new Date().toISOString(),
      completed: false,
      failed: false
    });
    setNewQuest({ name: '', dueDate: '', rank: 'B' });
    setShowAddModal(false);
    soundManager.success();
    showNotification('Quest Added!', 'success');
  };

  const handleDismissIntro = () => {
    soundManager.click();
    setShowIntro(false);
    localStorage.setItem('questIntroSeen', 'true');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* First-time Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-6 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-cyan mb-4">
              <Swords size={28} />
              <h3 className="font-display font-bold text-xl">QUESTS</h3>
            </div>

            <p className="text-gray-300 text-sm text-center mb-5">
              Quests are your tasks. Complete them to earn XP and Gold. Fail them and face penalties.
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                  <Skull size={16} className="text-cyber-red" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Set Priority (S/A/B/C)</p>
                  <p className="text-gray-500 text-xs">S-Rank = Critical, C-Rank = Low. Higher ranks give more rewards!</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                  <ChevronUp size={16} className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Reorder Quests</p>
                  <p className="text-gray-500 text-xs">Use the up/down arrows to change quest order and swap priorities.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-cyber-red" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Delete Quests</p>
                  <p className="text-gray-500 text-xs">Tap the trash icon on any quest to remove it (no penalty).</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissIntro}
              className="w-full py-3 rounded-lg bg-cyber-cyan text-black font-bold btn-press hover:shadow-neon-cyan transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="flex-shrink-0 px-4 bg-black">
        <div className="flex items-center justify-between py-4">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="text-cyber-cyan" /> Quests
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLog(!showLog)}
              className={`px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                showLog ? 'bg-cyber-cyan text-black' : 'bg-cyber-gray text-gray-400'
              }`}
            >
              <Scroll size={16} /> Log
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press hover:shadow-neon-cyan transition-all"
            >
              <Plus size={16} /> New
            </button>
          </div>
        </div>

        {/* Threat Level Legend */}
        {!showLog && activeQuests.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {QUEST_RANKS.map(rank => {
              const count = activeQuests.filter(q => q.rank === rank.id).length;
              return (
                <div
                  key={rank.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap"
                  style={{ backgroundColor: rank.bgColor, color: rank.color, opacity: count > 0 ? 1 : 0.4 }}
                >
                  {getRankIcon(rank.id)}
                  <span>{rank.id}</span>
                  {count > 0 && <span className="opacity-70">({count})</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quest List or Log */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {showLog ? (
          // Quest Log
          <div className="space-y-3">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Quest Log</h3>
            {state.questLog.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed quests yet.</p>
            ) : (
              // Deduplicate - only remove true duplicates (same ID + same completedAt)
              [...new Map(state.questLog.map(q => [`${q.id}-${q.completedAt}`, q])).values()].slice().reverse().map((quest, i) => {
                return (
                  <div
                    key={`${quest.id}-${quest.completedAt}`}
                    className="bg-cyber-dark rounded-lg px-3 py-2 animate-fadeIn flex items-center gap-3"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Status indicator */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      quest.completed ? 'bg-cyber-green' : 'bg-cyber-red'
                    }`} />

                    {/* Due date */}
                    {quest.dueDate && (
                      <span className="text-gray-500 text-xs flex-shrink-0 w-12">
                        {new Date(quest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}

                    {/* Title */}
                    <span className="text-white text-sm flex-1 truncate">{quest.name}</span>

                    {/* Status badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${
                      quest.completed
                        ? 'bg-cyber-green/20 text-cyber-green'
                        : quest.failReason === 'overdue'
                          ? 'bg-cyber-gold/20 text-cyber-gold'
                          : 'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {quest.completed ? 'Done' : quest.failReason === 'overdue' ? 'Overdue' : 'Failed'}
                    </span>

                    {/* Undo button - only show if due date is in future or no due date */}
                    {(() => {
                      const canUndo = !quest.dueDate || new Date(quest.dueDate) >= new Date(new Date().toDateString());
                      return canUndo ? (
                        <button
                          onClick={() => onUndoQuest(quest)}
                          className="text-gray-400 hover:text-cyber-cyan p-1.5 rounded hover:bg-cyber-cyan/10 transition-colors flex-shrink-0"
                          title="Undo"
                        >
                          <Undo2 size={16} />
                        </button>
                      ) : null;
                    })()}
                  </div>
                );
              })
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
              activeQuests.map((quest, i) => {
                return (
                  <div
                    key={quest.id}
                    className="bg-gray-800/80 rounded-lg px-3 py-2.5 animate-slideUp"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Main Row */}
                    <div className="flex items-center gap-2">
                      {/* Rank Icon */}
                      <div className={`flex-shrink-0 ${quest.rank === 'S' ? 'animate-pulse' : ''}`}>
                        {getRankIcon(quest.rank)}
                      </div>

                      {/* Quest Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-white text-sm font-medium break-words">{quest.name}</span>
                          {quest.dueDate && (
                            <span className="text-gray-500 text-[10px] flex items-center gap-0.5 flex-shrink-0">
                              <Calendar size={10} />
                              {new Date(quest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {/* Rewards inline */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Zap size={10} className="text-cyber-cyan" />
                            {quest.reward}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Coins size={10} className="text-cyber-gold" />
                            {quest.goldReward}
                          </span>
                          <span className="text-gray-600">−{quest.penalty}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Compact */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => onCompleteQuest(quest)}
                          className="bg-cyber-green/20 text-cyber-green p-2 rounded-lg btn-press hover:bg-cyber-green/30 transition-all"
                          title="Done"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onFailQuest(quest)}
                          className="bg-cyber-red/10 text-cyber-red/60 p-2 rounded-lg btn-press hover:bg-cyber-red/20 hover:text-cyber-red transition-all"
                          title="Fail"
                        >
                          <X size={16} />
                        </button>
                        {deleteConfirm === quest.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { soundManager.click(); onDeleteQuest(quest.id); setDeleteConfirm(null); }}
                              className="text-[10px] bg-cyber-red text-white px-1.5 py-1 rounded font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => { soundManager.click(); setDeleteConfirm(null); }}
                              className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-1 rounded"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { soundManager.click(); setDeleteConfirm(quest.id); }}
                            className="text-gray-600 hover:text-cyber-red p-1.5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Quest Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Quest">
        <div className="space-y-4">
          {/* Threat Level Selector */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Threat Level</label>
            <div className="grid grid-cols-4 gap-2">
              {QUEST_RANKS.slice().reverse().map(rank => (
                <button
                  key={rank.id}
                  onClick={() => setNewQuest({ ...newQuest, rank: rank.id })}
                  className={`p-3 rounded-lg border-2 transition-all btn-press ${
                    newQuest.rank === rank.id ? 'scale-105' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    borderColor: newQuest.rank === rank.id ? rank.color : 'transparent',
                    backgroundColor: rank.bgColor
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    {getRankIcon(rank.id)}
                    <span className="text-[10px] text-gray-400">{rank.multiplier}x</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">
              {getQuestRankInfo(newQuest.rank).description}
            </p>
          </div>

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
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Due Date (optional)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setNewQuest({ ...newQuest, dueDate: tomorrow.toISOString().split('T')[0] });
                }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  newQuest.dueDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-cyber-cyan text-black'
                    : 'bg-cyber-gray text-gray-400 hover:text-white'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  newQuest.dueDate && newQuest.dueDate !== new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-cyber-cyan text-black'
                    : 'bg-cyber-gray text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={14} />
                {newQuest.dueDate && newQuest.dueDate !== new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  ? new Date(newQuest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Select'}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={newQuest.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewQuest({ ...newQuest, dueDate: e.target.value })}
                className="sr-only"
              />
            </div>
            {newQuest.dueDate && (
              <button
                type="button"
                onClick={() => setNewQuest({ ...newQuest, dueDate: '' })}
                className="text-gray-500 text-xs mt-2 hover:text-gray-400"
              >
                Clear date
              </button>
            )}
          </div>

          {/* Final Rewards Preview */}
          <div className="bg-cyber-gray/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Rewards (with {getQuestRankInfo(newQuest.rank).multiplier}x multiplier)</p>
            <div className="flex items-center justify-around text-sm">
              <span className="text-cyber-cyan font-bold">
                {Math.round(50 * getQuestRankInfo(newQuest.rank).multiplier)} XP
              </span>
              <span className="text-cyber-gold font-bold">
                {Math.round(50 * getQuestRankInfo(newQuest.rank).multiplier)} Gold
              </span>
              <span className="text-cyber-red font-bold">
                -{Math.round(25 * getQuestRankInfo(newQuest.rank).multiplier)} Fail
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                soundManager.click();
                setShowAddModal(false);
              }}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddQuest}
              disabled={!newQuest.name.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newQuest.name.trim()
                  ? 'bg-cyber-cyan text-black hover:shadow-neon-cyan'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==================== SETTINGS ====================
const Settings = ({ state, onResetSystem, onImportData, showNotification, tabOrder, onUpdateTabOrder, soundEnabled, onToggleSound, hapticsEnabled, onToggleHaptics }) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showTabOrderModal, setShowTabOrderModal] = useState(false);
  const [tempTabOrder, setTempTabOrder] = useState(tabOrder || ['home', 'habits', 'quests', 'shop', 'awakening']);
  const fileInputRef = useRef(null);

  // Daily quote - pick one based on the day
  const todayQuote = FALLBACK_QUOTES[new Date().getDate() % FALLBACK_QUOTES.length];

  const moveTab = (index, direction) => {
    const newOrder = [...tempTabOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setTempTabOrder(newOrder);
    soundManager.click();
  };

  const saveTabOrder = () => {
    onUpdateTabOrder(tempTabOrder);
    setShowTabOrderModal(false);
    showNotification('Tab order saved!', 'success');
  };

  const handleReset = () => {
    if (resetConfirm === 'I give up!') {
      soundManager.penalty();
      onResetSystem();
    } else {
      soundManager.error();
      showNotification('Type exactly "I give up!" to reset', 'error');
    }
  };

  const handleExport = () => {
    soundManager.click();
    try {
      // Create export object with all app data
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        appName: 'THE SYSTEM',
        data: {
          ...state,
          settings: {
            tabOrder: tabOrder,
            soundEnabled: localStorage.getItem('theSystemSound') !== 'false'
          }
        }
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `the-system-backup-${getToday()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      soundManager.success();
      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      soundManager.error();
      showNotification('Export failed!', 'error');
    }
  };

  const handleImport = () => {
    soundManager.click();
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate the imported data
        if (!importedData.appName || importedData.appName !== 'THE SYSTEM') {
          throw new Error('Invalid backup file');
        }

        if (!importedData.data) {
          throw new Error('No data found in backup');
        }

        // Extract settings if present
        const settings = importedData.data.settings;
        if (settings?.tabOrder) {
          onUpdateTabOrder(settings.tabOrder);
        }
        if (settings?.soundEnabled !== undefined) {
          localStorage.setItem('theSystemSound', settings.soundEnabled.toString());
        }

        // Remove settings from data before importing state
        const { settings: _, ...stateData } = importedData.data;

        // Import the state data
        onImportData(stateData);

        soundManager.success();
        showNotification('Data imported successfully!', 'success');
      } catch (error) {
        console.error('Import failed:', error);
        soundManager.error();
        showNotification('Invalid backup file!', 'error');
      }
    };

    reader.onerror = () => {
      soundManager.error();
      showNotification('Failed to read file!', 'error');
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="h-full overflow-y-auto pb-4 px-4">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="py-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-cyber-cyan" /> Settings
        </h2>
      </div>

      {/* Daily Reminder Quote */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-4 border-l-2 border-cyber-purple">
        <p className="text-gray-300 text-sm italic leading-relaxed">"{todayQuote.q}"</p>
        <p className="text-cyber-purple text-xs mt-2 text-right">— {todayQuote.a}</p>
      </div>

      {/* Preferences Section */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Preferences</p>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${soundEnabled ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'}`}>
              {soundEnabled ? <Volume2 size={16} className="text-cyber-cyan" /> : <VolumeX size={16} className="text-gray-500" />}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Sound Effects</p>
              <p className="text-gray-500 text-xs">UI sounds and feedback</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyber-cyan' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Vibration Toggle */}
        <button
          onClick={onToggleHaptics}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hapticsEnabled ? 'bg-cyber-purple/20' : 'bg-gray-700/50'}`}>
              <Smartphone size={16} className={hapticsEnabled ? 'text-cyber-purple' : 'text-gray-500'} />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Vibration</p>
              <p className="text-gray-500 text-xs">Haptic feedback on actions</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${hapticsEnabled ? 'bg-cyber-purple' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hapticsEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Tab Order */}
        <button
          onClick={() => {
            soundManager.click();
            setTempTabOrder(tabOrder || ['home', 'habits', 'quests', 'shop', 'awakening']);
            setShowTabOrderModal(true);
          }}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-gold/20 flex items-center justify-center">
              <GripVertical size={16} className="text-cyber-gold" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Tab Order</p>
              <p className="text-gray-500 text-xs">Customize navigation order</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Data Management Section */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Data</p>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-green/20 flex items-center justify-center">
              <Download size={16} className="text-cyber-green" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Export Data</p>
              <p className="text-gray-500 text-xs">Download your progress as JSON</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>

        {/* Import JSON */}
        <button
          onClick={handleImport}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
              <Download size={16} className="text-cyber-purple rotate-180" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Import Data</p>
              <p className="text-gray-500 text-xs">Restore from JSON backup</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Danger Zone */}
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Danger Zone</p>
        <button
          onClick={() => {
            soundManager.click();
            setShowResetWarning(true);
          }}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-red/10 transition-all border border-transparent hover:border-cyber-red/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center">
              <RefreshCw size={16} className="text-cyber-red" />
            </div>
            <div className="text-left">
              <p className="text-cyber-red text-sm font-medium">Reset System</p>
              <p className="text-gray-500 text-xs">Delete all progress permanently</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Credits */}
      <div className="mt-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">About</p>
        <a
          href="https://www.linkedin.com/in/yasserarafat007"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => soundManager.click()}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <img
              src="https://media.licdn.com/dms/image/v2/D4D03AQEaCeHaN-cHzQ/profile-displayphoto-crop_800_800/B4DZjbqFDCGgAI-/0/1756031899355?e=1769644800&v=beta&t=SO7Zsqb1K4h9U1g55pPa4mdgjy6CACrKa9JsPnKunPk"
              alt="Yasser Arafat"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Made by Yasser Arafat</p>
              <p className="text-gray-500 text-xs">Connect on LinkedIn</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500 group-hover:text-cyber-cyan transition-colors" />
        </a>
      </div>

      {/* Reset Confirmation Modal - Compact */}
      {showResetWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-xs bg-cyber-dark border border-cyber-red/50 rounded-xl p-4 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-red mb-2">
              <AlertTriangle size={18} />
              <h3 className="font-display font-bold text-sm">RESET SYSTEM?</h3>
            </div>
            <p className="text-gray-400 text-xs text-center mb-3">
              All progress will be deleted permanently.
            </p>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder='Type "I give up!"'
              className="w-full bg-cyber-gray text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-cyber-red mb-3 text-center"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.click();
                  setShowResetWarning(false);
                  setResetConfirm('');
                }}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetConfirm !== 'I give up!'}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  resetConfirm === 'I give up!'
                    ? 'bg-cyber-red text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Order Modal */}
      {showTabOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-xs bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-4 animate-modalPop">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-cyber-cyan flex items-center gap-2">
                <GripVertical size={16} /> Tab Order
              </h3>
              <button
                onClick={() => {
                  soundManager.click();
                  setShowTabOrderModal(false);
                }}
                className="text-gray-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-gray-500 text-xs mb-3">Use arrows to reorder tabs</p>

            <div className="space-y-2 mb-4">
              {tempTabOrder.map((tabId, index) => {
                const tabInfo = TAB_INFO[tabId];
                const TabIcon = tabInfo?.icon || Home;
                return (
                  <div
                    key={tabId}
                    className="flex items-center gap-2 bg-cyber-gray/50 rounded-lg p-2"
                  >
                    <span className="text-gray-500 text-xs w-4">{index + 1}</span>
                    <div className="w-7 h-7 rounded bg-cyber-cyan/20 flex items-center justify-center">
                      <TabIcon size={14} className="text-cyber-cyan" />
                    </div>
                    <span className="text-white text-sm flex-1">{tabInfo?.label || tabId}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveTab(index, 'up')}
                        disabled={index === 0}
                        className={`p-1 rounded transition-all ${
                          index === 0
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10'
                        }`}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveTab(index, 'down')}
                        disabled={index === tempTabOrder.length - 1}
                        className={`p-1 rounded transition-all ${
                          index === tempTabOrder.length - 1
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10'
                        }`}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.click();
                  setShowTabOrderModal(false);
                }}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveTabOrder}
                className="flex-1 py-2 rounded-lg bg-cyber-cyan text-black text-sm font-bold btn-press hover:shadow-neon-cyan transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== HABITS & HEATMAP ====================
const Habits = ({ state, onToggleHabit, onAddHabit, onDeleteHabit, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('star');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const today = getToday();

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    onAddHabit({
      id: generateId(),
      name: newHabit,
      icon: newHabitIcon
    });
    setNewHabit('');
    setNewHabitIcon('star');
    setShowAddModal(false);
    soundManager.success();
    showNotification('Habit Added!', 'success');
  };

  const getHabitIcon = (iconName) => {
    switch (iconName) {
      case 'eye': return <Eye size={16} />;
      case 'flame': return <Flame size={16} />;
      case 'zap': return <Zap size={16} />;
      case 'scroll': return <Scroll size={16} />;
      case 'heart': return <Heart size={16} />;
      case 'target': return <Target size={16} />;
      case 'shield': return <Shield size={16} />;
      case 'user': return <User size={16} />;
      default: return <Star size={16} />;
    }
  };

  const isHabitCompletedToday = (habitId) => {
    return state.habitLog[today]?.includes(habitId);
  };

  const getStreak = (habitId) => {
    return state.habitStreaks[habitId] || 0;
  };

  // Generate compact heatmap data (last 5 weeks)
  const generateHeatmapData = () => {
    const weeks = [];
    const todayDate = new Date();

    for (let week = 4; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        // Use local date format to match habitLog keys (same as getToday())
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

  // Calculate habit stats
  const calculateStats = () => {
    const totalHabits = state.habits.length;
    const completedToday = state.habitLog[today]?.length || 0;

    // Calculate average daily completion
    const logDates = Object.keys(state.habitLog);
    let totalCompleted = 0;
    logDates.forEach(date => {
      totalCompleted += state.habitLog[date]?.length || 0;
    });
    const avgPerDay = logDates.length > 0 ? (totalCompleted / logDates.length).toFixed(1) : '0';

    // Best current streak
    const streakValues = Object.values(state.habitStreaks);
    const bestStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

    return { totalHabits, completedToday, avgPerDay, bestStreak };
  };

  const stats = calculateStats();
  const heatmapData = generateHeatmapData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header + Heatmap */}
      <div className="flex-shrink-0 px-4 bg-black">
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

        {/* Heatmap + Stats Row */}
        <div className="flex gap-3 mb-4">
          {/* Compact Heatmap - Left */}
          <div className="bg-cyber-dark rounded-xl p-3 glow-border-cyan flex-shrink-0">
            {/* Mini heatmap grid */}
            <div className="space-y-[2px]">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-[10px] h-[10px] rounded-[2px] heatmap-${day.intensity}`}
                      title={`${day.date}: ${day.count} habits`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Mini legend */}
            <div className="flex items-center gap-[2px] mt-2 justify-center">
              {[0, 2, 4, 5].map(i => (
                <div key={i} className={`w-[8px] h-[8px] rounded-[2px] heatmap-${i}`} />
              ))}
            </div>
          </div>

          {/* Stats Box - Right */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-cyan text-center">
              <p className="text-cyber-cyan font-display font-bold text-lg">
                {stats.completedToday}/{stats.totalHabits}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Today</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-gold text-center">
              <p className="text-cyber-gold font-display font-bold text-lg">
                {stats.avgPerDay}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Avg/Day</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-red text-center">
              <p className="text-orange-500 font-display font-bold text-lg flex items-center justify-center gap-1">
                <Flame size={14} /> {stats.bestStreak}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Best Streak</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-white font-display font-bold text-lg">
                {stats.totalHabits}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Habits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Habits List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-3">
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
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all btn-press flex-shrink-0 ${
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
                <div className="min-w-0 flex-1">
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
              <div className="flex items-center gap-2 flex-shrink-0">
                {streak >= 3 && (
                  <div className={`bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 flex-shrink-0 ${streak >= 7 ? 'animate-pulse' : ''}`}>
                    <Flame size={12} /> {streak}x
                  </div>
                )}
                {deleteConfirm === habit.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        soundManager.click();
                        onDeleteHabit(habit.id);
                        setDeleteConfirm(null);
                      }}
                      className="text-xs bg-cyber-red text-white px-2 py-1 rounded font-bold"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        soundManager.click();
                        setDeleteConfirm(null);
                      }}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.click();
                      setDeleteConfirm(habit.id);
                    }}
                    className="text-gray-600 hover:text-cyber-red p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
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

          {/* Icon Selector */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon.id}
                  onClick={() => {
                    soundManager.click();
                    setNewHabitIcon(icon.id);
                  }}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all btn-press ${
                    newHabitIcon === icon.id
                      ? 'bg-cyber-cyan/20 border-2 border-cyber-cyan'
                      : 'bg-cyber-gray hover:bg-cyber-gray/80 border-2 border-transparent'
                  }`}
                >
                  <span className={newHabitIcon === icon.id ? 'text-cyber-cyan' : 'text-gray-400'}>
                    {getHabitIcon(icon.id)}
                  </span>
                  <span className={`text-[9px] ${newHabitIcon === icon.id ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                    {icon.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                soundManager.click();
                setShowAddModal(false);
                setNewHabitIcon('star');
              }}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHabit}
              disabled={!newHabit.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newHabit.trim()
                  ? 'bg-cyber-cyan text-black hover:shadow-neon-cyan'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('shopIntroSeen');
  });

  const handleDismissIntro = () => {
    soundManager.click();
    setShowIntro(false);
    localStorage.setItem('shopIntroSeen', 'true');
  };

  // Group rewards by tier
  const groupedRewards = REWARD_TIERS.map(tier => ({
    ...tier,
    rewards: state.rewards.filter(r => r.tier === tier.id)
  }));

  // Get ungrouped rewards (custom or those without tier)
  const ungroupedRewards = state.rewards.filter(r => !r.tier);

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

  const getTierIcon = (iconName) => {
    switch (iconName) {
      case 'zap': return <Zap size={16} />;
      case 'target': return <Target size={16} />;
      case 'star': return <Star size={16} />;
      case 'crown': return <Crown size={16} />;
      default: return <Gift size={16} />;
    }
  };

  const renderRewardCard = (reward, i) => (
    <div
      key={reward.id}
      className="bg-cyber-dark rounded-xl p-3 card-hover relative animate-fadeIn"
      style={{
        animationDelay: `${i * 0.05}s`,
        borderLeft: reward.tier ? `3px solid ${REWARD_TIERS.find(t => t.id === reward.tier)?.color || '#ffd700'}` : '3px solid #ffd700'
      }}
    >
      {deleteConfirm === reward.id ? (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            onClick={() => {
              soundManager.click();
              onDeleteReward(reward.id);
              setDeleteConfirm(null);
            }}
            className="text-xs bg-cyber-red text-white px-2 py-1 rounded font-bold"
          >
            Yes
          </button>
          <button
            onClick={() => {
              soundManager.click();
              setDeleteConfirm(null);
            }}
            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            soundManager.click();
            setDeleteConfirm(reward.id);
          }}
          className="absolute top-2 right-2 text-gray-600 hover:text-cyber-red p-1 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      )}
      <h4 className="font-bold text-white text-sm mb-2 pr-6">{reward.name}</h4>
      <div className="flex items-center justify-between">
        <div className="text-cyber-gold font-display font-bold text-sm flex items-center gap-1">
          <Coins size={12} /> {reward.cost}
        </div>
        <button
          onClick={() => handleBuy(reward)}
          disabled={state.player.gold < reward.cost}
          className={`px-3 py-1 rounded-lg font-bold text-xs btn-press transition-all ${
            state.player.gold >= reward.cost
              ? 'bg-cyber-gold text-black hover:shadow-neon-gold'
              : 'bg-cyber-gray text-gray-500 cursor-not-allowed'
          }`}
        >
          {state.player.gold >= reward.cost ? 'Buy' : 'Need'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      {/* Sticky Header */}
      <div className="flex-shrink-0 px-4 bg-black">
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
      </div>

      {/* First-time Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-gold/30 rounded-xl p-6 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-gold mb-4">
              <ShoppingBag size={28} />
              <h3 className="font-display font-bold text-xl">REWARD SHOP</h3>
            </div>

            <p className="text-gray-300 text-sm text-center mb-5">
              Complete quests and habits to earn Gold. Spend it on rewards you deserve!
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Swords size={16} className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Earn from Quests</p>
                  <p className="text-gray-500 text-xs">Complete quests to earn Gold rewards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Earn from Habits</p>
                  <p className="text-gray-500 text-xs">Daily habits give you +5 Gold each.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-gold/20 flex items-center justify-center flex-shrink-0">
                  <Gift size={16} className="text-cyber-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Spend Wisely</p>
                  <p className="text-gray-500 text-xs">Buy rewards you've earned. You deserve it!</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissIntro}
              className="w-full py-3 rounded-lg bg-cyber-gold text-black font-bold btn-press hover:shadow-neon-gold transition-all"
            >
              Let's Shop!
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Rewards List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Tiered Rewards */}
        {groupedRewards.map(tier => {
          if (tier.rewards.length === 0) return null;
          return (
            <div key={tier.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                >
                  {getTierIcon(tier.icon)}
                </div>
                <h3 className="font-display font-bold text-sm" style={{ color: tier.color }}>
                  {tier.name}
                </h3>
                <span className="text-gray-600 text-xs">({tier.rewards.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tier.rewards.map((reward, i) => renderRewardCard(reward, i))}
              </div>
            </div>
          );
        })}

        {/* Custom/Ungrouped Rewards */}
        {ungroupedRewards.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-cyber-cyan/20 text-cyber-cyan">
                <Sparkles size={16} />
              </div>
              <h3 className="font-display font-bold text-sm text-cyber-cyan">
                Custom Rewards
              </h3>
              <span className="text-gray-600 text-xs">({ungroupedRewards.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ungroupedRewards.map((reward, i) => renderRewardCard(reward, i))}
            </div>
          </div>
        )}
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
          <div className="flex gap-3">
            <button
              onClick={() => {
                soundManager.click();
                setShowAddModal(false);
              }}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReward}
              disabled={!newReward.name.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newReward.name.trim()
                  ? 'bg-cyber-gold text-black hover:shadow-neon-gold'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ==================== MAIN APP ====================
const App = () => {
  const [state, setState] = useState(getInitialState);
  const [activeTab, setActiveTab] = useState(() => {
    const savedTabOrder = localStorage.getItem('theSystemTabOrder');
    if (savedTabOrder) {
      try {
        const parsed = JSON.parse(savedTabOrder);
        return parsed[0] || 'home';
      } catch (e) {
        return 'home';
      }
    }
    return 'home';
  });
  const [notification, setNotification] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('theSystemSound');
    return saved !== 'false';
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const saved = localStorage.getItem('theSystemHaptics');
    return saved !== 'false';
  });

  // PWA Install Prompt States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  const previousRank = useRef(getRank(state.player.totalXp));
  const previousLevel = useRef(previousRank.current.level);

  // Update sound manager when sound enabled changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    localStorage.setItem('theSystemSound', soundEnabled.toString());
  }, [soundEnabled]);

  // Update haptics when haptics enabled changes
  useEffect(() => {
    soundManager.setHapticsEnabled(hapticsEnabled);
    localStorage.setItem('theSystemHaptics', hapticsEnabled.toString());
  }, [hapticsEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
    soundManager.click();
  };

  const toggleHaptics = () => {
    setHapticsEnabled(prev => !prev);
    soundManager.click();
  };

  // Swipe navigation
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const minSwipeDistance = 50;
  const [swipeIndicator, setSwipeIndicator] = useState(null); // 'left' | 'right' | null
  const [swipeProgress, setSwipeProgress] = useState(0); // -1 to 1, for gooey animation
  const navRef = useRef(null);

  // Customizable tab order
  const defaultTabOrder = ['home', 'habits', 'quests', 'shop', 'awakening'];
  const [customTabOrder, setCustomTabOrder] = useState(() => {
    const saved = localStorage.getItem('theSystemTabOrder');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultTabOrder;
      }
    }
    return defaultTabOrder;
  });

  const tabOrder = customTabOrder;

  const handleUpdateTabOrder = (newOrder) => {
    setCustomTabOrder(newOrder);
    localStorage.setItem('theSystemTabOrder', JSON.stringify(newOrder));
    soundManager.success();
  };

  const handleTouchStart = (e) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    touchEnd.current = { x: 0, y: 0 };
    setSwipeIndicator(null);
    setSwipeProgress(0);
  };

  const handleTouchMove = (e) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // Calculate swipe progress for gooey animation (-1 to 1)
    const screenWidth = window.innerWidth;
    const maxSwipeDistance = screenWidth * 0.3; // 30% of screen = full progress
    const normalizedProgress = Math.max(-1, Math.min(1, deltaX / maxSwipeDistance));

    // Show indicator at the slightest horizontal movement (15px threshold, 1.5:1 ratio)
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = tabOrder.indexOf(activeTab);
      if (deltaX > 0 && currentIndex < tabOrder.length - 1) {
        setSwipeIndicator('left');
        setSwipeProgress(normalizedProgress);
      } else if (deltaX < 0 && currentIndex > 0) {
        setSwipeIndicator('right');
        setSwipeProgress(normalizedProgress);
      } else {
        setSwipeIndicator(null);
        setSwipeProgress(0);
      }
    } else {
      setSwipeIndicator(null);
      setSwipeProgress(0);
    }
  };

  const handleTouchEnd = () => {
    setSwipeIndicator(null);
    setSwipeProgress(0);

    // No movement recorded
    if (touchEnd.current.x === 0 && touchEnd.current.y === 0) {
      return;
    }

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // Only register clearly horizontal swipes (2:1 ratio horizontal to vertical)
    if (Math.abs(deltaX) < minSwipeDistance || Math.abs(deltaX) < Math.abs(deltaY) * 2) {
      return;
    }

    const currentIndex = tabOrder.indexOf(activeTab);

    if (deltaX > 0) {
      // Swiped left -> go to next tab
      if (currentIndex < tabOrder.length - 1) {
        soundManager.tabSwitch();
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    } else {
      // Swiped right -> go to previous tab
      if (currentIndex > 0) {
        soundManager.tabSwitch();
        setActiveTab(tabOrder[currentIndex - 1]);
      }
    }
  };

  // PWA Install Prompt Effect - capture beforeinstallprompt
  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsPwaInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      showNotification('App installed! You now have the full experience.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Show install banner after onboarding
  useEffect(() => {
    if (state.onboarded && !isPwaInstalled) {
      const timer = setTimeout(() => setShowInstallBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.onboarded, isPwaInstalled]);

  // Handle PWA Install
  const handleInstallClick = async () => {
    soundManager.click();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        soundManager.success();
      }
      setDeferredPrompt(null);
    }

    setShowInstallBanner(false);
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('theSystem', JSON.stringify(state));
  }, [state]);

  // Check for level/rank ups (new system: level = rank)
  useEffect(() => {
    const currentRank = getRank(state.player.totalXp);
    const currentLevel = currentRank.level;

    if (currentLevel > previousLevel.current) {
      // Rank up! (level and rank are now the same)
      setCelebration({ type: 'rankUp', rank: currentRank });
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
      // Parse date strings manually to avoid timezone issues
      const [lastYear, lastMonth, lastDay] = lastLogin.split('-').map(Number);
      const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
      const lastDate = new Date(lastYear, lastMonth - 1, lastDay);
      const todayDate = new Date(todayYear, todayMonth - 1, todayDay);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        const penalty = MISSED_DAY_PENALTY * (diffDays - 1);
        setState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            totalXp: Math.max(0, prev.player.totalXp - penalty),
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

  // Check for overdue quests on app load (only once per session)
  const overdueCheckDone = useRef(false);
  useEffect(() => {
    if (!state.onboarded || overdueCheckDone.current) return;
    overdueCheckDone.current = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueQuests = state.quests.filter(quest => {
      if (!quest.dueDate) return false;
      const dueDate = new Date(quest.dueDate);
      dueDate.setHours(23, 59, 59, 999); // End of due date
      return dueDate < today;
    });

    if (overdueQuests.length > 0) {
      // Auto-fail all overdue quests
      setState(prev => {
        let newTotalXp = prev.player.totalXp;
        const failedQuests = [];

        overdueQuests.forEach(quest => {
          const doublePenalty = quest.penalty * 2;
          newTotalXp = Math.max(0, newTotalXp - doublePenalty);
          failedQuests.push({
            ...quest,
            completed: false,
            penaltyApplied: doublePenalty,
            completedAt: new Date().toISOString(),
            failReason: 'overdue'
          });
        });

        return {
          ...prev,
          player: {
            ...prev.player,
            totalXp: newTotalXp
          },
          quests: prev.quests.filter(q => !overdueQuests.find(oq => oq.id === q.id)),
          questLog: [...prev.questLog, ...failedQuests]
        };
      });

      soundManager.penalty();
      setTimeout(() => {
        setNotification({
          message: `${overdueQuests.length} quest${overdueQuests.length > 1 ? 's' : ''} overdue!`,
          type: 'error'
        });
      }, 500);
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
    // Use track rewards if available, otherwise keep defaults
    const trackRewards = playerData.rewards && playerData.rewards.length > 0
      ? playerData.rewards
      : [
          { id: '1', name: '1 Episode Netflix', cost: 200, icon: 'gift' },
          { id: '2', name: 'Snack Break', cost: 100, icon: 'gift' },
          { id: '3', name: '30min Gaming', cost: 300, icon: 'gift' }
        ];

    setState(prev => ({
      ...prev,
      onboarded: true,
      player: {
        ...prev.player,
        name: playerData.name,
        track: playerData.track,
        lastLoginDate: getToday()
      },
      habits: playerData.habits || [],
      quests: playerData.quests || [],
      rewards: trackRewards,
      vision: playerData.vision || { fuel: '', fear: '' }
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

  const handleFailQuest = (quest, reason = 'manual') => {
    soundManager.penalty();
    const doublePenalty = quest.penalty * 2;
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: Math.max(0, prev.player.totalXp - doublePenalty)
      },
      quests: prev.quests.filter(q => q.id !== quest.id),
      questLog: [...prev.questLog, {
        ...quest,
        completed: false,
        penaltyApplied: doublePenalty,
        completedAt: new Date().toISOString(),
        failReason: reason
      }]
    }));
    if (reason === 'overdue') {
      showNotification(`Quest Overdue! -${doublePenalty} XP`, 'error');
    } else {
      showNotification(`Quest Failed! -${doublePenalty} XP`, 'error');
    }
  };

  const handleDeleteQuest = (questId) => {
    setState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId)
    }));
  };

  const handleUndoQuest = (quest) => {
    soundManager.click();
    setState(prev => {
      // Remove from questLog
      const newQuestLog = prev.questLog.filter(q => q.id !== quest.id);

      // Restore the quest (remove log-specific fields)
      const restoredQuest = {
        id: quest.id,
        name: quest.name,
        rank: quest.rank,
        reward: quest.reward,
        goldReward: quest.goldReward,
        penalty: quest.penalty,
        createdAt: quest.createdAt
      };

      // Reverse XP/gold changes
      let newTotalXp = prev.player.totalXp;
      let newGold = prev.player.gold;
      let newTotalQuestsCompleted = prev.player.totalQuestsCompleted;

      if (quest.completed) {
        // Was completed - reverse the rewards
        newTotalXp = Math.max(0, newTotalXp - quest.reward);
        newGold = Math.max(0, newGold - quest.goldReward);
        newTotalQuestsCompleted = Math.max(0, newTotalQuestsCompleted - 1);
      } else {
        // Was failed - restore the penalty
        newTotalXp = newTotalXp + quest.penaltyApplied;
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          totalXp: newTotalXp,
          gold: newGold,
          totalQuestsCompleted: newTotalQuestsCompleted
        },
        quests: [...prev.quests, restoredQuest],
        questLog: newQuestLog
      };
    });
    showNotification('Quest restored!', 'success');
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

  const handleResetSystem = () => {
    // Clear all localStorage data
    localStorage.removeItem('theSystem');
    localStorage.removeItem('theSystemSound');

    // Reset state to initial
    setState(getInitialState());
    setActiveTab('home');
    showNotification('System has been reset. Start fresh.', 'error');
  };

  const handleImportData = (importedState) => {
    // Merge imported data with current state structure to handle any missing fields
    setState(prev => ({
      ...prev,
      ...importedState,
      onboarded: importedState.onboarded ?? prev.onboarded,
      player: {
        ...prev.player,
        ...importedState.player
      },
      quests: importedState.quests || [],
      questLog: importedState.questLog || [],
      habits: importedState.habits || [],
      habitLog: importedState.habitLog || {},
      habitStreaks: importedState.habitStreaks || {},
      vision: {
        ...prev.vision,
        ...importedState.vision
      },
      rewards: importedState.rewards || []
    }));
  };

  const handleCloseCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const allTabs = {
    home: { id: 'home', icon: Eye, label: 'Reflect' },
    habits: { id: 'habits', icon: Flame, label: 'Habits' },
    quests: { id: 'quests', icon: Swords, label: 'Quests' },
    shop: { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    awakening: { id: 'awakening', icon: Shield, label: 'Settings' }
  };

  const tabs = tabOrder.map(id => allTabs[id]);

  // Show onboarding if not completed
  if (!state.onboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="w-full min-w-0 bg-black flex flex-col max-w-[500px] mx-auto relative" style={{ height: '100dvh' }}>
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

      {/* PWA Install Banner */}
      {showInstallBanner && !isPwaInstalled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-sm bg-cyber-dark border-2 border-cyber-cyan rounded-xl p-6 animate-modalPop">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-cyber-cyan/20 rounded-full flex items-center justify-center border border-cyber-cyan/50">
                <Smartphone className="w-8 h-8 text-cyber-cyan" />
              </div>
            </div>
            <h3 className="text-xl font-display font-bold text-cyber-cyan text-center mb-2">
              INSTALL THE APP
            </h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Install this app on your device for the best experience. Get offline access, faster loading, and immersive fullscreen mode.
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs mb-4 bg-yellow-400/10 rounded-lg p-2">
              <AlertTriangle size={14} />
              <span>Without installing, you may miss out on key features</span>
            </div>

            {/* Android Instructions */}
            <div className="mb-3">
              <p className="text-cyber-cyan text-xs font-bold mb-2">To install on Android:</p>
              <ol className="text-gray-400 text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Tap <strong className="text-white">⋮</strong> (menu) in Chrome</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Tap <strong className="text-white">"Add to Home screen"</strong></span>
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="mb-4">
              <p className="text-cyber-cyan text-xs font-bold mb-2">To install on iOS:</p>
              <ol className="text-gray-400 text-xs space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Tap <strong className="text-white">Share</strong> button in Safari</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-cyber-cyan/20 text-cyber-cyan flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Tap <strong className="text-white">"Add to Home Screen"</strong></span>
                </li>
              </ol>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 rounded-lg bg-cyber-cyan text-black font-bold transition-all hover:bg-cyan-400 btn-press"
            >
              {deferredPrompt ? 'INSTALL' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Swipe Indicator - Edge Glow + Animated Arrows */}
      {swipeIndicator && (
        <>
          {/* Edge Glow Effect */}
          <div
            className="fixed inset-y-0 w-24 pointer-events-none z-30 transition-opacity"
            style={{
              [swipeIndicator === 'left' ? 'right' : 'left']: 0,
              background: `linear-gradient(${swipeIndicator === 'left' ? 'to left' : 'to right'}, rgba(0,255,255,${Math.abs(swipeProgress) * 0.4}) 0%, transparent 100%)`,
              boxShadow: `${swipeIndicator === 'left' ? '-' : ''}20px 0 60px rgba(0,255,255,${Math.abs(swipeProgress) * 0.6})`
            }}
          />

          {/* Animated Arrows on Edge */}
          <div
            className="fixed inset-y-0 flex flex-col items-center justify-center pointer-events-none z-40"
            style={{
              [swipeIndicator === 'left' ? 'right' : 'left']: '8px',
              opacity: Math.min(1, Math.abs(swipeProgress) * 2)
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              >
                {swipeIndicator === 'left' ? (
                  <ChevronRight
                    className="w-8 h-8 text-cyber-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    style={{ filter: `drop-shadow(0 0 ${10 + Math.abs(swipeProgress) * 15}px rgba(0,255,255,0.9))` }}
                  />
                ) : (
                  <ChevronLeft
                    className="w-8 h-8 text-cyber-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    style={{ filter: `drop-shadow(0 0 ${10 + Math.abs(swipeProgress) * 15}px rgba(0,255,255,0.9))` }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Center Label */}
          <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
            <div
              className="px-6 py-3 rounded-full bg-black/80 border-2 border-cyber-cyan"
              style={{
                boxShadow: `0 0 ${20 + Math.abs(swipeProgress) * 30}px rgba(0,255,255,0.5)`,
                transform: `scale(${0.8 + Math.abs(swipeProgress) * 0.3})`,
                opacity: Math.min(1, Math.abs(swipeProgress) * 1.5)
              }}
            >
              <span className="text-cyber-cyan font-display text-lg font-bold tracking-wider">
                {swipeIndicator === 'left'
                  ? tabOrder[tabOrder.indexOf(activeTab) + 1]?.toUpperCase()
                  : tabOrder[tabOrder.indexOf(activeTab) - 1]?.toUpperCase()}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className="flex-1 min-h-0 overflow-hidden relative"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === 'home' && (
          <Dashboard
            state={state}
            onLoginReward={handleLoginReward}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'quests' && (
          <Quests
            state={state}
            onAddQuest={handleAddQuest}
            onCompleteQuest={handleCompleteQuest}
            onFailQuest={handleFailQuest}
            onDeleteQuest={handleDeleteQuest}
            onUndoQuest={handleUndoQuest}
            showNotification={showNotification}
          />
        )}
        {activeTab === 'awakening' && (
          <Settings
            state={state}
            onResetSystem={handleResetSystem}
            onImportData={handleImportData}
            showNotification={showNotification}
            tabOrder={customTabOrder}
            onUpdateTabOrder={handleUpdateTabOrder}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={toggleHaptics}
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
      <nav ref={navRef} className="bg-cyber-dark border-t border-cyber-cyan/20 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around relative">
          {/* Gooey Indicator */}
          {(() => {
            const activeIndex = tabOrder.indexOf(activeTab);
            const tabWidth = 100 / tabs.length;
            const basePosition = activeIndex * tabWidth + tabWidth / 2;

            // Calculate stretch based on swipe progress
            const stretchAmount = Math.abs(swipeProgress) * 30; // Max 30% stretch
            const moveAmount = swipeProgress * (tabWidth * 0.6); // Move towards target

            // Determine stretch direction
            const isStretchingRight = swipeProgress > 0;
            const isStretchingLeft = swipeProgress < 0;

            return (
              <div
                className="absolute top-0 h-full pointer-events-none"
                style={{
                  left: `${basePosition}%`,
                  transform: `translateX(-50%)`,
                  width: `${tabWidth}%`,
                  transition: swipeProgress === 0 ? 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                }}
              >
                {/* Main gooey blob */}
                <div
                  className="absolute bottom-1 left-1/2 h-1 bg-cyber-cyan rounded-full"
                  style={{
                    width: `${24 + stretchAmount}px`,
                    transform: `translateX(calc(-50% + ${moveAmount}%))`,
                    boxShadow: '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.3)',
                    borderRadius: isStretchingRight
                      ? '4px 12px 12px 4px'
                      : isStretchingLeft
                        ? '12px 4px 4px 12px'
                        : '6px',
                    transition: swipeProgress === 0 ? 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                  }}
                />
                {/* Trailing gooey tail */}
                {Math.abs(swipeProgress) > 0.1 && (
                  <div
                    className="absolute bottom-1 left-1/2 h-1 bg-cyber-cyan/40 rounded-full"
                    style={{
                      width: `${stretchAmount * 0.8}px`,
                      transform: `translateX(calc(-50% ${isStretchingRight ? '-' : '+'} ${12 + stretchAmount/3}px))`,
                      opacity: Math.abs(swipeProgress) * 0.6,
                      transition: 'opacity 0.1s'
                    }}
                  />
                )}
              </div>
            );
          })()}

          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const activeIndex = tabOrder.indexOf(activeTab);

            // Calculate if this tab is the target of the swipe
            const isTargetTab = (swipeProgress > 0 && index === activeIndex + 1) ||
                               (swipeProgress < 0 && index === activeIndex - 1);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab !== tab.id) {
                    soundManager.tabSwitch();
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all btn-press relative z-10 ${
                  isActive
                    ? 'text-cyber-cyan'
                    : isTargetTab && Math.abs(swipeProgress) > 0.2
                      ? 'text-cyber-cyan/60'
                      : 'text-gray-500 hover:text-gray-400'
                }`}
                style={{
                  transform: isTargetTab ? `scale(${1 + Math.abs(swipeProgress) * 0.1})` : 'scale(1)',
                  transition: 'transform 0.1s ease-out, color 0.2s'
                }}
              >
                <Icon
                  size={20}
                  className={isActive ? 'animate-pulse' : ''}
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.8))' : 'none'
                  }}
                />
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
