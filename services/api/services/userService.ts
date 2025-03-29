import { UserProfile, Achievement, UserStats, UserSettings } from '../models/UserProfile';

/**
 * Service for handling user-related operations
 */
export default class UserService {
  private apiClient: any;
  
  constructor(apiClient: any) {
    this.apiClient = apiClient;
  }

  /**
   * Gets the current user's profile
   * @returns User profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    return this.apiClient.get('/users/me');
  }

  /**
   * Updates the current user's profile
   * @param profileData Data to update
   * @returns Updated user profile
   */
  async updateProfile(profileData: Partial<{
    nickname: string;
    avatarId: string;
  }>): Promise<UserProfile> {
    return this.apiClient.put('/users/profile', profileData);
  }

  /**
   * Gets the current user's statistics
   * @returns User statistics
   */
  async getUserStats(): Promise<UserStats> {
    return this.apiClient.get('/users/stats');
  }

  /**
   * Gets the current user's settings
   * @returns User settings
   */
  async getUserSettings(): Promise<UserSettings> {
    // Try to get settings from API
    const settings = await this.apiClient.get('/users/settings');
    return settings;
  }

  /**
   * Updates the current user's settings
   * @param settings Settings to update
   * @returns Updated settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return this.apiClient.put('/users/settings', settings);
  }

  /**
   * Gets the current user's achievements
   * @returns List of achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    return this.apiClient.get('/users/achievements');
  }

  /**
   * Gets a specific achievement by ID
   * @param achievementId Achievement ID
   * @returns Achievement details
   */
  async getAchievement(achievementId: string): Promise<Achievement> {
    return this.apiClient.get(`/users/achievements/${achievementId}`);
  }

  /**
   * Gets all available avatars
   * @returns List of avatars
   */
  async getAvatars(): Promise<{
    id: string;
    name: string;
    imageUrl: string;
    category?: string;
    isUnlocked: boolean;
    unlocksAt?: string;
  }[]> {
    return this.apiClient.get('/users/avatars');
  }

  /**
   * Updates the user's avatar
   * @param avatarId Avatar ID
   * @returns Success status
   */
  async updateAvatar(avatarId: string): Promise<{success: boolean}> {
    return this.apiClient.put('/users/avatar', { avatarId });
  }

  /**
   * Gets the user's streak information
   * @returns Streak data
   */
  async getStreak(): Promise<{
    current: number;
    longest: number;
    lastAttendance?: Date;
    nextMilestone?: number;
    history: {
      date: string;
      attended: boolean;
    }[];
  }> {
    return this.apiClient.get('/users/streak');
  }

  /**
   * Gets the leaderboard
   * @param timeframe Timeframe (weekly, monthly, allTime)
   * @param limit Number of entries to return
   * @param offset Offset for pagination
   * @returns Leaderboard entries
   */
  async getLeaderboard(
    timeframe: 'weekly' | 'monthly' | 'allTime' = 'weekly',
    limit = 10,
    offset = 0
  ): Promise<{
    entries: {
      userId: string;
      nickname: string;
      avatarId: string;
      rank: number;
      score: number;
      achievements: Achievement[];
    }[];
    total: number;
  }> {
    return this.apiClient.get('/users/leaderboard', {
      params: { timeframe, limit, offset }
    });
  }

  /**
   * Gets the user's leaderboard rank
   * @param timeframe Optional timeframe (weekly, monthly, allTime)
   * @returns Ranking information
   */
  async getLeaderboardRank(timeframe: 'weekly' | 'monthly' | 'allTime' = 'weekly'): Promise<{
    rank: number;
    score: number;
    totalParticipants: number;
  }> {
    return this.apiClient.get('/users/leaderboard/rank', {
      params: { timeframe }
    });
  }

  /**
   * Updates the user's password
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Success status
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{success: boolean}> {
    return this.apiClient.put('/users/password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Signs in with a password
   * @param nickname User's nickname
   * @param password User's password
   * @returns Authentication result with token
   */
  async signIn(nickname: string, password: string): Promise<{
    token: string;
    user: UserProfile;
  }> {
    return this.apiClient.post('/auth/signin', {
      nickname,
      password
    });
  }

  /**
   * Signs up a new user
   * @param userData User data
   * @returns Authentication result with token
   */
  async signUp(userData: {
    nickname: string;
    password: string;
    avatarId: string;
    experienceLevel: number;
  }): Promise<{
    token: string;
    user: UserProfile;
  }> {
    return this.apiClient.post('/auth/signup', userData);
  }

  /**
   * Signs out the current user
   * @returns Success status
   */
  async signOut(): Promise<{success: boolean}> {
    return this.apiClient.post('/auth/signout', {});
  }

  /**
   * Requests a password reset
   * @param nickname User's nickname
   * @returns Success status
   */
  async requestPasswordReset(nickname: string): Promise<{success: boolean}> {
    return this.apiClient.post('/auth/reset-password-request', {
      nickname
    });
  }

  /**
   * Resets the password using a token
   * @param token Reset token
   * @param newPassword New password
   * @returns Success status
   */
  async resetPassword(token: string, newPassword: string): Promise<{success: boolean}> {
    return this.apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
  }
} 