import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Swords,
  Eye,
  Flame,
  ShoppingBag,
  ChevronRight,
  AlertTriangle,
  Shield,
  ChevronLeft,
  Smartphone} from 'lucide-react';

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
import { generateId } from './utils/generators';

// Configuration

// Sound system
import soundManager from './core/SoundManager';

// UI Components
import FloatingText from './components/ui/FloatingText';
import Notification from './components/ui/Notification';

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
    if (reason === 'overdue') {
      showNotification(`Quest Overdue! -${doublePenalty} XP`, 'error');
    } else {
      showNotification(`Quest Failed! -${doublePenalty} XP`, 'error');
    }
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
      // Uncompleting
      soundManager.click();
    } else {
      // Completing
      soundManager.habitComplete();

      // Show streak celebration for milestones
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
