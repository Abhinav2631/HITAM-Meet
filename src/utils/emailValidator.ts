
/**
 * Validates if an email address is from the hitam.org domain
 */
export const validateHitamEmail = (email: string): boolean => {
  if (!email) return false;
  
  // Check basic email format first
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return false;
  
  // Check if the domain is hitam.org
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === 'hitam.org';
};
