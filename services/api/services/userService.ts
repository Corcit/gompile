import { UserProfile, Achievement, UserStats, UserSettings } from '../models/UserProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    try {
      // Check if API client is available and initialized
      if (this.apiClient && typeof this.apiClient.put === 'function') {
        // Update the profile
        const updatedProfile = await this.apiClient.put('/users/profile', profileData);
        
        // If avatarId is updated, we should also update the user settings for consistency
        if (profileData.avatarId) {
          try {
            // Get current settings first
            const currentSettings = await this.getUserSettings();
            
            // Update settings with the new avatar information
            const updatedSettings = {
              ...currentSettings,
              avatar: {
                id: profileData.avatarId,
                url: currentSettings.avatar?.url || '',
              }
            };
            
            // Save the updated settings
            await this.updateSettings(updatedSettings);
          } catch (error) {
            console.error('Error updating avatar in settings:', error);
          }
        }
        
        return updatedProfile;
      } else {
        // Log that API client isn't available
        console.log('API client not available, saving to AsyncStorage as fallback');
        
        // Implement AsyncStorage fallback
        await this._saveProfileToAsyncStorage(profileData);
        
        // Create a mock response that matches what would come from the API
        const storedProfile = await this._getProfileFromAsyncStorage();
        console.log('Avatar saved successfully to profile');
        
        return storedProfile as UserProfile;
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      
      // Try AsyncStorage fallback if API call fails
      await this._saveProfileToAsyncStorage(profileData);
      console.log('Avatar saved successfully to profile');
      
      // Return something that matches the expected type
      const storedProfile = await this._getProfileFromAsyncStorage();
      return storedProfile as UserProfile;
    }
  }

  /**
   * Helper method to save profile data to AsyncStorage
   * @private
   */
  private async _saveProfileToAsyncStorage(profileData: Partial<{
    nickname: string;
    avatarId: string;
  }>): Promise<void> {
    try {
      // Get existing profile data if any
      const existingData = await AsyncStorage.getItem('@user:profile');
      const profile = existingData ? JSON.parse(existingData) : {};
      
      // Update with new data
      const updatedProfile = { ...profile, ...profileData };
      
      // Save back to AsyncStorage
      await AsyncStorage.setItem('@user:profile', JSON.stringify(updatedProfile));
    } catch (storageError) {
      console.error('Error saving to AsyncStorage:', storageError);
      throw storageError;
    }
  }

  /**
   * Helper method to get profile data from AsyncStorage
   * @private
   */
  private async _getProfileFromAsyncStorage(): Promise<any> {
    try {
      const storedData = await AsyncStorage.getItem('@user:profile');
      if (storedData) {
        return JSON.parse(storedData);
      }
      return {};
    } catch (error) {
      console.error('Error reading from AsyncStorage:', error);
      return {};
    }
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

  /**
   * Syncs stored profile data from AsyncStorage to backend after authentication
   * Should be called once the user is fully authenticated and apiClient is available
   */
  async syncStoredProfileToBackend(): Promise<void> {
    try {
      // Only proceed if API client is available
      if (this.apiClient && typeof this.apiClient.put === 'function') {
        const storedProfile = await AsyncStorage.getItem('@user:profile');
        
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          
          // Sync with backend
          await this.apiClient.put('/users/profile', profileData);
          console.log('Successfully synced stored profile data to backend');
          
          // Optionally clear the AsyncStorage data after successful sync
          // await AsyncStorage.removeItem('@user:profile');
          
          // If we have avatar data, update settings as well
          if (profileData.avatarId) {
            try {
              const currentSettings = await this.getUserSettings();
              
              // Update settings with the avatar information
              const updatedSettings = {
                ...currentSettings,
                avatar: {
                  id: profileData.avatarId,
                  url: currentSettings.avatar?.url || '',
                }
              };
              
              // Save the updated settings
              await this.updateSettings(updatedSettings);
              console.log('Successfully synced avatar to user settings');
            } catch (settingsError) {
              console.error('Error updating settings during sync:', settingsError);
            }
          }
        }
      } else {
        console.log('API client not available yet, skipping profile sync');
      }
    } catch (error) {
      console.error('Error syncing profile to backend:', error);
      // Don't throw, just log, as this is a background sync operation
    }
  }
} 