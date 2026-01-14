import React, { useState, useEffect } from 'react';
import soundManager from '../../core/SoundManager';
import Particles from '../ui/Particles';

/**
 * LevelUpCelebration - Level progression celebration screen
 */
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

export default LevelUpCelebration;
