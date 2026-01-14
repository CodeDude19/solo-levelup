import React, { useState, useEffect } from 'react';
import soundManager from '../../core/SoundManager';
import Particles from '../ui/Particles';

/**
 * RankUpCelebration - Rank advancement celebration
 */
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

export default RankUpCelebration;
