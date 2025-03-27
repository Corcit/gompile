/**
 * User Profile model
 * Represents a user's profile information in the system
 */
export interface UserProfile {
  id: string;
  nickname: string;
  avatarId: string;
  experienceLevel: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Achievement model
 * Represents a badge or achievement that a user can earn
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  unlockedAt?: string;
}

/**
 * User Stats model
 * Represents a user's statistics in the system
 */
export interface UserStats {
  totalAttendance: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  lastAttendance?: string;
}

/**
 * User Settings model
 * Represents a user's application settings
 */
export interface UserSettings {
  notifications?: {
    enabled: boolean;
  };
  showOnLeaderboard?: boolean;
  nickname?: string;
  email?: string;
  avatar?: {
    id: string;
    url: string;
  };
}

export type ExtendedUserSettings = UserSettings;

/**
 * Create a default user settings object
 */
export const createDefaultUserSettings = (): UserSettings => ({
  notifications: {
    enabled: true,
  },
  showOnLeaderboard: true,
  nickname: '',
  email: '',
  avatar: {
    id: '',
    url: ''
  }
}); 