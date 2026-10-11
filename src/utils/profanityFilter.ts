
/**
 * Basic profanity filter for demonstration purposes.
 * In a real app, this would be replaced with a more comprehensive AI solution.
 */

// Simple list of banned words for demonstration
const BANNED_WORDS = [
  'badword1',
  'badword2',
  'offensive',
  'inappropriate',
];

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  
  // Check if any banned word is in the text
  return BANNED_WORDS.some(word => lowerText.includes(word));
};

export const filterProfanity = (text: string): string => {
  if (!text) return text;
  
  let filteredText = text;
  
  BANNED_WORDS.forEach(word => {
    // Create a regular expression to match the word with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    // Replace the word with asterisks
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });
  
  return filteredText;
};
