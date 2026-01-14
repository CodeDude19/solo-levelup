import { useState, useEffect, useCallback } from 'react';
import soundManager from '../core/SoundManager';

/**
 * Custom hook for PWA install prompt handling
 * @param {boolean} isOnboarded - Whether user has completed onboarding
 * @param {function} showNotification - Function to show notifications
 * @returns {object} PWA install state and handlers
 */
const usePWAInstall = (isOnboarded, showNotification) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Capture beforeinstallprompt event
  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         window.navigator.standalone ||
                         document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsPwaInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      showNotification('App installed! You now have the full experience.', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [showNotification]);

  // Show install banner after onboarding
  useEffect(() => {
    if (isOnboarded && !isPwaInstalled) {
      const timer = setTimeout(() => setShowInstallBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnboarded, isPwaInstalled]);

  // Handle PWA Install click
  const handleInstallClick = useCallback(async () => {
    soundManager.click();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        soundManager.success();
      }
      setDeferredPrompt(null);
    }

    setShowInstallBanner(false);
  }, [deferredPrompt]);

  // Dismiss banner without installing
  const dismissBanner = useCallback(() => {
    setShowInstallBanner(false);
  }, []);

  return {
    showInstallBanner,
    isPwaInstalled,
    handleInstallClick,
    dismissBanner
  };
};

export default usePWAInstall;
