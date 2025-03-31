import { Colors } from './Colors';

/**
 * Gets the color for an avatar based on its ID
 * @param avatarId The avatar ID
 * @returns The color to use for the avatar background
 */
export const getAvatarColor = (avatarId: string): string => {
  if (!avatarId) return Colors.dark.card;
  
  if (avatarId.includes('fallback-')) {
    const parts = avatarId.split('-');
    if (parts.length > 1) {
      const num = parseInt(parts[1], 10);
      const colors = [
        Colors.dark.primary,
        Colors.dark.secondary,
        Colors.dark.accent,
        Colors.dark.info,
        Colors.dark.success,
        '#723333', // darker red
        '#a75151', // lighter red
        '#c9a038', // darker gold
        '#f7cb68', // lighter gold
        '#2c5a89', // darker blue
        '#4c96e1', // lighter blue
        '#0d0e16', // darker navy
        '#1d2033', // lighter navy
        '#252944', // darker purple
        '#3e4772', // lighter purple
        '#8a9199', // darker gray
        '#cbd3dc', // lighter gray
      ];
      return colors[num % colors.length];
    }
  }
  
  // For numeric IDs
  const numId = parseInt(avatarId, 10);
  if (!isNaN(numId)) {
    const colors = [
      Colors.dark.primary,
      Colors.dark.secondary,
      Colors.dark.accent,
      Colors.dark.info,
      Colors.dark.success,
    ];
    return colors[numId % colors.length];
  }
  
  // Default avatar color
  return Colors.dark.card;
};

/**
 * Generates a consistent color based on an avatar ID or name
 * @param identifier The avatar identifier (ID or name)
 * @returns A consistent color for the avatar
 */
export const generateConsistentAvatarColor = (identifier: string): string => {
  if (!identifier) return Colors.dark.card;
  
  // Generate a simple hash from the string
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Use the hash to select a color
  const colors = [
    Colors.dark.primary,
    Colors.dark.secondary,
    Colors.dark.accent,
    Colors.dark.info,
    Colors.dark.success,
    '#723333', // darker red
    '#a75151', // lighter red
    '#c9a038', // darker gold
    '#f7cb68', // lighter gold
    '#2c5a89', // darker blue
    '#4c96e1', // lighter blue
  ];
  
  // Make sure we get a positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}; 