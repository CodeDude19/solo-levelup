import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Visual feedback component shown during swipe navigation
 * Shows edge glow, animated arrows, and target tab label
 */
const SwipeIndicator = ({ swipeIndicator, swipeProgress, activeTab, tabOrder }) => {
  if (!swipeIndicator) return null;

  const targetTabName = swipeIndicator === 'left'
    ? tabOrder[tabOrder.indexOf(activeTab) + 1]?.toUpperCase()
    : tabOrder[tabOrder.indexOf(activeTab) - 1]?.toUpperCase();

  return (
    <>
      {/* Edge Glow Effect */}
      <div
        className="fixed inset-y-0 w-24 pointer-events-none z-30 transition-opacity"
        style={{
          [swipeIndicator === 'left' ? 'right' : 'left']: 0,
          background: `linear-gradient(${swipeIndicator === 'left' ? 'to left' : 'to right'}, rgba(0,255,255,${Math.abs(swipeProgress) * 0.4}) 0%, transparent 100%)`,
          boxShadow: `${swipeIndicator === 'left' ? '-' : ''}20px 0 60px rgba(0,255,255,${Math.abs(swipeProgress) * 0.6})`
        }}
      />

      {/* Animated Arrows on Edge */}
      <div
        className="fixed inset-y-0 flex flex-col items-center justify-center pointer-events-none z-40"
        style={{
          [swipeIndicator === 'left' ? 'right' : 'left']: '8px',
          opacity: Math.min(1, Math.abs(swipeProgress) * 2)
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-bounce"
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          >
            {swipeIndicator === 'left' ? (
              <ChevronRight
                className="w-8 h-8 text-cyber-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                style={{ filter: `drop-shadow(0 0 ${10 + Math.abs(swipeProgress) * 15}px rgba(0,255,255,0.9))` }}
              />
            ) : (
              <ChevronLeft
                className="w-8 h-8 text-cyber-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                style={{ filter: `drop-shadow(0 0 ${10 + Math.abs(swipeProgress) * 15}px rgba(0,255,255,0.9))` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Center Label */}
      <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
        <div
          className="px-6 py-3 rounded-full bg-black/80 border-2 border-cyber-cyan"
          style={{
            boxShadow: `0 0 ${20 + Math.abs(swipeProgress) * 30}px rgba(0,255,255,0.5)`,
            transform: `scale(${0.8 + Math.abs(swipeProgress) * 0.3})`,
            opacity: Math.min(1, Math.abs(swipeProgress) * 1.5)
          }}
        >
          <span className="text-cyber-cyan font-display text-lg font-bold tracking-wider">
            {targetTabName}
          </span>
        </div>
      </div>
    </>
  );
};

export default SwipeIndicator;
