import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import soundManager from '../../core/SoundManager';
import Particles from '../ui/Particles';

/**
 * AwakeningSequence - Cinematic awakening animation
 */
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
    <div className={`fixed inset-0 bg-black flex items-center justify-center max-w-[500px] mx-auto ${glitching ? 'animate-glitch' : ''}`}>
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

export default AwakeningSequence;
