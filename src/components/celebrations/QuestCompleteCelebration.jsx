import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import soundManager from '../../core/SoundManager';
import Particles from '../ui/Particles';

/**
 * QuestCompleteCelebration - Quest completion animation with rewards
 */
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

export default QuestCompleteCelebration;
