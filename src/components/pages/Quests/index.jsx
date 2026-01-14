import React, { useState, useRef } from 'react';
import { Swords, Scroll, Plus, Calendar, Zap, Coins, Check, X, Trash2, Undo2, Skull, Flame, ChevronUp, LayoutList } from 'lucide-react';
import soundManager from '../../../core/SoundManager';
import { generateId } from '../../../utils/generators';
import { QUEST_RANKS } from '../../../core/constants';
import Modal from '../../ui/Modal';

/**
 * Quests - Quest management with add, complete, fail, delete, undo
 */
const Quests = ({ state, onAddQuest, onCompleteQuest, onFailQuest, onDeleteQuest, onUndoQuest, showNotification }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('questIntroSeen');
  });
  const [newQuest, setNewQuest] = useState({
    name: '',
    dueDate: '',
    rank: 'B'
  });
  const dateInputRef = useRef(null);

  // Get active quests sorted by: earliest due date → threat level → no date last
  const rankOrder = { 'S': 0, 'A': 1, 'B': 2, 'C': 3 };
  const allActiveQuests = state.quests
    .filter(q => !q.completed && !q.failed)
    .sort((a, b) => {
      // Quests with due dates come first, sorted by earliest date
      const hasDateA = !!a.dueDate;
      const hasDateB = !!b.dueDate;

      if (hasDateA && !hasDateB) return -1; // A has date, B doesn't → A first
      if (!hasDateA && hasDateB) return 1;  // B has date, A doesn't → B first

      if (hasDateA && hasDateB) {
        // Both have dates - sort by earliest date first
        const dateCompare = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateCompare !== 0) return dateCompare;
      }

      // Same date or both no date - sort by threat level (S > A > B > C)
      const rankA = rankOrder[a.rank] ?? 2;
      const rankB = rankOrder[b.rank] ?? 2;
      return rankA - rankB;
    });

  // Apply filter
  const activeQuests = filter === 'all'
    ? allActiveQuests
    : allActiveQuests.filter(q => q.rank === filter);

  const getQuestRankInfo = (rankId) => {
    return QUEST_RANKS.find(r => r.id === rankId) || QUEST_RANKS[2];
  };

  const getRankIcon = (rankId, overrideColor = null) => {
    const rankInfo = getQuestRankInfo(rankId);
    const iconStyle = { color: overrideColor || rankInfo.color };
    switch (rankId) {
      case 'S': return <Skull size={20} style={iconStyle} />;
      case 'A': return <Flame size={20} style={iconStyle} />;
      case 'B': return <Swords size={20} style={iconStyle} />;
      case 'C': return <Scroll size={20} style={iconStyle} />;
      default: return <Swords size={20} style={iconStyle} />;
    }
  };

  const handleAddQuest = () => {
    if (!newQuest.name.trim()) return;
    const rankInfo = getQuestRankInfo(newQuest.rank);
    // Fixed base values
    const baseReward = 50;
    const baseGold = 50;
    const basePenalty = 25;

    onAddQuest({
      id: generateId(),
      name: newQuest.name,
      reward: Math.round(baseReward * rankInfo.multiplier),
      penalty: Math.round(basePenalty * rankInfo.multiplier),
      goldReward: Math.round(baseGold * rankInfo.multiplier),
      dueDate: newQuest.dueDate,
      rank: newQuest.rank,
      createdAt: new Date().toISOString(),
      completed: false,
      failed: false
    });
    setNewQuest({ name: '', dueDate: '', rank: 'B' });
    setShowAddModal(false);
    soundManager.success();
    showNotification('Quest Added!', 'success');
  };

  const handleDismissIntro = () => {
    soundManager.click();
    setShowIntro(false);
    localStorage.setItem('questIntroSeen', 'true');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* First-time Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-6 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-cyan mb-4">
              <Swords size={28} />
              <h3 className="font-display font-bold text-xl">QUESTS</h3>
            </div>

            <p className="text-gray-300 text-sm text-center mb-5">
              Quests are your tasks. Complete them to earn XP and Gold. Fail them and face penalties.
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                  <Skull size={16} className="text-cyber-red" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Set Priority (S/A/B/C)</p>
                  <p className="text-gray-500 text-xs">S-Rank = Critical, C-Rank = Low. Higher ranks give more rewards!</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                  <ChevronUp size={16} className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Reorder Quests</p>
                  <p className="text-gray-500 text-xs">Use the up/down arrows to change quest order and swap priorities.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={16} className="text-cyber-red" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Delete Quests</p>
                  <p className="text-gray-500 text-xs">Tap the trash icon on any quest to remove it (no penalty).</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissIntro}
              className="w-full py-3 rounded-lg bg-cyber-cyan text-black font-bold btn-press hover:shadow-neon-cyan transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="flex-shrink-0 px-4 bg-black">
        <div className="flex items-center justify-between py-4">
          <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Swords className="text-cyber-cyan" /> Quests
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLog(!showLog)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                showLog ? 'bg-cyber-cyan text-black' : 'bg-cyber-gray text-gray-400'
              }`}
            >
              <Scroll size={16} /> Log
            </button>
            {allActiveQuests.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-cyber-cyan text-black px-4 py-2 rounded-lg font-bold flex items-center gap-1 btn-press hover:shadow-neon-cyan transition-all"
              >
                <Plus size={16} /> New
              </button>
            )}
          </div>
        </div>

        {/* Quest Filter Tabs */}
        {!showLog && allActiveQuests.length > 0 && (
          <div className="bg-cyber-gray/50 rounded-xl p-1 flex mb-3">
            {/* All tab */}
            <button
              onClick={() => { soundManager.click(); setFilter('all'); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-sm transition-all ${
                filter === 'all'
                  ? 'bg-cyber-cyan text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-cyber-gray/50'
              }`}
            >
              <LayoutList size={18} />
              <span>All</span>
              <span className={`text-xs ${filter === 'all' ? 'text-black/60' : 'text-gray-500'}`}>
                {allActiveQuests.length}
              </span>
            </button>
            {/* Rank tabs */}
            {QUEST_RANKS.map(rank => {
              const count = allActiveQuests.filter(q => q.rank === rank.id).length;
              const isActive = filter === rank.id;
              return (
                <button
                  key={rank.id}
                  onClick={() => { soundManager.click(); setFilter(rank.id); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? 'shadow-lg'
                      : 'hover:bg-cyber-gray/50'
                  } ${count === 0 && !isActive ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: isActive ? rank.color : 'transparent',
                    color: isActive ? '#000' : count > 0 ? rank.color : '#888'
                  }}
                >
                  {getRankIcon(rank.id, isActive ? '#000' : count > 0 ? rank.color : '#888')}
                  {count > 0 && (
                    <span className={`text-xs ${isActive ? 'text-black/60' : 'opacity-60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quest List or Log */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {showLog ? (
          // Quest Log
          <div className="space-y-3">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Quest Log</h3>
            {state.questLog.length === 0 ? (
              <div className="text-center py-12">
                <Scroll className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-white font-bold mb-1">Your Legend Awaits</p>
                <p className="text-gray-400 text-sm mb-2">No quests completed yet.</p>
                <p className="text-gray-600 text-xs italic max-w-[260px] mx-auto">
                  "Every Shadow Monarch started with a single quest. Your story begins when you take action."
                </p>
              </div>
            ) : (
              // Deduplicate - only remove true duplicates (same ID + same completedAt)
              [...new Map(state.questLog.map(q => [`${q.id}-${q.completedAt}`, q])).values()].slice().reverse().map((quest, i) => {
                return (
                  <div
                    key={`${quest.id}-${quest.completedAt}`}
                    className="bg-cyber-dark rounded-lg px-3 py-2 animate-fadeIn flex items-center gap-3"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Status indicator */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      quest.completed ? 'bg-cyber-green' : 'bg-cyber-red'
                    }`} />

                    {/* Due date */}
                    {quest.dueDate && (
                      <span className="text-gray-500 text-xs flex-shrink-0 w-12">
                        {new Date(quest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}

                    {/* Title */}
                    <span className="text-white text-sm flex-1 truncate">{quest.name}</span>

                    {/* Status badge */}
                    <span className={`text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${
                      quest.completed
                        ? 'bg-cyber-green/20 text-cyber-green'
                        : quest.failReason === 'overdue'
                          ? 'bg-cyber-gold/20 text-cyber-gold'
                          : 'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {quest.completed ? 'Done' : quest.failReason === 'overdue' ? 'Overdue' : 'Failed'}
                    </span>

                    {/* Undo button - only show if due date is in future or no due date */}
                    {(() => {
                      const canUndo = !quest.dueDate || new Date(quest.dueDate) >= new Date(new Date().toDateString());
                      return canUndo ? (
                        <button
                          onClick={() => onUndoQuest(quest)}
                          className="text-gray-400 hover:text-cyber-cyan p-1.5 rounded hover:bg-cyber-cyan/10 transition-colors flex-shrink-0"
                          title="Undo"
                        >
                          <Undo2 size={16} />
                        </button>
                      ) : null;
                    })()}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Active Quests
          <div className="space-y-3">
            {activeQuests.length === 0 ? (
              <div className="text-center py-10">
                {filter !== 'all' ? (
                  (() => {
                    const emptyMessages = {
                      'S': {
                        icon: <Skull className="mx-auto mb-4" size={48} style={{ color: '#ff3333' }} />,
                        title: "No S-Rank threats detected.",
                        subtitle: "Really? No boss-level tasks?",
                        taunt: "Either you're crushing it... or you're hiding from the real challenges. Which is it, Hunter?",
                        addLabel: "Boss Hunt"
                      },
                      'A': {
                        icon: <Flame className="mx-auto mb-4" size={48} style={{ color: '#ff6600' }} />,
                        title: "A-Rank queue is empty.",
                        subtitle: "Suspiciously clean.",
                        taunt: "No urgent quests? Are you sure you're not just pretending they don't exist?",
                        addLabel: "Urgent Mission"
                      },
                      'B': {
                        icon: <Swords className="mx-auto mb-4" size={48} style={{ color: '#00ffff' }} />,
                        title: "No B-Rank quests found.",
                        subtitle: "The standard queue awaits.",
                        taunt: "Every hunter has regular duties. What are you avoiding?",
                        addLabel: "Daily Duty"
                      },
                      'C': {
                        icon: <Scroll className="mx-auto mb-4" size={48} style={{ color: '#808080' }} />,
                        title: "C-Rank is clear.",
                        subtitle: "No small tasks lurking?",
                        taunt: "Not even a tiny errand? THE SYSTEM sees all procrastination, Hunter.",
                        addLabel: "Side Quest"
                      }
                    };
                    const msg = emptyMessages[filter];
                    const rankInfo = getQuestRankInfo(filter);
                    return (
                      <>
                        <div className="opacity-60">{msg.icon}</div>
                        <p className="font-bold text-white mb-1">{msg.title}</p>
                        <p className="text-gray-400 text-sm mb-3">{msg.subtitle}</p>
                        <p className="text-gray-500 text-xs italic max-w-[280px] mx-auto mb-4">"{msg.taunt}"</p>
                        <button
                          onClick={() => { setShowAddModal(true); setNewQuest(q => ({ ...q, rank: filter })); }}
                          className="px-4 py-2 rounded-lg font-bold text-sm transition-all"
                          style={{ backgroundColor: rankInfo.bgColor, color: rankInfo.color }}
                        >
                          + Add {msg.addLabel}
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <Swords className="mx-auto text-cyber-cyan mb-3" size={40} />
                    <p className="text-white font-bold text-lg mb-1">No Active Quests</p>
                    <p className="text-gray-500 text-sm mb-6">Choose your challenge, Hunter.</p>

                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      {[
                        { rank: 'S', label: 'Boss Hunt', desc: 'Critical priority', icon: <Skull size={24} />, color: '#ff3333', bg: 'rgba(255, 51, 51, 0.15)' },
                        { rank: 'A', label: 'Urgent Mission', desc: 'High priority', icon: <Flame size={24} />, color: '#ff6600', bg: 'rgba(255, 102, 0, 0.15)' },
                        { rank: 'B', label: 'Daily Duty', desc: 'Standard task', icon: <Swords size={24} />, color: '#00ffff', bg: 'rgba(0, 255, 255, 0.15)' },
                        { rank: 'C', label: 'Side Quest', desc: 'When you have time', icon: <Scroll size={24} />, color: '#888888', bg: 'rgba(136, 136, 136, 0.15)' }
                      ].map(item => (
                        <button
                          key={item.rank}
                          onClick={() => { soundManager.click(); setShowAddModal(true); setNewQuest(q => ({ ...q, rank: item.rank })); }}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent hover:scale-105 transition-all btn-press"
                          style={{ backgroundColor: item.bg, color: item.color }}
                        >
                          {item.icon}
                          <span className="font-bold text-sm">{item.label}</span>
                          <span className="text-[10px] opacity-60">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              activeQuests.map((quest, i) => {
                return (
                  <div
                    key={quest.id}
                    className="bg-gray-800/80 rounded-lg px-3 py-2.5 animate-slideUp"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {/* Main Row */}
                    <div className="flex items-center gap-2">
                      {/* Rank Icon */}
                      <div className={`flex-shrink-0 ${quest.rank === 'S' ? 'animate-pulse' : ''}`}>
                        {getRankIcon(quest.rank)}
                      </div>

                      {/* Quest Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-white text-sm font-medium break-words">{quest.name}</span>
                          {quest.dueDate && (
                            <span className="text-gray-500 text-[10px] flex items-center gap-0.5 flex-shrink-0">
                              <Calendar size={10} />
                              {new Date(quest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {/* Rewards inline */}
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Zap size={10} className="text-cyber-cyan" />
                            {quest.reward}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Coins size={10} className="text-cyber-gold" />
                            {quest.goldReward}
                          </span>
                          <span className="text-gray-600">−{quest.penalty}</span>
                        </div>
                      </div>

                      {/* Action Buttons - Compact */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => onCompleteQuest(quest)}
                          className="bg-cyber-green/20 text-cyber-green p-2 rounded-lg btn-press hover:bg-cyber-green/30 transition-all"
                          title="Done"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => onFailQuest(quest)}
                          className="bg-cyber-red/10 text-cyber-red/60 p-2 rounded-lg btn-press hover:bg-cyber-red/20 hover:text-cyber-red transition-all"
                          title="Fail"
                        >
                          <X size={16} />
                        </button>
                        {deleteConfirm === quest.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { soundManager.click(); onDeleteQuest(quest.id); setDeleteConfirm(null); }}
                              className="text-[10px] bg-cyber-red text-white px-1.5 py-1 rounded font-bold"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => { soundManager.click(); setDeleteConfirm(null); }}
                              className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-1 rounded"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { soundManager.click(); setDeleteConfirm(quest.id); }}
                            className="text-gray-600 hover:text-cyber-red p-1.5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Quest Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Quest">
        <div className="space-y-4">
          {/* Threat Level Selector */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Threat Level</label>
            <div className="grid grid-cols-4 gap-2">
              {QUEST_RANKS.slice().reverse().map(rank => (
                <button
                  key={rank.id}
                  onClick={() => setNewQuest({ ...newQuest, rank: rank.id })}
                  className={`p-3 rounded-lg border-2 transition-all btn-press ${
                    newQuest.rank === rank.id ? 'scale-105' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    borderColor: newQuest.rank === rank.id ? rank.color : 'transparent',
                    backgroundColor: rank.bgColor
                  }}
                >
                  <div className="flex flex-col items-center gap-1">
                    {getRankIcon(rank.id)}
                    <span className="text-[10px] text-gray-400">{rank.multiplier}x</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2 text-center">
              {getQuestRankInfo(newQuest.rank).description}
            </p>
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Quest Name</label>
            <input
              type="text"
              value={newQuest.name}
              onChange={e => setNewQuest({ ...newQuest, name: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="Enter quest name..."
            />
          </div>

          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Due Date (optional)</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setNewQuest({ ...newQuest, dueDate: tomorrow.toISOString().split('T')[0] });
                }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  newQuest.dueDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-cyber-cyan text-black'
                    : 'bg-cyber-gray text-gray-400 hover:text-white'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  newQuest.dueDate && newQuest.dueDate !== new Date(Date.now() + 86400000).toISOString().split('T')[0]
                    ? 'bg-cyber-cyan text-black'
                    : 'bg-cyber-gray text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={14} />
                {newQuest.dueDate && newQuest.dueDate !== new Date(Date.now() + 86400000).toISOString().split('T')[0]
                  ? new Date(newQuest.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'Select'}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={newQuest.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewQuest({ ...newQuest, dueDate: e.target.value })}
                className="sr-only"
              />
            </div>
            {newQuest.dueDate && (
              <button
                type="button"
                onClick={() => setNewQuest({ ...newQuest, dueDate: '' })}
                className="text-gray-500 text-xs mt-2 hover:text-gray-400"
              >
                Clear date
              </button>
            )}
          </div>

          {/* Final Rewards Preview */}
          <div className="bg-cyber-gray/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Rewards (with {getQuestRankInfo(newQuest.rank).multiplier}x multiplier)</p>
            <div className="flex items-center justify-around text-sm">
              <span className="text-cyber-cyan font-bold">
                {Math.round(50 * getQuestRankInfo(newQuest.rank).multiplier)} XP
              </span>
              <span className="text-cyber-gold font-bold">
                {Math.round(50 * getQuestRankInfo(newQuest.rank).multiplier)} Gold
              </span>
              <span className="text-cyber-red font-bold">
                -{Math.round(25 * getQuestRankInfo(newQuest.rank).multiplier)} Fail
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                soundManager.click();
                setShowAddModal(false);
              }}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddQuest}
              disabled={!newQuest.name.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newQuest.name.trim()
                  ? 'bg-cyber-cyan text-black hover:shadow-neon-cyan'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Quests;
