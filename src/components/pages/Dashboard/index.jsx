import React, { useState } from 'react';
import { Eye, Calendar, X, Crown, Coins, Trophy, Zap, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Flame, Swords } from 'lucide-react';
import soundManager from '../../../core/SoundManager';
import { getToday } from '../../../utils/formatters';
import { getRank, getNextRank, calculateXpProgress } from '../../../utils/helpers';
import { DAILY_LOGIN_XP, RANKS } from '../../../core/constants';
import Particles from '../../ui/Particles';

/**
 * Dashboard - Player stats, weekly comparison, monthly calendar, streaks
 */
const Dashboard = ({ state, onLoginReward, showNotification }) => {
  const { player, habits, habitLog, habitStreaks, questLog } = state;
  const today = getToday();

  // Rank & Level
  const rank = getRank(player.totalXp);
  const nextRank = getNextRank(player.totalXp);
  const xpProgress = calculateXpProgress(player.totalXp);
  const level = rank.level;

  // Power Level calculation
  const totalStreakBonus = Object.values(habitStreaks).reduce((sum, s) => sum + s * 10, 0);
  const powerLevel = player.totalXp + totalStreakBonus;

  const [showCheckinAnim, setShowCheckinAnim] = useState(false);
  const [showRanksModal, setShowRanksModal] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const handleCheckIn = () => {
    if (!player.checkedInToday) {
      setShowCheckinAnim(true);
      setTimeout(() => setShowCheckinAnim(false), 1500);
      onLoginReward();
    }
  };

  // Helper to get dates for a week (using local date to avoid timezone issues)
  const getWeekDates = (weekOffset = 0) => {
    const dates = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.push(localDate);
    }
    return dates;
  };

  // Helper to get month dates (using local date to avoid timezone issues)
  const getMonthDates = (monthOffset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + monthOffset;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      // Use local date formatting to avoid timezone shifts
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      dates.push(localDate);
    }
    return dates;
  };

  // Current week stats
  const currentWeekDates = getWeekDates(0);
  const pastWeekDates = getWeekDates(1);

  const calculateWeekStats = (dates) => {
    let habitsCompleted = 0;
    let questsCompleted = 0;
    let questsFailed = 0;
    let daysActive = 0;

    dates.forEach(date => {
      const dayHabits = habitLog[date]?.length || 0;
      if (dayHabits > 0) daysActive++;
      habitsCompleted += dayHabits;
    });

    // Quest log stats for the week
    (questLog || []).forEach(q => {
      if (q.completedAt) {
        // Convert ISO timestamp to local date
        const d = new Date(q.completedAt);
        const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (dates.includes(qDate)) {
          if (q.completed) questsCompleted++;
          else questsFailed++;
        }
      }
    });

    return { habitsCompleted, questsCompleted, questsFailed, daysActive };
  };

  const currentWeekStats = calculateWeekStats(currentWeekDates);
  const pastWeekStats = calculateWeekStats(pastWeekDates);

  // Monthly calendar data (uses monthOffset for navigation)
  const currentMonthDates = getMonthDates(monthOffset);
  const selectedMonthDate = new Date();
  selectedMonthDate.setMonth(selectedMonthDate.getMonth() + monthOffset);
  const monthName = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate month stats
  const monthHabitsCompleted = currentMonthDates.reduce((sum, date) => sum + (habitLog[date]?.length || 0), 0);
  const monthQuestsCompleted = (questLog || []).filter(q => {
    if (!q.completedAt || !q.completed) return false;
    // Convert ISO timestamp to local date
    const d = new Date(q.completedAt);
    const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return currentMonthDates.includes(qDate);
  }).length;

  // Actual active days (days with at least one habit or quest activity)
  const activeDays = (() => {
    const activeDates = new Set();

    // Add dates from habit log
    Object.keys(habitLog).forEach(date => {
      if (habitLog[date]?.length > 0) {
        activeDates.add(date);
      }
    });

    // Add dates from quest log
    (questLog || []).forEach(q => {
      if (q.completedAt) {
        // Convert ISO timestamp to local date
        const d = new Date(q.completedAt);
        const qDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        activeDates.add(qDate);
      }
    });

    return activeDates.size;
  })();

  // Get day labels
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get first day of month offset (for the selected month)
  const firstDayOffset = (() => {
    if (currentMonthDates.length === 0) return 0;
    // Parse date string manually to avoid timezone issues
    const [year, month, day] = currentMonthDates[0].split('-').map(Number);
    return new Date(year, month - 1, day).getDay();
  })();

  return (
    <div className="h-full overflow-y-auto pb-4 px-4">
      {/* Checkin Animation */}
      {showCheckinAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadeIn">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-cyber-cyan/20 flex items-center justify-center animate-checkPop">
              <Calendar className="text-cyber-cyan" size={32} />
            </div>
            <p className="text-cyber-cyan font-display text-xl font-bold">+{DAILY_LOGIN_XP} XP</p>
            <p className="text-gray-400 text-sm">Daily Bonus!</p>
          </div>
          <Particles type="xp" />
        </div>
      )}

      {/* Ranks Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn" onClick={() => setShowRanksModal(false)}>
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-4 animate-modalPop" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-cyber-cyan flex items-center gap-2">
                <Crown size={16} /> Hunter Ranks
              </h3>
              <button onClick={() => setShowRanksModal(false)} className="text-gray-500 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {RANKS.map((r) => {
                const isCurrentRank = r.name === rank.name;
                const isUnlocked = player.totalXp >= r.minXp;
                return (
                  <div
                    key={r.name}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCurrentRank ? 'bg-cyber-cyan/10 border border-cyber-cyan/30' : 'bg-cyber-gray/30'
                    } ${!isUnlocked ? 'opacity-40 grayscale' : ''}`}
                  >
                    <img src={r.icon} alt={r.name} className="w-8 h-8 object-contain" />
                    <div className="flex-1">
                      <p className="font-display font-bold text-sm" style={{ color: r.color }}>{r.name}</p>
                      <p className="text-gray-500 text-[10px]">{r.minXp.toLocaleString()} XP</p>
                    </div>
                    {isCurrentRank && (
                      <span className="text-cyber-cyan text-[10px] font-bold bg-cyber-cyan/20 px-2 py-0.5 rounded">YOU</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pt-4 pb-2">
        <p className="text-gray-400 text-sm tracking-widest">HUNTER {player.name?.toUpperCase() || 'UNKNOWN'}</p>
      </div>

      {/* Daily Check-in Button */}
      {!player.checkedInToday && (
        <button
          onClick={handleCheckIn}
          className="w-full mb-3 py-3 px-4 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all btn-press relative overflow-hidden bg-gradient-to-r from-cyber-cyan/20 to-cyber-green/20 text-cyber-cyan border border-cyber-cyan/50 hover:border-cyber-cyan hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          <Calendar size={18} />
          <span>Daily Check-in</span>
          <span className="text-cyber-green font-bold">+{DAILY_LOGIN_XP} XP</span>
        </button>
      )}

      {/* Current Status Card */}
      <div className="bg-cyber-dark rounded-xl p-4 glow-border-cyan mb-3">
        {/* Main Row: Icon + Power Level + Road to Next */}
        <div className="flex items-center gap-3 mb-3">
          {/* Rank Icon */}
          <button
            onClick={() => { soundManager.click(); setShowRanksModal(true); }}
            className="flex-shrink-0 hover:scale-105 transition-transform btn-press"
          >
            <img src={rank.icon} alt={rank.name} className="w-14 h-14 object-contain" style={{ filter: `drop-shadow(0 0 8px ${rank.color}40)` }} />
          </button>

          {/* Power Level */}
          <div className="flex-shrink-0">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Power</p>
            <p className="font-display text-2xl font-black text-white">{powerLevel.toLocaleString()}</p>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-700 mx-1" />

          {/* Road to Next Rank */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">
                {nextRank ? `Road to ${nextRank.name}` : 'Max Rank'}
              </p>
              <p className="text-cyber-cyan text-[10px] font-bold">{Math.round(xpProgress.percent)}%</p>
            </div>
            <div className="h-2 bg-cyber-gray rounded-full overflow-hidden">
              <div className="h-full progress-bar-xp rounded-full transition-all" style={{ width: `${xpProgress.percent}%` }} />
            </div>
            <p className="text-gray-600 text-[9px] mt-1">{xpProgress.current.toLocaleString()} / {xpProgress.total.toLocaleString()} XP</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Coins size={14} className="text-cyber-gold mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-gold">{player.gold}</p>
            <p className="text-gray-500 text-[8px]">GOLD</p>
          </div>
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Trophy size={14} className="text-cyber-purple mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-purple">{player.totalQuestsCompleted}</p>
            <p className="text-gray-500 text-[8px]">QUESTS</p>
          </div>
          <div className="bg-cyber-gray/30 rounded-lg p-2 text-center">
            <Calendar size={14} className="text-cyber-green mx-auto mb-1" />
            <p className="font-display font-bold text-sm text-cyber-green">{activeDays}</p>
            <p className="text-gray-500 text-[8px]">ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Weekly Comparison */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-cyber-cyan/20">
        <h3 className="font-display font-bold text-cyber-cyan flex items-center gap-2 text-sm mb-3">
          <Zap size={14} /> Weekly Progress
        </h3>

        <div className="bg-cyber-gray/30 rounded-lg overflow-hidden">
          {/* Column Headers */}
          <div className="grid grid-cols-2 border-b border-gray-700/50">
            <div className="p-2 text-center border-r border-gray-700/50">
              <p className="text-cyber-cyan text-[10px] uppercase tracking-wider font-bold">This Week</p>
            </div>
            <div className="p-2 text-center">
              <p className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Last Week</p>
            </div>
          </div>

          {/* Stats Rows */}
          <div className="grid grid-cols-2">
            {/* This Week */}
            <div className="p-3 border-r border-gray-700/50">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Habits</span>
                  <span className="text-cyber-cyan font-bold text-sm">{currentWeekStats.habitsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Quests</span>
                  <span className="text-cyber-green font-bold text-sm">{currentWeekStats.questsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Active Days</span>
                  <span className="text-white font-bold text-sm">{currentWeekStats.daysActive}/7</span>
                </div>
              </div>
            </div>

            {/* Last Week */}
            <div className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Habits</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.habitsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Quests</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.questsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Active Days</span>
                  <span className="text-gray-400 font-bold text-sm">{pastWeekStats.daysActive}/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Comparison Indicator */}
        {pastWeekStats.habitsCompleted > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-center gap-2">
              {currentWeekStats.habitsCompleted >= pastWeekStats.habitsCompleted ? (
                <>
                  <ChevronUp className="text-cyber-green" size={16} />
                  <span className="text-cyber-green text-xs font-bold">
                    {currentWeekStats.habitsCompleted > pastWeekStats.habitsCompleted
                      ? `+${currentWeekStats.habitsCompleted - pastWeekStats.habitsCompleted} habits vs last week`
                      : 'Same as last week'}
                  </span>
                </>
              ) : (
                <>
                  <ChevronDown className="text-cyber-red" size={16} />
                  <span className="text-cyber-red text-xs font-bold">
                    {pastWeekStats.habitsCompleted - currentWeekStats.habitsCompleted} fewer habits vs last week
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Calendar */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-cyber-purple/20">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-bold text-cyber-purple flex items-center gap-2 text-sm">
            <Calendar size={14} /> {monthName}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(prev => prev - 1);
              }}
              className="p-1.5 rounded-lg bg-cyber-gray/50 text-gray-400 hover:text-cyber-purple hover:bg-cyber-purple/20 transition-all btn-press"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(0);
              }}
              disabled={monthOffset === 0}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                monthOffset === 0
                  ? 'bg-cyber-gray/30 text-gray-600 cursor-not-allowed'
                  : 'bg-cyber-purple/20 text-cyber-purple hover:bg-cyber-purple/30 btn-press'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                soundManager.click();
                setMonthOffset(prev => prev + 1);
              }}
              disabled={monthOffset >= 0}
              className={`p-1.5 rounded-lg transition-all ${
                monthOffset >= 0
                  ? 'bg-cyber-gray/30 text-gray-600 cursor-not-allowed'
                  : 'bg-cyber-gray/50 text-gray-400 hover:text-cyber-purple hover:bg-cyber-purple/20 btn-press'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayLabels.map((day, i) => (
            <div key={i} className="text-center text-gray-500 text-[10px]">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {[...Array(firstDayOffset)].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {currentMonthDates.map((date) => {
            // Parse date string manually to avoid timezone issues
            const dayNum = parseInt(date.split('-')[2], 10);
            const habitsCount = habitLog[date]?.length || 0;
            const isToday = date === today && monthOffset === 0;
            const intensity = Math.min(5, habitsCount);

            return (
              <div
                key={date}
                className={`aspect-square rounded-sm flex items-center justify-center text-[10px] relative ${
                  isToday ? 'ring-1 ring-cyber-cyan' : ''
                } heatmap-${intensity}`}
                title={`${date}: ${habitsCount} habits`}
              >
                <span className={habitsCount > 0 ? 'text-white' : 'text-gray-600'}>{dayNum}</span>
              </div>
            );
          })}
        </div>

        {/* Month Summary */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-orange-500" />
              <span className="text-xs text-gray-400">{monthHabitsCompleted} habits</span>
            </div>
            <div className="flex items-center gap-1">
              <Swords size={12} className="text-cyber-cyan" />
              <span className="text-xs text-gray-400">{monthQuestsCompleted} quests</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-1">
            <span className="text-gray-600 text-[8px]">Less</span>
            {[0, 2, 4, 5].map(i => (
              <div key={i} className={`w-2 h-2 rounded-sm heatmap-${i}`} />
            ))}
            <span className="text-gray-600 text-[8px]">More</span>
          </div>
        </div>
      </div>

      {/* Best Streaks */}
      {Object.keys(habitStreaks).length > 0 && (
        <div className="bg-cyber-dark rounded-xl p-3 mb-3 border border-orange-500/20">
          <h3 className="font-display font-bold text-orange-400 flex items-center gap-2 text-xs mb-2">
            <Flame size={12} /> Best Streaks
          </h3>
          <div className="space-y-2">
            {Object.entries(habitStreaks)
              .filter(([_, streak]) => streak > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([habitId, streak]) => {
                const habit = habits.find(h => h.id === habitId);
                if (!habit) return null;
                return (
                  <div key={habitId} className="flex items-center justify-between bg-cyber-gray/30 rounded-lg px-3 py-2">
                    <span className="text-gray-300 text-xs truncate flex-1">{habit.name}</span>
                    <div className="flex items-center gap-1 text-orange-400">
                      <Flame size={12} />
                      <span className="font-bold text-sm">{streak}</span>
                      <span className="text-gray-500 text-[10px]">days</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
