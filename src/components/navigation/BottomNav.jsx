import { forwardRef } from 'react';
import soundManager from '../../core/SoundManager';

/**
 * Bottom navigation bar with gooey indicator animation
 */
const BottomNav = forwardRef(({ tabs, activeTab, onTabChange, swipeProgress, tabOrder }, ref) => {
  const activeIndex = tabOrder.indexOf(activeTab);
  const tabWidth = 100 / tabs.length;
  const basePosition = activeIndex * tabWidth + tabWidth / 2;

  // Calculate stretch based on swipe progress
  const stretchAmount = Math.abs(swipeProgress) * 30; // Max 30% stretch
  const moveAmount = swipeProgress * (tabWidth * 0.6); // Move towards target

  // Determine stretch direction
  const isStretchingRight = swipeProgress > 0;
  const isStretchingLeft = swipeProgress < 0;

  return (
    <nav ref={ref} className="bg-cyber-dark border-t border-cyber-cyan/20 px-2 py-2 safe-area-bottom">
      <div className="flex justify-around relative">
        {/* Gooey Indicator */}
        <div
          className="absolute top-0 h-full pointer-events-none"
          style={{
            left: `${basePosition}%`,
            transform: `translateX(-50%)`,
            width: `${tabWidth}%`,
            transition: swipeProgress === 0 ? 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
          }}
        >
          {/* Main gooey blob */}
          <div
            className="absolute bottom-1 left-1/2 h-1 bg-cyber-cyan rounded-full"
            style={{
              width: `${24 + stretchAmount}px`,
              transform: `translateX(calc(-50% + ${moveAmount}%))`,
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.3)',
              borderRadius: isStretchingRight
                ? '4px 12px 12px 4px'
                : isStretchingLeft
                  ? '12px 4px 4px 12px'
                  : '6px',
              transition: swipeProgress === 0 ? 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
            }}
          />
          {/* Trailing gooey tail */}
          {Math.abs(swipeProgress) > 0.1 && (
            <div
              className="absolute bottom-1 left-1/2 h-1 bg-cyber-cyan/40 rounded-full"
              style={{
                width: `${stretchAmount * 0.8}px`,
                transform: `translateX(calc(-50% ${isStretchingRight ? '-' : '+'} ${12 + stretchAmount/3}px))`,
                opacity: Math.abs(swipeProgress) * 0.6,
                transition: 'opacity 0.1s'
              }}
            />
          )}
        </div>

        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          // Calculate if this tab is the target of the swipe
          const isTargetTab = (swipeProgress > 0 && index === activeIndex + 1) ||
                             (swipeProgress < 0 && index === activeIndex - 1);

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab !== tab.id) {
                  soundManager.tabSwitch();
                  onTabChange(tab.id);
                }
              }}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all btn-press relative z-10 ${
                isActive
                  ? 'text-cyber-cyan'
                  : isTargetTab && Math.abs(swipeProgress) > 0.2
                    ? 'text-cyber-cyan/60'
                    : 'text-gray-500 hover:text-gray-400'
              }`}
              style={{
                transform: isTargetTab ? `scale(${1 + Math.abs(swipeProgress) * 0.1})` : 'scale(1)',
                transition: 'transform 0.1s ease-out, color 0.2s'
              }}
            >
              <Icon
                size={20}
                className={isActive ? 'animate-pulse' : ''}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.8))' : 'none'
                }}
              />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
