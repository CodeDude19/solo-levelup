import React, { useEffect } from 'react';
import { Flame } from 'lucide-react';
import soundManager from '../../core/SoundManager';
import Particles from '../ui/Particles';

/**
 * StreakCelebration - Habit streak milestone celebration
 */
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

export default StreakCelebration;
