import React, { useState, useEffect } from 'react';

/**
 * Particles - Animated particle effects for celebrations
 */
const Particles = ({ type, onComplete }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const count = type === 'levelUp' ? 50 : type === 'xp' ? 20 : 30;
    const newParticles = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: type === 'gold' ? '#ffd700' : type === 'xp' ? '#00ffff' : type === 'streak' ? '#ff6600' : '#00ffff',
        delay: Math.random() * 0.5,
        duration: Math.random() * 1 + 1
      });
    }
    setParticles(newParticles);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
