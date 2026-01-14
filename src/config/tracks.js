/**
 * Track system configuration - predefined paths for different user types
 */

export const TRACKS = [
  {
    id: 'custom',
    name: 'Custom',
    icon: 'sparkles',
    desc: 'Build your own path',
    color: '#00ffff',
    habits: [],
    quests: []
  },
  {
    id: 'dsa',
    name: 'DSA Grind',
    icon: 'zap',
    desc: 'Master algorithms, land your dream job',
    color: '#9d4edd',
    habits: [
      { id: 'dsa1', name: '2hr DSA Practice', icon: 'zap' },
      { id: 'dsa2', name: 'Solve 3 LeetCode Problems', icon: 'target' },
      { id: 'dsa3', name: 'Review Data Structures', icon: 'scroll' },
      { id: 'dsa4', name: 'Watch 1 Algorithm Video', icon: 'eye' },
      { id: 'dsa5', name: 'Practice Mock Interview', icon: 'user' },
      { id: 'dsa6', name: 'Read Tech Blog/Article', icon: 'scroll' },
      { id: 'dsa7', name: 'Revise Previous Solutions', icon: 'flame' },
      { id: 'dsa8', name: 'Study System Design', icon: 'shield' }
    ],
    quests: [
      { name: 'Complete Easy Problem', reward: 30, penalty: 15, goldReward: 5, rank: 'C' },
      { name: 'Complete Medium Problem', reward: 60, penalty: 30, goldReward: 15, rank: 'B' },
      { name: 'Complete Hard Problem', reward: 150, penalty: 75, goldReward: 40, rank: 'A' },
      { name: 'Finish a LeetCode Contest', reward: 200, penalty: 100, goldReward: 50, rank: 'S' },
      { name: 'Complete a Topic (Arrays/Trees/etc)', reward: 300, penalty: 100, goldReward: 75, rank: 'A' }
    ],
    rewards: [
      // Micro Rewards (Quick Relief)
      { name: 'Chai Break', cost: 60, icon: 'gift', tier: 'micro' },
      { name: 'Coffee Shot', cost: 70, icon: 'gift', tier: 'micro' },
      { name: 'Stretch Break', cost: 50, icon: 'gift', tier: 'micro' },
      { name: 'Music Boost', cost: 40, icon: 'gift', tier: 'micro' },
      { name: 'Meme Scroll', cost: 50, icon: 'gift', tier: 'micro' },
      { name: 'Desk Walk', cost: 40, icon: 'gift', tier: 'micro' },
      // Medium Rewards (Mental Reset)
      { name: 'YouTube Clip', cost: 120, icon: 'gift', tier: 'medium' },
      { name: 'Reddit Scroll', cost: 120, icon: 'gift', tier: 'medium' },
      { name: 'Podcast Time', cost: 130, icon: 'gift', tier: 'medium' },
      { name: 'Blog Read', cost: 100, icon: 'gift', tier: 'medium' },
      { name: 'Coding Video', cost: 150, icon: 'gift', tier: 'medium' },
      { name: 'Casual Browse', cost: 140, icon: 'gift', tier: 'medium' },
      // Premium Rewards (High Dopamine)
      { name: 'Netflix Episode', cost: 250, icon: 'gift', tier: 'premium' },
      { name: 'Anime Episode', cost: 250, icon: 'gift', tier: 'premium' },
      { name: 'Gaming Hour', cost: 300, icon: 'gift', tier: 'premium' },
      { name: 'Movie Night', cost: 500, icon: 'gift', tier: 'premium' },
      { name: 'Zero Coding Day', cost: 400, icon: 'gift', tier: 'premium' },
      { name: 'Sleep Late Pass', cost: 350, icon: 'gift', tier: 'premium' },
      // Legendary (Rare)
      { name: 'Full Offday', cost: 900, icon: 'gift', tier: 'legendary' },
      { name: 'Cheat Day', cost: 700, icon: 'gift', tier: 'legendary' }
    ]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Warrior',
    icon: 'heart',
    desc: 'Transform body, mind & soul',
    color: '#ff3333',
    habits: [
      { id: 'life1', name: '1hr Exercise/Gym', icon: 'flame' },
      { id: 'life2', name: 'Morning Prayer/Meditation', icon: 'eye' },
      { id: 'life3', name: 'Cold Shower', icon: 'zap' },
      { id: 'life4', name: 'Walk 10,000 Steps', icon: 'target' },
      { id: 'life5', name: 'Drink 3L Water', icon: 'heart' },
      { id: 'life6', name: 'No Smoking/Vaping', icon: 'shield' },
      { id: 'life7', name: 'Eat Clean (No Junk)', icon: 'star' },
      { id: 'life8', name: 'Sleep Before 11PM', icon: 'eye' },
      { id: 'life9', name: 'Wake Before 6AM', icon: 'flame' },
      { id: 'life10', name: 'Gratitude Journal (3 things)', icon: 'scroll' },
      { id: 'life11', name: 'No Social Media (Except Work)', icon: 'shield' },
      { id: 'life12', name: 'Read 30min', icon: 'scroll' },
      { id: 'life13', name: 'Skincare Routine', icon: 'star' },
      { id: 'life14', name: 'Take Vitamins/Supplements', icon: 'heart' },
      { id: 'life15', name: 'Evening Reflection', icon: 'eye' }
    ],
    quests: [
      { name: 'Complete Full Workout', reward: 75, penalty: 40, goldReward: 20, rank: 'B' },
      { name: 'Hit 15,000 Steps', reward: 100, penalty: 50, goldReward: 25, rank: 'A' },
      { name: 'Full Day No Sugar', reward: 80, penalty: 40, goldReward: 20, rank: 'B' },
      { name: 'Week Streak - All Habits', reward: 500, penalty: 200, goldReward: 150, rank: 'S' },
      { name: 'Deep Clean Room/Space', reward: 60, penalty: 30, goldReward: 15, rank: 'C' }
    ],
    rewards: [
      // Micro Rewards (Daily Comfort)
      { name: 'Chai Break', cost: 50, icon: 'gift', tier: 'micro' },
      { name: 'Coffee Cup', cost: 60, icon: 'gift', tier: 'micro' },
      { name: 'Music Time', cost: 40, icon: 'gift', tier: 'micro' },
      { name: 'Hot Shower', cost: 80, icon: 'gift', tier: 'micro' },
      { name: 'Power Nap', cost: 90, icon: 'gift', tier: 'micro' },
      { name: 'Foam Roll', cost: 60, icon: 'gift', tier: 'micro' },
      // Medium Rewards (Enjoyment)
      { name: 'Dessert Bowl', cost: 150, icon: 'gift', tier: 'medium' },
      { name: 'Smoothie Treat', cost: 130, icon: 'gift', tier: 'medium' },
      { name: 'Social Scroll', cost: 140, icon: 'gift', tier: 'medium' },
      { name: 'YouTube Time', cost: 150, icon: 'gift', tier: 'medium' },
      { name: 'Podcast Walk', cost: 120, icon: 'gift', tier: 'medium' },
      { name: 'Sauna Time', cost: 180, icon: 'gift', tier: 'medium' },
      // Premium Rewards (Indulgence)
      { name: 'Cheat Meal', cost: 300, icon: 'gift', tier: 'premium' },
      { name: 'Netflix Episode', cost: 220, icon: 'gift', tier: 'premium' },
      { name: 'Gaming Hour', cost: 280, icon: 'gift', tier: 'premium' },
      { name: 'Late Night', cost: 260, icon: 'gift', tier: 'premium' },
      { name: 'Junk Snack', cost: 200, icon: 'gift', tier: 'premium' },
      { name: 'Restaurant Meal', cost: 350, icon: 'gift', tier: 'premium' },
      // Legendary (Rare)
      { name: 'Full Cheat Day', cost: 700, icon: 'gift', tier: 'legendary' },
      { name: 'Rest Day', cost: 500, icon: 'gift', tier: 'legendary' }
    ]
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: 'crown',
    desc: 'Build empire, create value',
    color: '#ffd700',
    habits: [
      { id: 'ent1', name: 'Morning Meditation (15min)', icon: 'eye' },
      { id: 'ent2', name: 'Review Goals & Priorities', icon: 'target' },
      { id: 'ent3', name: 'Reach Out to 5 Leads', icon: 'zap' },
      { id: 'ent4', name: '4hr Deep Work Block', icon: 'flame' },
      { id: 'ent5', name: 'Client Communication', icon: 'scroll' },
      { id: 'ent6', name: 'Content Creation (Post/Video)', icon: 'star' },
      { id: 'ent7', name: 'Learn New Skill (30min)', icon: 'scroll' },
      { id: 'ent8', name: 'Network - Connect with 1 Person', icon: 'user' },
      { id: 'ent9', name: 'Exercise (45min)', icon: 'flame' },
      { id: 'ent10', name: 'Evening Prayer/Gratitude', icon: 'eye' },
      { id: 'ent11', name: 'Healthy Meals Only', icon: 'heart' },
      { id: 'ent12', name: 'Review Finances/Expenses', icon: 'shield' },
      { id: 'ent13', name: 'Plan Tomorrow (Night Before)', icon: 'target' }
    ],
    quests: [
      { name: 'Close a Deal/Sale', reward: 200, penalty: 50, goldReward: 100, rank: 'S' },
      { name: 'Complete Client Project', reward: 300, penalty: 100, goldReward: 150, rank: 'S' },
      { name: 'Get a New Client Lead', reward: 100, penalty: 30, goldReward: 40, rank: 'B' },
      { name: 'Launch New Offering/Product', reward: 500, penalty: 150, goldReward: 200, rank: 'S' },
      { name: 'Hit Revenue Goal (Weekly)', reward: 400, penalty: 150, goldReward: 175, rank: 'A' },
      { name: 'Viral Content (100+ engagement)', reward: 150, penalty: 50, goldReward: 50, rank: 'A' }
    ],
    rewards: [
      // Micro Rewards (Quick Dopamine)
      { name: 'Chai Break', cost: 70, icon: 'gift', tier: 'micro' },
      { name: 'Coffee Cup', cost: 80, icon: 'gift', tier: 'micro' },
      { name: 'Music Boost', cost: 50, icon: 'gift', tier: 'micro' },
      { name: 'Desk Walk', cost: 40, icon: 'gift', tier: 'micro' },
      { name: 'Inspiration Read', cost: 60, icon: 'gift', tier: 'micro' },
      { name: 'Twitter Scroll', cost: 70, icon: 'gift', tier: 'micro' },
      // Medium Rewards (Mental Release)
      { name: 'YouTube Time', cost: 150, icon: 'gift', tier: 'medium' },
      { name: 'Podcast Time', cost: 140, icon: 'gift', tier: 'medium' },
      { name: 'Idea Journal', cost: 100, icon: 'gift', tier: 'medium' },
      { name: 'Casual Browse', cost: 160, icon: 'gift', tier: 'medium' },
      { name: 'Netflix Clip', cost: 180, icon: 'gift', tier: 'medium' },
      { name: 'LinkedIn Scroll', cost: 120, icon: 'gift', tier: 'medium' },
      // Premium Rewards (High Pleasure)
      { name: 'Netflix Episode', cost: 300, icon: 'gift', tier: 'premium' },
      { name: 'Anime Episode', cost: 300, icon: 'gift', tier: 'premium' },
      { name: 'Gaming Hour', cost: 350, icon: 'gift', tier: 'premium' },
      { name: 'Movie Night', cost: 550, icon: 'gift', tier: 'premium' },
      { name: 'Restaurant Meal', cost: 400, icon: 'gift', tier: 'premium' },
      { name: 'Social Night', cost: 450, icon: 'gift', tier: 'premium' },
      // Legendary (Rare)
      { name: 'Full Offday', cost: 1000, icon: 'gift', tier: 'legendary' },
      { name: 'Luxury Buy', cost: 800, icon: 'gift', tier: 'legendary' },
      { name: 'Weekend Trip', cost: 1500, icon: 'gift', tier: 'legendary' }
    ]
  }
];
