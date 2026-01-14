import React, { useEffect } from 'react';

/**
 * Notification - Toast notification component
 */
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 1500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-cyber-green/60 border-cyber-green' :
                  type === 'error' ? 'bg-cyber-red/60 border-cyber-red' :
                  type === 'gold' ? 'bg-cyber-gold/60 border-cyber-gold' :
                  'bg-cyber-cyan/60 border-cyber-cyan';

  const textColor = type === 'success' ? 'text-white' :
                    type === 'error' ? 'text-white' :
                    type === 'gold' ? 'text-black' :
                    'text-black';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none px-4">
      <div className={`px-6 py-3 rounded-xl border-2 ${bgColor} animate-scaleIn backdrop-blur-sm`}>
        <p className={`text-center font-bold ${textColor}`}>{message}</p>
      </div>
    </div>
  );
};

export default Notification;
