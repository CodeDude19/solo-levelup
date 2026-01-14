import React, { useState, useRef } from 'react';
import { Shield, Volume2, VolumeX, Smartphone, GripVertical, ChevronRight, Download, RefreshCw, AlertTriangle, X, Home } from 'lucide-react';
import soundManager from '../../../core/SoundManager';
import { getToday } from '../../../utils/formatters';
import { FALLBACK_QUOTES, TAB_INFO } from '../../../config/rewards';

/**
 * Settings - Preferences, data export/import, system reset, tab order
 */
const Settings = ({ state, onResetSystem, onImportData, showNotification, tabOrder, onUpdateTabOrder, soundEnabled, onToggleSound, hapticsEnabled, onToggleHaptics }) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [showTabOrderModal, setShowTabOrderModal] = useState(false);
  const [tempTabOrder, setTempTabOrder] = useState(tabOrder || ['home', 'habits', 'quests', 'shop', 'awakening']);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);

  // Daily quote - pick one based on the day
  const todayQuote = FALLBACK_QUOTES[new Date().getDate() % FALLBACK_QUOTES.length];

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    soundManager.click();
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...tempTabOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    setTempTabOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
    soundManager.click();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch drag handlers for mobile
  const touchStartY = useRef(null);
  const touchedIndex = useRef(null);

  const handleTouchStart = (e, index) => {
    touchStartY.current = e.touches[0].clientY;
    touchedIndex.current = index;
    setDraggedIndex(index);
  };

  const handleTouchMove = (e) => {
    if (touchedIndex.current === null) return;

    const touch = e.touches[0];
    const elements = document.querySelectorAll('[data-tab-item]');

    elements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        setDragOverIndex(index);
      }
    });
  };

  const handleTouchEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newOrder = [...tempTabOrder];
      const [draggedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(dragOverIndex, 0, draggedItem);
      setTempTabOrder(newOrder);
      soundManager.click();
    }

    touchStartY.current = null;
    touchedIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const saveTabOrder = () => {
    onUpdateTabOrder(tempTabOrder);
    setShowTabOrderModal(false);
    showNotification('Tab order saved!', 'success');
  };

  const handleReset = () => {
    if (resetConfirm === 'I give up!') {
      soundManager.penalty();
      onResetSystem();
    } else {
      soundManager.error();
      showNotification('Type exactly "I give up!" to reset', 'error');
    }
  };

  const handleExport = () => {
    soundManager.click();
    try {
      // Create export object with all app data
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        appName: 'THE SYSTEM',
        data: {
          ...state,
          settings: {
            tabOrder: tabOrder,
            soundEnabled: localStorage.getItem('theSystemSound') !== 'false'
          }
        }
      };

      // Create blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `the-system-backup-${getToday()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      soundManager.success();
      showNotification('Data exported successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      soundManager.error();
      showNotification('Export failed!', 'error');
    }
  };

  const handleImport = () => {
    soundManager.click();
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);

        // Validate the imported data
        if (!importedData.appName || importedData.appName !== 'THE SYSTEM') {
          throw new Error('Invalid backup file');
        }

        if (!importedData.data) {
          throw new Error('No data found in backup');
        }

        // Extract settings if present
        const settings = importedData.data.settings;
        if (settings?.tabOrder) {
          onUpdateTabOrder(settings.tabOrder);
        }
        if (settings?.soundEnabled !== undefined) {
          localStorage.setItem('theSystemSound', settings.soundEnabled.toString());
        }

        // Remove settings from data before importing state
        const { settings: _, ...stateData } = importedData.data;

        // Import the state data
        onImportData(stateData);

        soundManager.success();
        showNotification('Data imported successfully!', 'success');
      } catch (error) {
        console.error('Import failed:', error);
        soundManager.error();
        showNotification('Invalid backup file!', 'error');
      }
    };

    reader.onerror = () => {
      soundManager.error();
      showNotification('Failed to read file!', 'error');
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="h-full overflow-y-auto pb-4 px-4">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="py-4">
        <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Shield className="text-cyber-cyan" /> Settings
        </h2>
      </div>

      {/* Daily Reminder Quote */}
      <div className="bg-cyber-dark rounded-xl p-3 mb-4 border-l-2 border-cyber-purple">
        <p className="text-gray-300 text-sm italic leading-relaxed">"{todayQuote.q}"</p>
        <p className="text-cyber-purple text-xs mt-2 text-right">— {todayQuote.a}</p>
      </div>

      {/* Preferences Section */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Preferences</p>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${soundEnabled ? 'bg-cyber-cyan/20' : 'bg-gray-700/50'}`}>
              {soundEnabled ? <Volume2 size={16} className="text-cyber-cyan" /> : <VolumeX size={16} className="text-gray-500" />}
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Sound Effects</p>
              <p className="text-gray-500 text-xs">UI sounds and feedback</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${soundEnabled ? 'bg-cyber-cyan' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${soundEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Vibration Toggle */}
        <button
          onClick={onToggleHaptics}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${hapticsEnabled ? 'bg-cyber-purple/20' : 'bg-gray-700/50'}`}>
              <Smartphone size={16} className={hapticsEnabled ? 'text-cyber-purple' : 'text-gray-500'} />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Vibration</p>
              <p className="text-gray-500 text-xs">Haptic feedback on actions</p>
            </div>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${hapticsEnabled ? 'bg-cyber-purple' : 'bg-gray-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hapticsEnabled ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        {/* Tab Order */}
        <button
          onClick={() => {
            soundManager.click();
            setTempTabOrder(tabOrder || ['home', 'habits', 'quests', 'shop', 'awakening']);
            setShowTabOrderModal(true);
          }}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-gold/20 flex items-center justify-center">
              <GripVertical size={16} className="text-cyber-gold" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Tab Order</p>
              <p className="text-gray-500 text-xs">Customize navigation order</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Data Management Section */}
      <div className="mb-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Data</p>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all mb-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-green/20 flex items-center justify-center">
              <Download size={16} className="text-cyber-green" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Export Data</p>
              <p className="text-gray-500 text-xs">Download your progress as JSON</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>

        {/* Import JSON */}
        <button
          onClick={handleImport}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-purple/20 flex items-center justify-center">
              <Download size={16} className="text-cyber-purple rotate-180" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Import Data</p>
              <p className="text-gray-500 text-xs">Restore from JSON backup</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Danger Zone */}
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Danger Zone</p>
        <button
          onClick={() => {
            soundManager.click();
            setShowResetWarning(true);
          }}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-red/10 transition-all border border-transparent hover:border-cyber-red/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-red/20 flex items-center justify-center">
              <RefreshCw size={16} className="text-cyber-red" />
            </div>
            <div className="text-left">
              <p className="text-cyber-red text-sm font-medium">Reset System</p>
              <p className="text-gray-500 text-xs">Delete all progress permanently</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Credits */}
      <div className="mt-4">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">About</p>
        <a
          href="https://www.linkedin.com/in/yasserarafat007"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => soundManager.click()}
          className="w-full bg-cyber-dark rounded-lg flex items-center justify-between p-3 hover:bg-cyber-gray/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <img
              src="https://media.licdn.com/dms/image/v2/D4D03AQEaCeHaN-cHzQ/profile-displayphoto-crop_800_800/B4DZjbqFDCGgAI-/0/1756031899355?e=1769644800&v=beta&t=SO7Zsqb1K4h9U1g55pPa4mdgjy6CACrKa9JsPnKunPk"
              alt="Yasser Arafat"
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Made by Yasser Arafat</p>
              <p className="text-gray-500 text-xs">Connect on LinkedIn</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-500 group-hover:text-cyber-cyan transition-colors" />
        </a>
      </div>

      {/* Reset Confirmation Modal - Compact */}
      {showResetWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-xs bg-cyber-dark border border-cyber-red/50 rounded-xl p-4 animate-modalPop">
            <div className="flex items-center justify-center gap-2 text-cyber-red mb-2">
              <AlertTriangle size={18} />
              <h3 className="font-display font-bold text-sm">RESET SYSTEM?</h3>
            </div>
            <p className="text-gray-400 text-xs text-center mb-3">
              All progress will be deleted permanently.
            </p>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder='Type "I give up!"'
              className="w-full bg-cyber-gray text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-cyber-red mb-3 text-center"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.click();
                  setShowResetWarning(false);
                  setResetConfirm('');
                }}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetConfirm !== 'I give up!'}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  resetConfirm === 'I give up!'
                    ? 'bg-cyber-red text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Order Modal */}
      {showTabOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-xs bg-cyber-dark border border-cyber-cyan/30 rounded-xl p-4 animate-modalPop">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-cyber-cyan flex items-center gap-2">
                <GripVertical size={16} /> Tab Order
              </h3>
              <button
                onClick={() => {
                  soundManager.click();
                  setShowTabOrderModal(false);
                }}
                className="text-gray-500 hover:text-white p-1"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-gray-500 text-xs mb-3">Drag to reorder tabs</p>

            <div className="space-y-2 mb-4" onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              {tempTabOrder.map((tabId, index) => {
                const tabInfo = TAB_INFO[tabId];
                const TabIcon = tabInfo?.icon || Home;
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index && draggedIndex !== index;

                return (
                  <div
                    key={tabId}
                    data-tab-item
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    className={`flex items-center gap-2 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-all ${
                      isDragging
                        ? 'bg-cyber-cyan/20 opacity-50 scale-95'
                        : isDragOver
                          ? 'bg-cyber-cyan/30 border-2 border-cyber-cyan border-dashed'
                          : 'bg-cyber-gray/50 hover:bg-cyber-gray/70'
                    }`}
                  >
                    <div className="text-gray-500 hover:text-cyber-cyan transition-colors p-1">
                      <GripVertical size={16} />
                    </div>
                    <span className="text-gray-500 text-xs w-4">{index + 1}</span>
                    <div className="w-7 h-7 rounded bg-cyber-cyan/20 flex items-center justify-center">
                      <TabIcon size={14} className="text-cyber-cyan" />
                    </div>
                    <span className="text-white text-sm flex-1 select-none">{tabInfo?.label || tabId}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundManager.click();
                  setShowTabOrderModal(false);
                }}
                className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-400 text-sm hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveTabOrder}
                className="flex-1 py-2 rounded-lg bg-cyber-cyan text-black text-sm font-bold btn-press hover:shadow-neon-cyan transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
