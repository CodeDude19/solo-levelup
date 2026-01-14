import React from 'react';

/**
 * Modal - Reusable modal dialog component
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-6 animate-modalPop"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-display font-bold text-cyber-cyan mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Modal;
