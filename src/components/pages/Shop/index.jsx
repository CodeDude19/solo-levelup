import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ShoppingBag, Save, Coins, Trash2, Gift, Zap, Target, Star, Crown, Sparkles, Swords, Flame } from 'lucide-react';
import soundManager from '../../../core/SoundManager';
import { generateId } from '../../../utils/generators';
import { REWARD_TIERS } from '../../../config/rewards';
import Modal from '../../ui/Modal';
import Particles from '../../ui/Particles';

/**
 * Shop - Rewards shop with tiered categories, buy/add/delete
 */
const Shop = forwardRef(({ state, onBuyReward, onAddReward, onDeleteReward, showNotification }, ref) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [purchasedReward, setPurchasedReward] = useState(null);
  const [newReward, setNewReward] = useState({ name: '', cost: 100 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showIntro, setShowIntro] = useState(() => {
    return !localStorage.getItem('shopIntroSeen');
  });

  // Expose openAddModal to parent via ref (for FAB - kept for consistency)
  useImperativeHandle(ref, () => ({
    openAddModal: () => setShowAddModal(true)
  }));

  const handleDismissIntro = () => {
    soundManager.click();
    setShowIntro(false);
    localStorage.setItem('shopIntroSeen', 'true');
  };

  // Group rewards by tier
  const groupedRewards = REWARD_TIERS.map(tier => ({
    ...tier,
    rewards: state.rewards.filter(r => r.tier === tier.id)
  }));

  // Get ungrouped rewards (custom or those without tier)
  const ungroupedRewards = state.rewards.filter(r => !r.tier);

  const handleBuy = (reward) => {
    if (state.player.gold < reward.cost) {
      showNotification('Not enough Gold!', 'error');
      return;
    }
    onBuyReward(reward);
    setPurchasedReward(reward);
    setShowPurchaseAnimation(true);
    setTimeout(() => {
      setShowPurchaseAnimation(false);
      setPurchasedReward(null);
    }, 3000);
  };

  const handleAddReward = () => {
    if (!newReward.name.trim()) return;
    onAddReward({
      id: generateId(),
      name: newReward.name,
      cost: parseInt(newReward.cost) || 100,
      icon: 'gift'
    });
    setNewReward({ name: '', cost: 100 });
    setShowAddModal(false);
    showNotification('Reward Added!', 'success');
  };

  const getTierIcon = (iconName) => {
    switch (iconName) {
      case 'zap': return <Zap size={16} />;
      case 'target': return <Target size={16} />;
      case 'star': return <Star size={16} />;
      case 'crown': return <Crown size={16} />;
      default: return <Gift size={16} />;
    }
  };

  const renderRewardCard = (reward, i) => (
    <div
      key={reward.id}
      className="bg-cyber-dark rounded-xl p-3 card-hover relative animate-fadeIn"
      style={{
        animationDelay: `${i * 0.05}s`,
        borderLeft: reward.tier ? `3px solid ${REWARD_TIERS.find(t => t.id === reward.tier)?.color || '#ffd700'}` : '3px solid #ffd700'
      }}
    >
      {deleteConfirm === reward.id ? (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            onClick={() => {
              soundManager.click();
              onDeleteReward(reward.id);
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
            setDeleteConfirm(reward.id);
          }}
          className="absolute top-2 right-2 text-gray-600 hover:text-cyber-red p-1 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      )}
      <h4 className="font-bold text-white text-sm mb-2 pr-6">{reward.name}</h4>
      <div className="flex items-center justify-between">
        <div className="text-cyber-gold font-display font-bold text-sm flex items-center gap-1">
          <Coins size={12} /> {reward.cost}
        </div>
        <button
          onClick={() => handleBuy(reward)}
          disabled={state.player.gold < reward.cost}
          className={`px-3 py-1 rounded-lg font-bold text-xs btn-press transition-all ${
            state.player.gold >= reward.cost
              ? 'bg-cyber-gold text-black hover:shadow-neon-gold'
              : 'bg-cyber-gray text-gray-500 cursor-not-allowed'
          }`}
        >
          {state.player.gold >= reward.cost ? 'Buy' : 'Need'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Purchase Animation Overlay */}
      {showPurchaseAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fadeIn">
          <Particles type="gold" />

          <div className="text-center">
            <div className="w-28 h-28 mx-auto mb-6 bg-cyber-gold/20 rounded-full flex items-center justify-center animate-rewardUnlock">
              <Gift className="text-cyber-gold" size={56} />
            </div>
            <h3 className="font-display text-3xl font-bold gradient-text-gold mb-2 animate-glow">
              REWARD UNLOCKED!
            </h3>
            <p className="text-white text-xl mb-4">{purchasedReward?.name}</p>
            <div className="bg-cyber-gold/20 text-cyber-gold px-6 py-2 rounded-lg inline-block animate-pulse">
              <span className="font-display font-bold">Enjoy your reward!</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-black flex justify-between items-center">
        <button
          onClick={() => { soundManager.click(); setShowAddModal(true); }}
          className="bg-cyber-gold text-black px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-1.5 btn-press hover:shadow-neon-gold transition-all"
        >
          <Save size={14} /> Add Item
        </button>
        <div className="bg-cyber-gold/20 text-cyber-gold px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
          <Coins size={16} className="animate-coinBounce" /> {state.player.gold}
        </div>
      </div>

      {/* First-time Intro Modal */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-sm bg-cyber-dark border border-cyber-gold/30 rounded-xl p-6 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-gold mb-4">
              <ShoppingBag size={28} />
              <h3 className="font-display font-bold text-xl">REWARD SHOP</h3>
            </div>

            <p className="text-gray-300 text-sm text-center mb-5">
              Complete quests and habits to earn Gold. Spend it on rewards you deserve!
            </p>

            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/20 flex items-center justify-center flex-shrink-0">
                  <Swords size={16} className="text-cyber-cyan" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Earn from Quests</p>
                  <p className="text-gray-500 text-xs">Complete quests to earn Gold rewards.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Flame size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Earn from Habits</p>
                  <p className="text-gray-500 text-xs">Daily habits give you +5 Gold each.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-cyber-gray/30 rounded-lg p-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-gold/20 flex items-center justify-center flex-shrink-0">
                  <Gift size={16} className="text-cyber-gold" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Spend Wisely</p>
                  <p className="text-gray-500 text-xs">Buy rewards you've earned. You deserve it!</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismissIntro}
              className="w-full py-3 rounded-lg bg-cyber-gold text-black font-bold btn-press hover:shadow-neon-gold transition-all"
            >
              Let's Shop!
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Rewards List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Tiered Rewards */}
        {groupedRewards.map(tier => {
          if (tier.rewards.length === 0) return null;
          return (
            <div key={tier.id} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                >
                  {getTierIcon(tier.icon)}
                </div>
                <h3 className="font-display font-bold text-sm" style={{ color: tier.color }}>
                  {tier.name}
                </h3>
                <span className="text-gray-600 text-xs">({tier.rewards.length})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tier.rewards.map((reward, i) => renderRewardCard(reward, i))}
              </div>
            </div>
          );
        })}

        {/* Custom/Ungrouped Rewards */}
        {ungroupedRewards.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-cyber-cyan/20 text-cyber-cyan">
                <Sparkles size={16} />
              </div>
              <h3 className="font-display font-bold text-sm text-cyber-cyan">
                Custom Rewards
              </h3>
              <span className="text-gray-600 text-xs">({ungroupedRewards.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ungroupedRewards.map((reward, i) => renderRewardCard(reward, i))}
            </div>
          </div>
        )}
      </div>

      {/* Add Reward Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Reward">
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Reward Name</label>
            <input
              type="text"
              value={newReward.name}
              onChange={e => setNewReward({ ...newReward, name: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
              placeholder="e.g., Watch a movie"
            />
          </div>
          <div>
            <label className="text-cyber-gold text-xs uppercase tracking-wider block mb-1">Cost (Gold)</label>
            <input
              type="number"
              value={newReward.cost}
              onChange={e => setNewReward({ ...newReward, cost: e.target.value })}
              className="w-full bg-cyber-gray text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-cyber-cyan transition-all"
            />
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
              onClick={handleAddReward}
              disabled={!newReward.name.trim()}
              className={`flex-1 py-3 rounded-lg font-bold btn-press transition-all ${
                newReward.name.trim()
                  ? 'bg-cyber-gold text-black hover:shadow-neon-gold'
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

Shop.displayName = 'Shop';

export default Shop;
