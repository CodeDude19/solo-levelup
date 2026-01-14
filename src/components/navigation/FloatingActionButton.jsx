import { forwardRef } from 'react';
import { Dumbbell, Swords } from 'lucide-react';
import soundManager from '../../core/SoundManager';

/**
 * Floating Action Button - context-aware primary action button
 * Shows different actions based on active tab
 */

const FAB_CONFIG = {
  home: null, // No FAB for Reflect tab
  habits: {
    icon: Dumbbell,
    label: 'Add Habit',
    color: 'gold',
    // Only show if at least 1 habit exists
    showCondition: (state) => state.habits.length > 0
  },
  quests: {
    icon: Swords,
    label: 'New Quest',
    color: 'cyan',
    // Only show if at least 1 quest exists
    showCondition: (state) => state.quests.filter(q => !q.completed && !q.failed).length > 0
  },
  shop: null, // No FAB for Shop - has header button instead
  awakening: null // No FAB for Settings
};

const FloatingActionButton = forwardRef(({ activeTab, onAction, state, hidden = false }, ref) => {
  const config = FAB_CONFIG[activeTab];

  // Don't render if no config, condition fails, or hidden
  if (!config) return null;
  if (config.showCondition && !config.showCondition(state)) return null;
  if (hidden) return null;

  const Icon = config.icon;
  const isCyan = config.color === 'cyan';

  // Quests tab has filter tabs at bottom, so FAB needs to be higher
  // Filter bar is ~60px + safe area, so FAB needs to clear that
  const baseOffset = activeTab === 'quests' ? 72 : 24;

  return (
    <button
      ref={ref}
      onClick={() => {
        soundManager.click();
        onAction(activeTab);
      }}
      className={`
        fixed z-40
        w-14 h-14
        ${isCyan ? 'bg-cyber-cyan' : 'bg-cyber-gold'}
        text-black
        rounded-full
        flex items-center justify-center
        ${isCyan ? 'shadow-neon-cyan' : 'shadow-neon-gold'}
        btn-press
        transition-all
        hover:scale-110
        active:scale-95
      `}
      style={{
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${baseOffset}px)`,
        right: 'calc(env(safe-area-inset-right, 0px) + 16px)'
      }}
      aria-label={config.label}
    >
      <Icon size={24} strokeWidth={2.5} />
    </button>
  );
});

FloatingActionButton.displayName = 'FloatingActionButton';

export default FloatingActionButton;
