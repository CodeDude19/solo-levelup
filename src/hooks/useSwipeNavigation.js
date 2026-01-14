import { useState, useRef, useCallback, useEffect } from 'react';
import soundManager from '../core/SoundManager';

/**
 * Custom hook for swipe navigation between tabs
 * @param {string} activeTab - Currently active tab ID
 * @param {string[]} tabOrder - Array of tab IDs in order
 * @param {function} setActiveTab - Function to change active tab
 * @returns {object} Swipe state and touch handlers
 */
const useSwipeNavigation = (activeTab, tabOrder, setActiveTab) => {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const minSwipeDistance = 50;

  const [swipeIndicator, setSwipeIndicator] = useState(null); // 'left' | 'right' | null
  const [swipeProgress, setSwipeProgress] = useState(0); // -1 to 1, for gooey animation

  // Use refs to always have latest values in callbacks (avoid stale closures)
  const activeTabRef = useRef(activeTab);
  const tabOrderRef = useRef(tabOrder);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    tabOrderRef.current = tabOrder;
  }, [tabOrder]);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    touchEnd.current = { x: 0, y: 0 };
    setSwipeIndicator(null);
    setSwipeProgress(0);
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // Calculate swipe progress for gooey animation (-1 to 1)
    const screenWidth = window.innerWidth;
    const maxSwipeDistance = screenWidth * 0.3; // 30% of screen = full progress
    const normalizedProgress = Math.max(-1, Math.min(1, deltaX / maxSwipeDistance));

    // Use refs for latest values
    const currentTabOrder = tabOrderRef.current;
    const currentActiveTab = activeTabRef.current;

    // Show indicator at the slightest horizontal movement (15px threshold, 1.5:1 ratio)
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = currentTabOrder.indexOf(currentActiveTab);
      if (deltaX > 0 && currentIndex < currentTabOrder.length - 1) {
        setSwipeIndicator('left');
        setSwipeProgress(normalizedProgress);
      } else if (deltaX < 0 && currentIndex > 0) {
        setSwipeIndicator('right');
        setSwipeProgress(normalizedProgress);
      } else {
        setSwipeIndicator(null);
        setSwipeProgress(0);
      }
    } else {
      setSwipeIndicator(null);
      setSwipeProgress(0);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    setSwipeIndicator(null);
    setSwipeProgress(0);

    // No movement recorded
    if (touchEnd.current.x === 0 && touchEnd.current.y === 0) {
      return;
    }

    const deltaX = touchStart.current.x - touchEnd.current.x;
    const deltaY = touchStart.current.y - touchEnd.current.y;

    // Only register clearly horizontal swipes (2:1 ratio horizontal to vertical)
    if (Math.abs(deltaX) < minSwipeDistance || Math.abs(deltaX) < Math.abs(deltaY) * 2) {
      return;
    }

    // Use refs for latest values
    const currentTabOrder = tabOrderRef.current;
    const currentActiveTab = activeTabRef.current;
    const currentIndex = currentTabOrder.indexOf(currentActiveTab);

    if (deltaX > 0) {
      // Swiped left -> go to next tab
      if (currentIndex < currentTabOrder.length - 1) {
        soundManager.tabSwitch();
        setActiveTab(currentTabOrder[currentIndex + 1]);
      }
    } else {
      // Swiped right -> go to previous tab
      if (currentIndex > 0) {
        soundManager.tabSwitch();
        setActiveTab(currentTabOrder[currentIndex - 1]);
      }
    }
  }, [setActiveTab]);

  return {
    swipeIndicator,
    swipeProgress,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  };
};

export default useSwipeNavigation;
