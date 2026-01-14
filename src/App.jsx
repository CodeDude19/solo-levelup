import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Swords,
  Eye,
  Flame,
  ShoppingBag,
  AlertTriangle,
  Shield,
  Smartphone
} from 'lucide-react';

// Core constants and configuration
import { DAILY_LOGIN_XP, MISSED_DAY_PENALTY } from './core/constants';
import { getInitialState } from './core/state';
import {
  addQuest,
  completeQuest,
  failQuest,
  deleteQuest,
  undoQuest,
  addHabit,
  deleteHabit,
  toggleHabit,
  addReward,
  deleteReward,
  buyReward,
  claimLoginReward
} from './core/reducers';

// Utilities
import { getToday } from './utils/formatters';
import { getRank } from './utils/helpers';

// Sound system
import soundManager from './core/SoundManager';

// Custom Hooks
import useSwipeNavigation from './hooks/useSwipeNavigation';
import usePWAInstall from './hooks/usePWAInstall';
import useCelebrations from './hooks/useCelebrations';

// UI Components
import FloatingText from './components/ui/FloatingText';
import Notification from './components/ui/Notification';

// Navigation Components
import SwipeIndicator from './components/navigation/SwipeIndicator';
import BottomNav from './components/navigation/BottomNav';

// Celebration Components
import LevelUpCelebration from './components/celebrations/LevelUpCelebration';
import RankUpCelebration from './components/celebrations/RankUpCelebration';
import StreakCelebration from './components/celebrations/StreakCelebration';
import QuestCompleteCelebration from './components/celebrations/QuestCompleteCelebration';

// Onboarding Components
import Onboarding from './components/onboarding/Onboarding';

// Page Components
import Dashboard from './components/pages/Dashboard';
import Quests from './components/pages/Quests';
import Settings from './components/pages/Settings';
import Habits from './components/pages/Habits';
import Shop from './components/pages/Shop';

// ==================== MAIN APP ====================
const App = () => {
  // Core state
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

  // Sound/haptics settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('theSystemSound');
    return saved !== 'false';
  });
  const [hapticsEnabled, setHapticsEnabled] = useState(() => {
    const saved = localStorage.getItem('theSystemHaptics');
    return saved !== 'false';
  });
  const [volumeLevel, setVolumeLevel] = useState(() => {
    const saved = localStorage.getItem('theSystemVolumeLevel');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [vibrationStrength, setVibrationStrength] = useState(() => {
    const saved = localStorage.getItem('theSystemVibrationStrength');
    return saved ? parseInt(saved, 10) : 2;
  });

  // Tab order
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

  // Refs
  const navRef = useRef(null);
  const previousRank = useRef(getRank(state.player.totalXp));
  const previousLevel = useRef(previousRank.current.level);
  const overdueCheckDone = useRef(false);

  // Custom hooks
  const { swipeIndicator, swipeProgress, handlers: swipeHandlers } = useSwipeNavigation(activeTab, tabOrder, setActiveTab);
  const { celebration, setCelebration, floatingTexts, removeFloatingText, handleCloseCelebration } = useCelebrations();

  // Notification helper (defined before PWA hook that uses it)
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const { showInstallBanner, isPwaInstalled, handleInstallClick } = usePWAInstall(state.onboarded, showNotification);

  // Sound/haptics effects
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    localStorage.setItem('theSystemSound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    soundManager.setHapticsEnabled(hapticsEnabled);
    localStorage.setItem('theSystemHaptics', hapticsEnabled.toString());
  }, [hapticsEnabled]);

  useEffect(() => {
    soundManager.setVolumeLevel(volumeLevel);
    localStorage.setItem('theSystemVolumeLevel', volumeLevel.toString());
  }, [volumeLevel]);

  useEffect(() => {
    soundManager.setVibrationStrength(vibrationStrength);
    localStorage.setItem('theSystemVibrationStrength', vibrationStrength.toString());
  }, [vibrationStrength]);

  const handleAudioHapticsChange = (settings) => {
    if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
    if (settings.hapticsEnabled !== undefined) setHapticsEnabled(settings.hapticsEnabled);
    if (settings.volumeLevel !== undefined) setVolumeLevel(settings.volumeLevel);
    if (settings.vibrationStrength !== undefined) setVibrationStrength(settings.vibrationStrength);
  };

  const handleUpdateTabOrder = (newOrder) => {
    setCustomTabOrder(newOrder);
    localStorage.setItem('theSystemTabOrder', JSON.stringify(newOrder));
    soundManager.success();
  };

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('theSystem', JSON.stringify(state));
  }, [state]);

  // Check for level/rank ups
  useEffect(() => {
    const currentRank = getRank(state.player.totalXp);
    const currentLevel = currentRank.level;

    if (currentLevel > previousLevel.current) {
      setCelebration({ type: 'rankUp', rank: currentRank });
    }

    previousLevel.current = currentLevel;
    previousRank.current = currentRank;
  }, [state.player.totalXp, setCelebration]);

  // Check login status on mount
  useEffect(() => {
    if (!state.onboarded) return;

    const today = getToday();
    const lastLogin = state.player.lastLoginDate;

    if (lastLogin && lastLogin !== today) {
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
  }, [state.onboarded, showNotification]);

  // Check for overdue quests on app load
  useEffect(() => {
    if (!state.onboarded || overdueCheckDone.current) return;
    overdueCheckDone.current = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueQuests = state.quests.filter(quest => {
      if (!quest.dueDate) return false;
      const dueDate = new Date(quest.dueDate);
      dueDate.setHours(23, 59, 59, 999);
      return dueDate < today;
    });

    if (overdueQuests.length > 0) {
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
          player: { ...prev.player, totalXp: newTotalXp },
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

  // ==================== HANDLERS ====================

  const handleOnboardingComplete = (playerData) => {
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
    setState(prev => claimLoginReward(prev, DAILY_LOGIN_XP));
  };

  const handleAddQuest = (quest) => {
    soundManager.success();
    setState(prev => addQuest(prev, quest));
  };

  const handleCompleteQuest = (quest) => {
    soundManager.coin();
    setCelebration({ type: 'quest', quest });
    setState(prev => completeQuest(prev, quest));
  };

  const handleFailQuest = (quest, reason = 'manual') => {
    soundManager.penalty();
    const doublePenalty = quest.penalty * 2;
    setState(prev => failQuest(prev, quest, reason));
    showNotification(reason === 'overdue' ? `Quest Overdue! -${doublePenalty} XP` : `Quest Failed! -${doublePenalty} XP`, 'error');
  };

  const handleDeleteQuest = (questId) => {
    setState(prev => deleteQuest(prev, questId));
  };

  const handleUndoQuest = (quest) => {
    soundManager.click();
    setState(prev => undoQuest(prev, quest));
    showNotification('Quest restored!', 'success');
  };

  const handleToggleHabit = (habitId) => {
    const habit = state.habits.find(h => h.id === habitId);
    const { newState, wasCompleted, xpGain, newStreak } = toggleHabit(state, habitId);

    if (wasCompleted) {
      soundManager.click();
    } else {
      soundManager.habitComplete();
      if (newStreak >= 3 && newStreak % 3 === 0) {
        setCelebration({ type: 'streak', streak: newStreak, habitName: habit?.name });
      }
      showNotification(`+${xpGain} XP (${newStreak}x streak!)`, 'success');
    }

    setState(newState);
  };

  const handleAddHabit = (habit) => {
    soundManager.success();
    setState(prev => addHabit(prev, habit));
  };

  const handleDeleteHabit = (habitId) => {
    setState(prev => deleteHabit(prev, habitId));
  };

  const handleBuyReward = (reward) => {
    const { newState, success } = buyReward(state, reward);
    if (success) {
      soundManager.rewardUnlock();
      setState(newState);
    }
  };

  const handleAddReward = (reward) => {
    soundManager.success();
    setState(prev => addReward(prev, reward));
  };

  const handleDeleteReward = (rewardId) => {
    setState(prev => deleteReward(prev, rewardId));
  };

  const handleResetSystem = () => {
    localStorage.removeItem('theSystem');
    localStorage.removeItem('theSystemSound');
    setState(getInitialState());
    setActiveTab('home');
    showNotification('System has been reset. Start fresh.', 'error');
  };

  const handleImportData = (importedState) => {
    setState(prev => ({
      ...prev,
      ...importedState,
      onboarded: importedState.onboarded ?? prev.onboarded,
      player: { ...prev.player, ...importedState.player },
      quests: importedState.quests || [],
      questLog: importedState.questLog || [],
      habits: importedState.habits || [],
      habitLog: importedState.habitLog || {},
      habitStreaks: importedState.habitStreaks || {},
      vision: { ...prev.vision, ...importedState.vision },
      rewards: importedState.rewards || []
    }));
  };

  // Tab configuration
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
        <LevelUpCelebration level={celebration.level} rank={celebration.rank} onClose={handleCloseCelebration} />
      )}
      {celebration?.type === 'rankUp' && (
        <RankUpCelebration rank={celebration.rank} onClose={handleCloseCelebration} />
      )}
      {celebration?.type === 'streak' && (
        <StreakCelebration streak={celebration.streak} habitName={celebration.habitName} onClose={handleCloseCelebration} />
      )}
      {celebration?.type === 'quest' && (
        <QuestCompleteCelebration quest={celebration.quest} onClose={handleCloseCelebration} />
      )}

      {/* Floating Texts */}
      {floatingTexts.map(ft => (
        <FloatingText key={ft.id} text={ft.text} type={ft.type} position={ft.position} onComplete={() => removeFloatingText(ft.id)} />
      ))}

      {/* Notification */}
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
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
            <h3 className="text-xl font-display font-bold text-cyber-cyan text-center mb-2">INSTALL THE APP</h3>
            <p className="text-gray-400 text-sm text-center mb-4">
              Install this app on your device for the best experience. Get offline access, faster loading, and immersive fullscreen mode.
            </p>
            <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs mb-4 bg-yellow-400/10 rounded-lg p-2">
              <AlertTriangle size={14} />
              <span>Without installing, you may miss out on key features</span>
            </div>
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
            <button onClick={handleInstallClick} className="w-full py-3 rounded-lg bg-cyber-cyan text-black font-bold transition-all hover:bg-cyan-400 btn-press">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Swipe Indicator */}
      <SwipeIndicator swipeIndicator={swipeIndicator} swipeProgress={swipeProgress} activeTab={activeTab} tabOrder={tabOrder} />

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden relative" style={{ touchAction: 'pan-y' }} {...swipeHandlers}>
        {activeTab === 'home' && <Dashboard state={state} onLoginReward={handleLoginReward} showNotification={showNotification} />}
        {activeTab === 'quests' && (
          <Quests state={state} onAddQuest={handleAddQuest} onCompleteQuest={handleCompleteQuest} onFailQuest={handleFailQuest} onDeleteQuest={handleDeleteQuest} onUndoQuest={handleUndoQuest} showNotification={showNotification} />
        )}
        {activeTab === 'awakening' && (
          <Settings
            state={state}
            onResetSystem={handleResetSystem}
            onImportData={handleImportData}
            showNotification={showNotification}
            tabOrder={customTabOrder}
            onUpdateTabOrder={handleUpdateTabOrder}
            audioHapticsSettings={{ soundEnabled, hapticsEnabled, volumeLevel, vibrationStrength }}
            onAudioHapticsChange={handleAudioHapticsChange}
          />
        )}
        {activeTab === 'habits' && <Habits state={state} onToggleHabit={handleToggleHabit} onAddHabit={handleAddHabit} onDeleteHabit={handleDeleteHabit} showNotification={showNotification} />}
        {activeTab === 'shop' && <Shop state={state} onBuyReward={handleBuyReward} onAddReward={handleAddReward} onDeleteReward={handleDeleteReward} showNotification={showNotification} />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav ref={navRef} tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} swipeProgress={swipeProgress} tabOrder={tabOrder} />
    </div>
  );
};

export default App;
