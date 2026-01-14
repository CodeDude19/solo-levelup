import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Flame, Plus, Check, Trash2, Eye, Zap, Scroll, Heart, Target, Shield, User, Star, Dumbbell } from 'lucide-react';
import soundManager from '../../../core/SoundManager';
import { getToday } from '../../../utils/formatters';
import { generateId } from '../../../utils/generators';
import { HABIT_ICONS } from '../../../config/rewards';
import Modal from '../../ui/Modal';

/**
 * Habits - Daily habit tracker with heatmap and streaks
 */
const Habits = forwardRef(({ state, onToggleHabit, onAddHabit, onDeleteHabit, showNotification, onModalChange }, ref) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [newHabitIcon, setNewHabitIcon] = useState('star');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const today = getToday();

  // Expose openAddModal to parent via ref (for FAB)
  useImperativeHandle(ref, () => ({
    openAddModal: () => setShowAddModal(true)
  }));

  // Notify parent when modal opens/closes (to hide FAB)
  useEffect(() => {
    onModalChange?.(showAddModal);
  }, [showAddModal, onModalChange]);

  const handleAddHabit = () => {
    if (!newHabit.trim()) return;
    onAddHabit({
      id: generateId(),
      name: newHabit,
      icon: newHabitIcon
    });
    setNewHabit('');
    setNewHabitIcon('star');
    setShowAddModal(false);
    soundManager.success();
    showNotification('Habit Added!', 'success');
  };

  const getHabitIcon = (iconName) => {
    switch (iconName) {
      case 'eye': return <Eye size={16} />;
      case 'flame': return <Flame size={16} />;
      case 'zap': return <Zap size={16} />;
      case 'scroll': return <Scroll size={16} />;
      case 'heart': return <Heart size={16} />;
      case 'target': return <Target size={16} />;
      case 'shield': return <Shield size={16} />;
      case 'user': return <User size={16} />;
      default: return <Star size={16} />;
    }
  };

  const isHabitCompletedToday = (habitId) => {
    return state.habitLog[today]?.includes(habitId);
  };

  const getStreak = (habitId) => {
    return state.habitStreaks[habitId] || 0;
  };

  // Generate compact heatmap data (last 5 weeks)
  const generateHeatmapData = () => {
    const weeks = [];
    const todayDate = new Date();

    for (let week = 4; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(todayDate);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        // Use local date format to match habitLog keys (same as getToday())
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const completedCount = state.habitLog[dateStr]?.length || 0;
        weekData.push({
          date: dateStr,
          count: completedCount,
          intensity: Math.min(5, completedCount)
        });
      }
      weeks.push(weekData);
    }
    return weeks;
  };

  // Calculate habit stats
  const calculateStats = () => {
    const totalHabits = state.habits.length;
    const completedToday = state.habitLog[today]?.length || 0;

    // Calculate average daily completion
    const logDates = Object.keys(state.habitLog);
    let totalCompleted = 0;
    logDates.forEach(date => {
      totalCompleted += state.habitLog[date]?.length || 0;
    });
    const avgPerDay = logDates.length > 0 ? (totalCompleted / logDates.length).toFixed(1) : '0';

    // Best current streak
    const streakValues = Object.values(state.habitStreaks);
    const bestStreak = streakValues.length > 0 ? Math.max(...streakValues) : 0;

    return { totalHabits, completedToday, avgPerDay, bestStreak };
  };

  const stats = calculateStats();
  const heatmapData = generateHeatmapData();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky Header + Heatmap */}
      <div className="flex-shrink-0 px-4 pt-4 bg-black">
        {/* Heatmap + Stats Row */}
        {state.habits.length > 0 && (
        <div className="flex gap-3 mb-4">
          {/* Compact Heatmap - Left */}
          <div className="bg-cyber-dark rounded-xl p-3 glow-border-cyan flex-shrink-0">
            {/* Mini heatmap grid */}
            <div className="space-y-[2px]">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex gap-[2px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-[10px] h-[10px] rounded-[2px] heatmap-${day.intensity}`}
                      title={`${day.date}: ${day.count} habits`}
                    />
                  ))}
                </div>
              ))}
            </div>
            {/* Mini legend */}
            <div className="flex items-center gap-[2px] mt-2 justify-center">
              {[0, 2, 4, 5].map(i => (
                <div key={i} className={`w-[8px] h-[8px] rounded-[2px] heatmap-${i}`} />
              ))}
            </div>
          </div>

          {/* Stats Box - Right */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-cyan text-center">
              <p className="text-cyber-cyan font-display font-bold text-lg">
                {stats.completedToday}/{stats.totalHabits}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Today</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-gold text-center">
              <p className="text-cyber-gold font-display font-bold text-lg">
                {stats.avgPerDay}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Avg/Day</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 glow-border-red text-center">
              <p className="text-orange-500 font-display font-bold text-lg flex items-center justify-center gap-1">
                <Flame size={14} /> {stats.bestStreak}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Best Streak</p>
            </div>
            <div className="bg-cyber-dark rounded-lg p-2 border border-gray-700 text-center">
              <p className="text-white font-display font-bold text-lg">
                {stats.totalHabits}
              </p>
              <p className="text-gray-500 text-[10px] uppercase">Habits</p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Scrollable Habits List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {state.habits.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="mx-auto text-cyber-gold mb-4" size={48} />
            <p className="text-white font-bold text-lg mb-1">No Habits Yet</p>
            <p className="text-gray-500 text-sm mb-2">Discipline is forged through repetition.</p>
            <p className="text-gray-600 text-xs italic max-w-[280px] mx-auto mb-6">
              "A Hunter's true power comes not from single victories, but from the daily rituals that sharpen the blade."
            </p>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-cyber-gold text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto btn-press hover:shadow-neon-gold transition-all"
            >
              <Dumbbell size={20} /> Forge a Habit
            </button>
          </div>
        ) : (
        <div className="space-y-3">
        {state.habits.map((habit, i) => {
          const completed = isHabitCompletedToday(habit.id);
          const streak = getStreak(habit.id);

          return (
            <div
              key={habit.id}
              className={`bg-cyber-dark rounded-xl p-4 flex items-center justify-between transition-all animate-slideRight ${
                completed ? 'glow-border-cyan' : 'border border-cyber-gray'
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all btn-press flex-shrink-0 ${
                    completed
                      ? 'bg-cyber-cyan text-black scale-110'
                      : 'bg-cyber-gray text-gray-400 hover:bg-cyber-gray/80'
                  }`}
                >
                  {completed ? (
                    <Check size={24} className="animate-checkPop" />
                  ) : (
                    getHabitIcon(habit.icon)
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium transition-colors ${completed ? 'text-cyber-cyan' : 'text-white'}`}>
                    {habit.name}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {streak > 0 ? (
                      <span className="flex items-center gap-1">
                        <Flame size={10} className="text-orange-500" />
                        {streak} day streak
                      </span>
                    ) : (
                      'Start your streak'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {streak >= 3 && (
                  <div className={`bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 flex-shrink-0 ${streak >= 7 ? 'animate-pulse' : ''}`}>
                    <Flame size={12} /> {streak}x
                  </div>
                )}
                {deleteConfirm === habit.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        soundManager.click();
                        onDeleteHabit(habit.id);
                        setDeleteConfirm(null);
                      }}
                      className="text-xs bg-cyber-red text-white px-2 py-1 rounded font-bold"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        soundManager.click();
                        setDeleteConfirm(null);
                      }}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.click();
                      setDeleteConfirm(habit.id);
                    }}
                    className="text-gray-600 hover:text-cyber-red p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
        )}
      </div>

      {/* Add Habit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Habit">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Habit Name</label>
            <input
              type="text"
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="e.g., Drink 8 glasses of water"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-2">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon.id}
                  onClick={() => {
                    soundManager.click();
                    setNewHabitIcon(icon.id);
                  }}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all btn-press ${
                    newHabitIcon === icon.id
                      ? 'bg-cyber-cyan/20 border-2 border-cyber-cyan'
                      : 'bg-cyber-gray hover:bg-cyber-gray/80 border-2 border-transparent'
                  }`}
                >
                  <span className={newHabitIcon === icon.id ? 'text-cyber-cyan' : 'text-gray-400'}>
                    {getHabitIcon(icon.id)}
                  </span>
                  <span className={`text-[9px] ${newHabitIcon === icon.id ? 'text-cyber-cyan' : 'text-gray-500'}`}>
                    {icon.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                soundManager.click();
                setShowAddModal(false);
                setNewHabitIcon('star');
              }}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-400 font-medium hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHabit}
              disabled={!newHabit.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newHabit.trim()
                  ? 'bg-cyber-cyan text-black hover:shadow-neon-cyan'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

Habits.displayName = 'Habits';

export default Habits;
