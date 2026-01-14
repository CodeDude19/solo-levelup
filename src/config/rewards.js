/**
 * Reward system configuration - tiers, icons, and motivational quotes
 */

import { Eye, Flame, Swords, ShoppingBag, Shield } from 'lucide-react';

// Reward tier definitions
export const REWARD_TIERS = [
  { id: 'micro', name: 'Quick Relief', color: '#00ff88', icon: 'zap' },
  { id: 'medium', name: 'Mental Reset', color: '#00ffff', icon: 'target' },
  { id: 'premium', name: 'High Dopamine', color: '#9d4edd', icon: 'star' },
  { id: 'legendary', name: 'Legendary', color: '#ffd700', icon: 'crown' }
];

// Available habit icons
export const HABIT_ICONS = [
  { id: 'star', label: 'Star' },
  { id: 'flame', label: 'Fire' },
  { id: 'zap', label: 'Energy' },
  { id: 'target', label: 'Target' },
  { id: 'heart', label: 'Health' },
  { id: 'eye', label: 'Focus' },
  { id: 'shield', label: 'Shield' },
  { id: 'scroll', label: 'Learn' },
  { id: 'user', label: 'Social' }
];

// Motivational quotes for settings/dashboard
export const FALLBACK_QUOTES = [
  { q: "The gap between who you are and who you want to be is what you do.", a: "Unknown" },
  { q: "Discipline is choosing between what you want now and what you want most.", a: "Abraham Lincoln" },
  { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "Your limitation—it's only your imagination.", a: "Unknown" }
];

// Tab info for navigation and reordering UI
export const TAB_INFO = {
  home: { label: 'Reflect', icon: Eye },
  habits: { label: 'Habits', icon: Flame },
  quests: { label: 'Quests', icon: Swords },
  shop: { label: 'Shop', icon: ShoppingBag },
  awakening: { label: 'Settings', icon: Shield }
};
