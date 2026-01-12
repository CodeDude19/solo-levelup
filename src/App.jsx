import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw
} from 'lucide-react';

// ==================== CONSTANTS ====================
const RANKS = [
  { name: 'E-Rank', minLevel: 1, color: '#808080' },
  { name: 'D-Rank', minLevel: 5, color: '#00ff88' },
  { name: 'C-Rank', minLevel: 10, color: '#00ffff' },
  { name: 'B-Rank', minLevel: 20, color: '#9d4edd' },
  { name: 'A-Rank', minLevel: 35, color: '#ffd700' },
  { name: 'S-Rank', minLevel: 50, color: '#ff6600' },
  { name: 'National', minLevel: 70, color: '#ff3333' },
  { name: 'Monarch', minLevel: 100, color: '#ffffff' }
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
    player: {
      totalXp: 0,
      gold: 100,
      health: MAX_HEALTH,
      lastLoginDate: null,
      checkedInToday: false,
      createdAt: getToday()
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
    <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg border ${bgColor} animate-slideUp`}>
      <p className={`text-center font-bold ${textColor}`}>{message}</p>
    </div>
  );
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-6 animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-display font-bold text-cyber-cyan mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// ==================== PLAYER DASHBOARD ====================
const Dashboard = ({ state, onLoginReward, showNotification }) => {
  const { player, quests, boss } = state;
  const level = calculateLevel(player.totalXp);
  const xpProgress = calculateXpProgress(player.totalXp);
  const rank = getRank(level);
  const activeQuests = quests.filter(q => !q.completed && !q.failed);

  const handleCheckIn = () => {
    if (!player.checkedInToday) {
      onLoginReward();
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4 px-4">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="font-display text-3xl font-black gradient-text tracking-wider mb-1">
          THE SYSTEM
        </h1>
        <p className="text-gray-500 text-xs tracking-widest">ARISE</p>
      </div>

      {/* Player Card */}
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-cyan mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Current Rank</p>
            <h2
              className="font-display text-2xl font-bold"
              style={{ color: rank.color }}
            >
              {rank.name}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Level</p>
            <p className="font-display text-3xl font-black text-white">{level}</p>
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
          <div className="h-3 bg-cyber-gray rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-xp transition-all duration-500 rounded-full"
              style={{ width: `${(xpProgress / XP_PER_LEVEL) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyber-gray/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-cyber-gold mb-1">
              <Coins size={16} />
              <span className="font-display font-bold text-lg">{player.gold}</span>
            </div>
            <p className="text-gray-500 text-xs">Gold</p>
          </div>
          <div className="bg-cyber-gray/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-cyber-red mb-1">
              <Heart size={16} />
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
        className={`w-full py-4 rounded-xl font-bold mb-4 transition-all btn-press ${
          player.checkedInToday
            ? 'bg-cyber-gray text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyber-cyan to-cyber-green text-black animate-pulse-glow'
        }`}
      >
        {player.checkedInToday ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={20} /> CHECKED IN TODAY
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Calendar size={20} /> DAILY CHECK-IN (+{DAILY_LOGIN_XP} XP)
          </span>
        )}
      </button>

      {/* Boss Countdown */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-red mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyber-red/20 flex items-center justify-center">
              <Skull className="text-cyber-red" size={24} />
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
            {activeQuests.slice(0, 3).map(quest => (
              <div key={quest.id} className="flex items-center justify-between py-2 border-b border-cyber-gray/50 last:border-0">
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
            className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press"
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
              state.questLog.slice().reverse().map(quest => (
                <div
                  key={quest.id}
                  className={`bg-cyber-dark rounded-lg p-4 border ${
                    quest.completed ? 'border-cyber-green/30' : 'border-cyber-red/30'
                  }`}
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
                <Swords className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No active quests.</p>
                <p className="text-gray-600 text-sm">Create a quest to begin your journey.</p>
              </div>
            ) : (
              activeQuests.map(quest => (
                <div key={quest.id} className="bg-cyber-dark rounded-xl p-4 glow-border-cyan card-hover">
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
                      className="text-gray-600 hover:text-cyber-red p-1"
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
                      className="bg-cyber-green/20 text-cyber-green py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-green/30"
                    >
                      <Check size={14} /> Done
                    </button>
                    <button
                      onClick={() => onSkipQuest(quest)}
                      className="bg-cyber-gold/20 text-cyber-gold py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-gold/30"
                    >
                      <SkipForward size={14} /> Skip
                    </button>
                    <button
                      onClick={() => onFailQuest(quest)}
                      className="bg-cyber-red/20 text-cyber-red py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 btn-press hover:bg-cyber-red/30"
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
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan"
              placeholder="Enter quest name..."
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Time Block (optional)</label>
            <input
              type="text"
              value={newQuest.timeBlock}
              onChange={e => setNewQuest({ ...newQuest, timeBlock: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan"
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
            className="w-full bg-cyber-cyan text-black py-3 rounded-lg font-bold btn-press"
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
          <Eye className="text-cyber-purple" /> AWAKENING
        </h2>
        <p className="text-gray-500 text-sm">Remember why you fight.</p>
      </div>

      {/* The Fuel - Vision */}
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-cyan mb-4">
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
              className="text-cyber-green p-2"
            >
              <Save size={20} />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing('fuel');
                setTempVision({ ...state.vision });
              }}
              className="text-gray-400 p-2"
            >
              <Edit3 size={20} />
            </button>
          )}
        </div>
        {editing === 'fuel' ? (
          <textarea
            value={tempVision.fuel}
            onChange={e => setTempVision({ ...tempVision, fuel: e.target.value })}
            className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan resize-none h-32"
            placeholder="Describe your ideal self... What does your future look like? What kind of person are you becoming?"
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
      <div className="bg-cyber-dark rounded-xl p-5 glow-border-red mb-4">
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
              className="text-cyber-green p-2"
            >
              <Save size={20} />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditing('fear');
                setTempVision({ ...state.vision });
              }}
              className="text-gray-400 p-2"
            >
              <Edit3 size={20} />
            </button>
          )}
        </div>
        {editing === 'fear' ? (
          <textarea
            value={tempVision.fear}
            onChange={e => setTempVision({ ...tempVision, fear: e.target.value })}
            className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-red resize-none h-32"
            placeholder="What does your life look like if you give up? What are the consequences of staying undisciplined?"
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
    const today = new Date();

    for (let week = 7; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
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
          <Flame className="text-cyber-gold" /> Habits
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Daily Habits */}
      <div className="space-y-3 mb-6">
        {state.habits.map(habit => (
          <div
            key={habit.id}
            className={`bg-cyber-dark rounded-xl p-4 flex items-center justify-between transition-all ${
              isHabitCompletedToday(habit.id) ? 'glow-border-cyan' : 'border border-cyber-gray'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleHabit(habit.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all btn-press ${
                  isHabitCompletedToday(habit.id)
                    ? 'bg-cyber-cyan text-black'
                    : 'bg-cyber-gray text-gray-400'
                }`}
              >
                {isHabitCompletedToday(habit.id) ? <Check size={20} /> : getHabitIcon(habit.icon)}
              </button>
              <div>
                <p className={`font-medium ${isHabitCompletedToday(habit.id) ? 'text-cyber-cyan' : 'text-white'}`}>
                  {habit.name}
                </p>
                <p className="text-gray-500 text-xs">
                  {getStreak(habit.id) > 0 ? `${getStreak(habit.id)} day streak` : 'Start your streak'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStreak(habit.id) > 0 && (
                <div className="bg-cyber-gold/20 text-cyber-gold px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                  <Flame size={12} /> {getStreak(habit.id)}x
                </div>
              )}
              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="text-gray-600 hover:text-cyber-red p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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
                  className={`flex-1 aspect-square rounded-sm heatmap-${day.intensity}`}
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
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan"
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>
          <button
            onClick={handleAddHabit}
            className="w-full bg-cyber-cyan text-black py-3 rounded-lg font-bold btn-press"
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
    }, 2000);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fadeIn">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-cyber-gold/20 rounded-full flex items-center justify-center animate-levelUp">
              <Gift className="text-cyber-gold" size={48} />
            </div>
            <h3 className="font-display text-2xl font-bold text-cyber-gold mb-2">REWARD EARNED!</h3>
            <p className="text-white text-lg">{purchasedReward?.name}</p>
            <p className="text-gray-500 mt-4">Enjoy your reward!</p>
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
            <Coins size={16} /> {state.player.gold}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-cyber-cyan text-black px-3 py-2 rounded-lg font-bold flex items-center gap-1 btn-press"
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
        {state.rewards.map(reward => (
          <div key={reward.id} className="bg-cyber-dark rounded-xl p-4 glow-border-gold card-hover relative">
            <button
              onClick={() => onDeleteReward(reward.id)}
              className="absolute top-2 right-2 text-gray-600 hover:text-cyber-red p-1"
            >
              <Trash2 size={14} />
            </button>
            <div className="w-12 h-12 mx-auto mb-3 bg-cyber-gold/20 rounded-full flex items-center justify-center">
              <Gift className="text-cyber-gold" size={24} />
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
                  ? 'bg-cyber-gold text-black'
                  : 'bg-cyber-gray text-gray-500 cursor-not-allowed'
              }`}
            >
              {state.player.gold >= reward.cost ? 'Buy' : 'Need More Gold'}
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
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan"
              placeholder="e.g., Watch a movie"
            />
          </div>
          <div>
            <label className="text-cyber-gold text-xs uppercase tracking-wider block mb-1">Cost (Gold)</label>
            <input
              type="number"
              value={newReward.cost}
              onChange={e => setNewReward({ ...newReward, cost: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan"
            />
          </div>
          <button
            onClick={handleAddReward}
            className="w-full bg-cyber-gold text-black py-3 rounded-lg font-bold btn-press"
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

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('theSystem', JSON.stringify(state));
  }, [state]);

  // Check login status on mount
  useEffect(() => {
    const today = getToday();
    const lastLogin = state.player.lastLoginDate;

    if (lastLogin && lastLogin !== today) {
      // Check if day was missed
      const lastDate = new Date(lastLogin);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        // Missed days penalty
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
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const handleLoginReward = () => {
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
    showNotification(`+${DAILY_LOGIN_XP} XP Daily Bonus!`, 'success');
  };

  const handleAddQuest = (quest) => {
    setState(prev => ({
      ...prev,
      quests: [...prev.quests, quest]
    }));
  };

  const handleCompleteQuest = (quest) => {
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        totalXp: prev.player.totalXp + quest.reward,
        gold: prev.player.gold + quest.goldReward
      },
      quests: prev.quests.filter(q => q.id !== quest.id),
      questLog: [...prev.questLog, { ...quest, completed: true, completedAt: new Date().toISOString() }]
    }));
    showNotification(`Quest Complete! +${quest.reward} XP +${quest.goldReward} Gold`, 'gold');
  };

  const handleSkipQuest = (quest) => {
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

    if (todayHabits.includes(habitId)) {
      // Remove habit
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
      const currentStreak = state.habitStreaks[habitId] || 0;
      setState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          totalXp: prev.player.totalXp + 10 * (currentStreak + 1),
          gold: prev.player.gold + 5
        },
        habitLog: {
          ...prev.habitLog,
          [today]: [...todayHabits, habitId]
        },
        habitStreaks: {
          ...prev.habitStreaks,
          [habitId]: currentStreak + 1
        }
      }));
      showNotification(`+${10 * (currentStreak + 1)} XP (${currentStreak + 1}x streak!)`, 'success');
    }
  };

  const handleAddHabit = (habit) => {
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
    setState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        gold: prev.player.gold - reward.cost
      }
    }));
  };

  const handleAddReward = (reward) => {
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

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'quests', icon: Swords, label: 'Quests' },
    { id: 'awakening', icon: Eye, label: 'Vision' },
    { id: 'habits', icon: Flame, label: 'Habits' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' }
  ];

  return (
    <div className="h-screen w-screen bg-black flex flex-col max-w-[430px] mx-auto relative overflow-hidden">
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
                onClick={() => setActiveTab(tab.id)}
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
