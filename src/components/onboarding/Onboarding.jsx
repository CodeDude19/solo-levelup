import React, { useState } from 'react';
import { Eye, User, Target, Scroll, Swords, Flame, Skull, Crown, Sparkles, Zap, Heart, Check } from 'lucide-react';
import soundManager from '../../core/SoundManager';
import { TRACKS } from '../../config/tracks';
import { generateId } from '../../utils/generators';
import AwakeningSequence from './AwakeningSequence';

/**
 * Onboarding - 7-step onboarding flow
 */
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
    <div className="fixed inset-0 bg-black flex flex-col max-w-[500px] mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-8">
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
            <div className="mb-8 pt-6">
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
              {playerName ? `Welcome, ${playerName.trim()}` : 'What\'s your name, Hunter?'}
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

        {/* Step: Ready to Awaken */}
        {step === 5 && (
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
          } ${step === 0 ? 'mb-11' : ''}`}
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

export default Onboarding;
