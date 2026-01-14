/**
 * Sound Context - React Context wrapper for SoundManager singleton
 */

import { createContext } from 'react';
import soundManager from '../core/SoundManager';

// Create and export sound context
export const SoundContext = createContext(soundManager);
export default SoundContext;
