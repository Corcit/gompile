/**
 * User Profile model
 * Represents a user's profile information in the system
 */
export interface UserProfile {
  userId: string;        // Unique identifier for the user
  nickname: string;      // User's chosen nickname
  avatarId: string;      // ID of the selected avatar
  protestCount: number;  // Number of protests attended
  joinDate: Date;        // Date when the user joined
  streakData: {
    currentStreak: number;  // Current consecutive attendance streak
    longestStreak: number;  // Longest streak ever achieved
    lastAttendance: Date;   // Date of last attendance
  };
  achievements: string[];   // Array of achievement IDs
  subscriptions: string[];  // Array of channel IDs the user is subscribed to
}

/**
 * Achievement model
 * Represents a badge or achievement that a user can earn
 */
export interface Achievement {
  id: string;              // Unique identifier for the achievement
  name: string;            // Name of the achievement
  description: string;     // Description of how to earn it
  iconUrl: string;         // URL to the achievement icon
  requirement: {
    type: 'attendance' | 'streak' | 'participation' | 'special'; // Type of achievement
    count?: number;        // Required count (e.g., attend 5 protests)
    condition?: string;    // Special condition if applicable
  };
  unlockedAt?: Date;       // When the user unlocked this achievement
}

/**
 * User Stats model
 * Represents a user's statistics in the system
 */
export interface UserStats {
  protestsAttended: number;      // Total number of protests attended
  rank: string;                  // User's current rank
  badges: number;                // Number of badges earned
  streak: number;                // Current streak
  totalUsers: number;            // Total number of users in the system
  userRank: number;              // User's position in the leaderboard
  monthlyProtests: number;       // Protests attended this month
  weeklyProtests: number;        // Protests attended this week
  percentile: number;            // Percentile ranking compared to others
}

/**
 * User Settings model
 * Represents a user's application settings
 */
export interface UserSettings {
  notificationsEnabled: boolean;           // Whether notifications are enabled
  locationEnabled: boolean;                // Whether location services are enabled
  channelNotifications: {                  // Notification settings per channel
    [channelId: string]: {
      enabled: boolean;                    // Whether notifications are enabled for this channel
      priority: 'low' | 'medium' | 'high'; // Priority of notifications
    }
  };
  dailyReminderEnabled: boolean;           // Whether daily reminders are enabled
  dailyReminderTime?: string;              // Time of day for daily reminders (HH:MM)
  shareAttendanceByDefault: boolean;       // Whether to share attendance by default
  theme: 'light' | 'dark' | 'system';      // User's preferred theme
}

/**
 * Create a default user settings object
 */
export function createDefaultUserSettings(): UserSettings {
  return {
    notificationsEnabled: true,
    locationEnabled: true,
    channelNotifications: {},
    dailyReminderEnabled: false,
    shareAttendanceByDefault: false,
    theme: 'system'
  };
} 