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
  notifications: {
    enabled: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  profile: {
    nickname: string;
    avatarId: string;
    avatarUrl?: string;
  };
  showOnLeaderboard?: boolean;
}

export type ExtendedUserSettings = UserSettings;

/**
 * Create a default user settings object
 */
export const createDefaultUserSettings = (): UserSettings => ({
  notifications: {
    enabled: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  profile: {
    nickname: '',
    avatarId: '',
  },
  showOnLeaderboard: true,
}); 