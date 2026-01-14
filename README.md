# THE SYSTEM

> *"I alone level up."*

A gamified productivity app inspired by **Solo Leveling**. Transform your daily habits and tasks into an RPG adventure where discipline becomes power.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

THE SYSTEM binds to your soul and transforms every completed task into XP, every habit streak into power multipliers, and every achievement into rank progression. Rise through the ranks from **Silver** to **Radiant** as you conquer your goals.

This isn't just another todo app. This is your awakening.

---

## Features

### Rank Progression System
- **6 Valorant-inspired ranks:** Silver → Gold → Platinum → Diamond → Immortal → Radiant
- Earn XP through quests and habits
- Beautiful rank-up celebrations with sound effects!
- Power Level tracking that combines XP + streak bonuses

### Quest System
- Create tasks with **S/A/B/C priority ranks** (threat levels)
- Higher priority = higher rewards (and penalties!)
- Earn **XP** and **Gold** on completion
- Face consequences for skipping or failing
- Reorder quests with priority swapping

### Habit Tracking
- Daily habit completion with **streak multipliers**
- Visual heatmap showing your consistency
- Streak celebrations at milestones (3, 6, 9+ days)
- The longer your streak, the more XP per completion

### Reward Shop
- Spend earned Gold on custom rewards
- Tiered rewards: Quick Relief → Mental Reset → High Dopamine → Legendary
- Add your own rewards with custom costs
- Guilt-free indulgence - you earned it!

### Reflect Dashboard
- Power Level display with rank icon
- "Road to {Next Rank}" progress tracking
- Weekly comparison (This Week vs Last Week)
- Monthly activity calendar with heatmap
- Best streaks leaderboard

### Immersive Experience
- **Sound effects** for every action (completions, level ups, penalties)
- **Haptic feedback** on mobile devices
- Particle effects and animations
- Swipe navigation between tabs
- Dark cyberpunk aesthetic

### Data Management
- **Export** all progress to JSON backup
- **Import** from backup to restore
- Customizable tab order
- Full offline support (PWA)

---

## Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Web Audio API** - Sound effects
- **Vibration API** - Haptic feedback
- **LocalStorage** - Data persistence
- **Vite** - Build tool
- **GitHub Pages** - Deployment

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/codedude19/solo-levelup.git

# Navigate to project directory
cd solo-levelup

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

Push to `main` branch - GitHub Actions will automatically deploy.

---

## How It Works

### Onboarding
1. **Identify Yourself** - Enter your hunter name
2. **Choose Your Track** - Select a pre-built path or go custom:
   - DSA Grind (for coders)
   - Lifestyle Warrior (for fitness)
   - Entrepreneur (for hustlers)
   - Custom (build your own)
3. **Set Your Vision** - Define your Fuel (motivation) and Fear (anti-vision)
4. **Awaken** - THE SYSTEM binds to you

### Daily Loop
1. **Check In** daily for bonus XP
2. **Complete Habits** to build streaks and earn multiplied rewards
3. **Conquer Quests** to earn XP and Gold
4. **Spend Gold** on rewards you've defined
5. **Reflect** on your progress and climb the ranks

### Rank Requirements
| Rank | Min XP | Title |
|------|--------|-------|
| Silver | 0 | The Journey Begins |
| Gold | 500 | Rising Hunter |
| Platinum | 1,500 | Proven Warrior |
| Diamond | 4,000 | Elite Discipline |
| Immortal | 10,000 | Unbreakable Will |
| Radiant | 25,000 | Shadow Monarch |

---

## Screenshots

<details>
<summary>View Screenshots</summary>

### Reflect Dashboard
*Power level, rank progress, weekly stats, and activity heatmap*

### Quest Board
*Priority-based task management with threat levels*

### Habit Tracker
*Daily habits with streak tracking and heatmap*

### Reward Shop
*Spend your hard-earned gold on custom rewards*

### Rank Up Celebration
*Epic animations when you achieve a new rank*

</details>

---

## PWA Installation

THE SYSTEM works best as an installed app:

**Android:**
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Add to Home screen"

**iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

---

## Customization

### Adding Custom Tracks
Edit the `TRACKS` array in `App.jsx` to add your own discipline paths with pre-loaded habits, quests, and rewards.

### Modifying Ranks
Edit the `RANKS` array to customize rank names, XP thresholds, colors, and icons.

### Sound Effects
The `SoundManager` class uses Web Audio API to generate all sounds procedurally. Modify frequencies and patterns to customize.

---

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## License

MIT License - feel free to use this for your own projects.

---

## Acknowledgments

- Inspired by **Solo Leveling** (나 혼자만 레벨업)
- Rank icons inspired by **Valorant**
- Built with caffeine and discipline

---

<div align="center">

**ARISE, HUNTER.**

Made with ❤ by [Yasser Arafat](https://www.linkedin.com/in/yasserarafat007)

</div>
