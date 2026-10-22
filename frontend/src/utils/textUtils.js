/**
 * Utility functions for name/text input formatting
 */

/**
 * Capitalizes the first letter of each word/hyphenated part using Azerbaijani locale.
 * Preserves trailing spaces so user typing is smooth and uninterrupted.
 *
 * @param {string} value 
 * @returns {string}
 */
export const formatNameInput = (value) => {
  if (!value || typeof value !== 'string') return '';
  
  // 1. Only allow letters (Latin, Azerbaijani, Cyrillic), single spaces, and hyphens
  let cleaned = value.replace(/[^a-zA-ZəƏıIİiöÖüÜçÇşŞğĞа-яА-ЯёЁ\s-]/g, '');
  
  // 2. Prevent leading spaces
  cleaned = cleaned.replace(/^\s+/, '');
  
  // 3. Prevent multiple consecutive spaces (keep at most a single space between words)
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // 4. Capitalize first letter of each word and hyphen-separated parts
  const words = cleaned.split(' ');
  const capitalizedWords = words.map((word) => {
    if (!word) return '';
    return word
      .split('-')
      .map((part) => {
        if (!part) return '';
        return part.charAt(0).toLocaleUpperCase('az') + part.slice(1);
      })
      .join('-');
  });

  return capitalizedWords.join(' ');
};

/**
 * Handles key down event on name inputs:
 * - Prevents non-letter characters (except navigation, spaces, hyphens)
 * - Prevents leading space or consecutive spaces
 * - Does NOT block space after writing words so user can type naturally!
 * 
 * @param {KeyboardEvent} e 
 */
export const handleNameKeyDown = (e) => {
  // Allow navigation and system shortcuts
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.key === 'Backspace' ||
    e.key === 'Delete' ||
    e.key === 'Tab' ||
    e.key === 'Enter' ||
    e.key === 'Escape' ||
    (e.key && e.key.startsWith('Arrow'))
  ) {
    return;
  }

  // Handle Space key
  if (e.key === ' ' || e.code === 'Space') {
    const val = (e.target && e.target.value) || '';
    // Prevent space at start or consecutive spaces
    if (val.length === 0 || val.endsWith(' ')) {
      e.preventDefault();
    }
    return;
  }

  // For printable single characters, only allow letters and hyphen
  if (e.key && e.key.length === 1) {
    const isAllowed = /^[a-zA-ZəƏıIİiöÖüÜçÇşŞğĞа-яА-ЯёЁ-]$/.test(e.key);
    if (!isAllowed) {
      e.preventDefault();
    }
  }
};
