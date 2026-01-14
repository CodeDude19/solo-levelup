import React, { useEffect } from 'react';

/**
 * FloatingText - Floating damage/gain text animations
 */
const FloatingText = ({ text, type, position, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const color = type === 'xp' ? 'text-cyber-cyan' : type === 'gold' ? 'text-cyber-gold' : type === 'damage' ? 'text-cyber-red' : 'text-white';

  return (
    <div
      className={`fixed z-50 font-display font-black text-2xl ${color} animate-floatUp pointer-events-none`}
      style={{ left: position?.x || '50%', top: position?.y || '50%', transform: 'translateX(-50%)' }}
    >
      {text}
    </div>
  );
};

export default FloatingText;
