import { useState, useCallback } from 'react';
import { generateId } from '../utils/generators';

/**
 * Custom hook for managing celebrations and floating text animations
 * @returns {object} Celebration state and handlers
 */
const useCelebrations = () => {
  const [celebration, setCelebration] = useState(null);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const addFloatingText = useCallback((text, type, x, y) => {
    const id = generateId();
    setFloatingTexts(prev => [...prev, { id, text, type, position: { x, y } }]);
  }, []);

  const removeFloatingText = useCallback((id) => {
    setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
  }, []);

  const handleCloseCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  return {
    celebration,
    setCelebration,
    floatingTexts,
    addFloatingText,
    removeFloatingText,
    handleCloseCelebration
  };
};

export default useCelebrations;
