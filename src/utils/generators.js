/**
 * Utility functions for generating unique IDs
 */

/**
 * Generate a random unique ID
 * @returns {string} A random alphanumeric string
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);
