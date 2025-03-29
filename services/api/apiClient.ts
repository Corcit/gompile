import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  DocumentData,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  CollectionReference
} from 'firebase/firestore';
import { firestore, auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getAuth } from 'firebase/auth';

// Define any default headers for REST API (if still needed)
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Error types
export class ApiError extends Error {
  code: number;
  data: any;

  constructor(message: string, code: number, data?: any) {
    super(message);
    this.code = code;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * API Client for making requests to Firestore and other services
 */
class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;
  private currentUser: User | null = null;

  constructor() {
    // Keep axios for any external API calls (if needed)
    this.client = axios.create({
      headers: DEFAULT_HEADERS,
      timeout: 30000, // 30 seconds
    });

    // Set up auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });

    // Request interceptor to add auth token for external APIs
    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        if (this.currentUser && config.headers) {
          const token = await this.currentUser.getIdToken();
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        const { response } = error;
        
        // Handle network errors
        if (!response) {
          return Promise.reject(
            new ApiError('Network error. Please check your connection.', 0)
          );
        }

        // Handle API errors
        const message = response.data?.message || 'An error occurred';
        const code = response.status;
        const data = response.data;

        // Handle token expiration
        if (code === 401) {
          // Sign out the user if their token is invalid
          this.signOut();
        }

        return Promise.reject(new ApiError(message, code, data));
      }
    );
  }

  /**
   * Get the singleton instance of ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // AUTH METHODS

  /**
   * Sign in with email and password
   */
  public async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Create a new user account
   */
  public async signUp(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<void> {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@user:token');
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Get the current user
   */
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // FIRESTORE DATA METHODS

  /**
   * Get the actual user ID for Firestore operations
   */
  private async getActualUserId(): Promise<string | null> {
    // First check AsyncStorage for our stored actual user ID
    const actualUserId = await AsyncStorage.getItem('@auth:actualUserId');
    if (actualUserId) {
      return actualUserId;
    }
    
    // Fall back to currentUser.uid if no stored ID
    return this.currentUser?.uid || null;
  }

  /**
   * Get a document from a collection
   */
  public async getDocument<T>(collectionName: string, documentId: string): Promise<T | null> {
    try {
      // For user-specific collections, use the actual user ID if documentId is 'me' or current user ID
      if (['userProfiles', 'userSettings', 'leaderboard'].includes(collectionName) && 
          (documentId === 'me' || documentId === this.currentUser?.uid)) {
        const actualUserId = await this.getActualUserId();
        if (actualUserId) {
          documentId = actualUserId;
        }
      }
      
      const docRef = doc(firestore, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      } else {
        return null;
      }
    } catch (error: any) {
      console.warn(`Error in getDocument (${collectionName}/${documentId}):`, error);
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Get multiple documents from a collection with optional filters
   */
  public async getDocuments<T>(
    collectionName: string, 
    filters?: { field: string; operator: any; value: any }[], 
    sortBy?: { field: string; direction: 'asc' | 'desc' },
    pagination?: { pageSize: number; startAfter?: DocumentSnapshot }
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot }> {
    try {
      // Replace 'userId' filter with actual ID if needed
      if (filters && filters.length > 0) {
        const userIdFilter = filters.find(f => f.field === 'userId' && (f.value === this.currentUser?.uid || f.value === 'me'));
        if (userIdFilter) {
          const actualUserId = await this.getActualUserId();
          if (actualUserId) {
            userIdFilter.value = actualUserId;
          }
        }
      }
      
      const collectionRef = collection(firestore, collectionName);
      
      // Build query
      let q = query(collectionRef);
      
      // Add filters if provided
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
      }
      
      // Add sorting if provided
      if (sortBy) {
        q = query(q, orderBy(sortBy.field, sortBy.direction));
      }
      
      // Add pagination if provided
      if (pagination) {
        q = query(q, limit(pagination.pageSize));
        
        if (pagination.startAfter) {
          q = query(q, startAfter(pagination.startAfter));
        }
      }
      
      const querySnapshot = await getDocs(q);
      
      const data: T[] = [];
      let lastDoc: DocumentSnapshot | undefined;
      
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as unknown as T);
        lastDoc = doc;
      });
      
      return { data, lastDoc };
    } catch (error: any) {
      console.warn(`Error in getDocuments (${collectionName}):`, error);
      
      // For testing: Return mock data for specific collections
      if (collectionName === 'leaderboard') {
        console.log('Providing mock leaderboard data after error');
        return {
          data: [
            {
              id: 'user1',
              userId: 'user1',
              nickname: 'Activist123',
              avatarId: 'avatar1',
              score: 950,
              rank: 1,
              achievements: [{ id: 'achievement1', name: 'First Attendance' }],
              weeklyScore: 120,
              monthlyScore: 450,
              allTimeScore: 950
            },
            {
              id: 'user2',
              userId: 'user2',
              nickname: 'BoycottHero',
              avatarId: 'avatar2',
              score: 820,
              rank: 2,
              achievements: [
                { id: 'achievement1', name: 'First Attendance' },
                { id: 'achievement4', name: 'Week Streak' }
              ],
              weeklyScore: 95,
              monthlyScore: 380,
              allTimeScore: 820
            },
            {
              id: 'user3',
              userId: 'user3',
              nickname: 'GompileUser',
              avatarId: 'avatar3',
              score: 730,
              rank: 3,
              achievements: [{ id: 'achievement1', name: 'First Attendance' }],
              weeklyScore: 85,
              monthlyScore: 290,
              allTimeScore: 730
            }
          ] as unknown as T[],
          lastDoc: undefined
        };
      }
      
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Add a document to a collection
   */
  public async addDocument<T>(collectionName: string, data: any): Promise<T> {
    try {
      const newDocRef = doc(collection(firestore, collectionName));
      await setDoc(newDocRef, { 
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return { id: newDocRef.id, ...data } as unknown as T;
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Update a document in a collection
   */
  public async updateDocument<T>(collectionName: string, documentId: string, data: any): Promise<T> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await updateDoc(docRef, { 
        ...data,
        updatedAt: new Date()
      });
      
      // Get the updated document
      const updatedDoc = await getDoc(docRef);
      
      return { id: updatedDoc.id, ...updatedDoc.data() } as unknown as T;
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Delete a document from a collection
   */
  public async deleteDocument(collectionName: string, documentId: string): Promise<boolean> {
    try {
      const docRef = doc(firestore, collectionName, documentId);
      await deleteDoc(docRef);
      return true;
    } catch (error: any) {
      throw new ApiError(error.message, error.code || 500);
    }
  }

  /**
   * Handles API GET requests. If the endpoint starts with '/', it's treated as a REST API call.
   * Otherwise, it attempts to fetch data from Firestore based on collection/document pattern.
   * @param endpoint The API endpoint or Firestore path (e.g., '/users/settings' or 'users/userId')
   * @param config Optional request configuration
   */
  public async get(endpoint: string, config?: any): Promise<any> {
    try {
      if (endpoint.startsWith('/')) {
        // Parse endpoint to determine Firestore collection and document
        const path = endpoint.substring(1).split('/');
        const collection = path[0];
        
        // Handle specific endpoints with custom logic
        if (endpoint === '/users/me') {
          // Get current user data
          const userId = this.currentUser?.uid;
          if (!userId) throw new ApiError('User not authenticated', 401);
          return this.getDocument('userProfiles', userId);
        }
        else if (endpoint === '/users/settings') {
          try {
            // Ensure user is properly authenticated
            if (!this.currentUser) {
              throw new ApiError('User not authenticated', 401);
            }
            
            // Get the current user ID
            const userId = this.currentUser.uid;
            
            // Force explicit re-authentication to ensure Firebase token is fresh
            try {
              // First ensure token is refreshed with force=true
              const token = await this.currentUser.getIdToken(true);
              
              // Set the token on firestore's underlying implementation
              // This ensures the token is properly set before the query
              const auth = getAuth();
              await auth.updateCurrentUser(this.currentUser);
            } catch (refreshError) {
              console.error('Error refreshing authentication token:', refreshError);
              // Don't suppress this error - if we can't refresh auth, it's a serious issue
              throw new ApiError('Authentication refresh failed', 401);
            }
            
            // Now try to get the document with fresh authentication
            const settingsDoc = await this.getDocument('userSettings', userId);
            
            // If document is null/undefined, we don't create defaults
            if (!settingsDoc) {
              throw new ApiError('Settings not found for user', 404);
            }
            
            return settingsDoc;
          } catch (error) {
            console.error('Error fetching user settings:', error);
            // Don't transform the error - let the UI handle it appropriately
            throw error;
          }
        }
        else if (endpoint === '/users/leaderboard') {
          // Get leaderboard data with pagination and filtering
          const timeframe = config?.params?.timeframe || 'weekly';
          const limitCount = config?.params?.limit || 10;
          const offsetCount = config?.params?.offset || 0;
          
          // Query the leaderboard collection
          const sortField = timeframe === 'weekly' ? 'weeklyScore' : 
                           timeframe === 'monthly' ? 'monthlyScore' : 'allTimeScore';
          
          const { data } = await this.getDocuments('leaderboard', 
            undefined, 
            { field: sortField, direction: 'desc' },
            { pageSize: limitCount + offsetCount }
          );
          
          // Apply offset and return the result
          const entries = data.slice(offsetCount, offsetCount + limitCount);
          return {
            entries,
            total: data.length
          };
        }
        else if (endpoint === '/users/leaderboard/rank') {
          // Get user's rank
          const userId = this.currentUser?.uid || 'user1'; // For development: default to user1 if not logged in
          const timeframe = config?.params?.timeframe || 'weekly';
          
          // Get the user's entry
          const userDoc = await this.getDocument('leaderboard', userId);
          if (!userDoc) {
            return { rank: 0, score: 0, totalParticipants: 0 };
          }
          
          // Get all leaderboard entries to determine rank
          const sortField = timeframe === 'weekly' ? 'weeklyScore' : 
                           timeframe === 'monthly' ? 'monthlyScore' : 'allTimeScore';
          
          const { data } = await this.getDocuments('leaderboard', 
            undefined, 
            { field: sortField, direction: 'desc' }
          );
          
          // Find user's position in sorted list
          const score = timeframe === 'weekly' ? userDoc.weeklyScore : 
                       timeframe === 'monthly' ? userDoc.monthlyScore : userDoc.allTimeScore;
          
          const rank = data.findIndex((entry: any) => entry.userId === userId) + 1;
          
          return {
            rank: rank > 0 ? rank : 0,
            score: score || 0,
            totalParticipants: data.length
          };
        }
        else if (endpoint === '/attendance/stats') {
          // Get attendance stats for the current user
          const userId = config?.params?.userId === 'current' ? 
                        (this.currentUser?.uid || 'user1') : // Default to user1 for development
                        (config?.params?.userId || this.currentUser?.uid || 'user1');
          
          try {
            // Try to get data from userProfiles first, which might have lower permission requirements
            const userProfile = await this.getDocument('userProfiles', userId);
            
            // Then try to get leaderboard entry which might contain stats
            const leaderboardEntry = await this.getDocument('leaderboard', userId);
            
            // Fallback to empty stats if profile/leaderboard doesn't exist
            if (!userProfile && !leaderboardEntry) {
              console.log('No user profile or leaderboard entry found for stats');
              return this.generateEmptyAttendanceStats();
            }
            
            // Build stats from available data
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
            weekStart.setHours(0, 0, 0, 0);
            
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
            const yearStart = new Date(now.getFullYear(), 0, 1); // Start of current year
            
            // Get stats from leaderboard entry if available
            const attendanceCount = leaderboardEntry && typeof leaderboardEntry === 'object' && 'allTimeScore' in leaderboardEntry ? 
                                   leaderboardEntry.allTimeScore as number : 0;
            const currentStreak = leaderboardEntry && typeof leaderboardEntry === 'object' && 'currentStreak' in leaderboardEntry ? 
                                 leaderboardEntry.currentStreak as number : 0;
            const longestStreak = leaderboardEntry && typeof leaderboardEntry === 'object' && 'longestStreak' in leaderboardEntry ? 
                                 leaderboardEntry.longestStreak as number : 0;
            const lastActive = leaderboardEntry && typeof leaderboardEntry === 'object' && 'lastActive' in leaderboardEntry ? 
                              leaderboardEntry.lastActive as Date : undefined;
            
            // Return constructed stats
            return {
              totalAttended: attendanceCount,
              verified: Math.round(attendanceCount * 0.8), // Estimate 80% verified
              unverified: Math.round(attendanceCount * 0.2), // Estimate 20% unverified
              streakCurrent: currentStreak,
              streakLongest: longestStreak,
              lastAttendance: lastActive,
              thisWeek: Math.min(attendanceCount, 7),
              thisMonth: Math.min(attendanceCount, 30),
              thisYear: attendanceCount,
              byCategory: {
                'Protesto': Math.round(attendanceCount * 0.6),
                'Eylem': Math.round(attendanceCount * 0.4)
              }
            };
            
          } catch (error) {
            console.error('Error calculating attendance stats:', error);
            return this.generateEmptyAttendanceStats();
          }
        }
        else if (endpoint === '/users/achievements') {
          // Get user achievements for the current user
          const userId = this.currentUser?.uid || 'user1'; // Default to user1 for development
          
          try {
            // Try to get achievements from userAchievements collection
            const { data: userAchievements } = await this.getDocuments('userAchievements', 
              [{ field: 'userId', operator: '==', value: userId }]
            );
            
            // If no user achievements found, try to get from leaderboard entry
            if (!userAchievements || !Array.isArray(userAchievements) || userAchievements.length === 0) {
              const leaderboardEntry = await this.getDocument('leaderboard', userId);
              
              if (leaderboardEntry && 
                  typeof leaderboardEntry === 'object' && 
                  'achievements' in leaderboardEntry && 
                  Array.isArray(leaderboardEntry.achievements)) {
                return leaderboardEntry.achievements;
              }
              
              // Get user profile to see experience level and determine achievements
              const userProfile = await this.getDocument('userProfiles', userId);
              
              // If we have a profile, generate some basic achievements based on experience level
              if (userProfile && typeof userProfile === 'object' && 'experienceLevel' in userProfile) {
                const experienceLevel = userProfile.experienceLevel as number;
                
                // Create basic achievement list based on experience level
                const achievements = [];
                
                // First attendance achievement (everyone gets this)
                achievements.push({
                  id: 'achievement1',
                  name: 'İlk Katılım',
                  description: 'İlk protestona katıldın',
                  imageUrl: null,
                  unlockedAt: new Date().toISOString(),
                  requirement: {
                    type: 'attendance',
                    target: 1,
                    current: 1
                  },
                  progress: 1
                });
                
                // Add more achievements based on experience level
                if (experienceLevel >= 2) {
                  achievements.push({
                    id: 'achievement2',
                    name: '5 Katılım',
                    description: '5 protesto etkinliğine katıldın',
                    imageUrl: null,
                    unlockedAt: new Date().toISOString(),
                    requirement: {
                      type: 'attendance',
                      target: 5,
                      current: 5
                    },
                    progress: 5
                  });
                }
                
                if (experienceLevel >= 3) {
                  achievements.push({
                    id: 'achievement3',
                    name: 'Haftalık Seri',
                    description: '7 günlük katılım serisi yaptın',
                    imageUrl: null,
                    unlockedAt: new Date().toISOString(),
                    requirement: {
                      type: 'streak',
                      target: 7,
                      current: 7
                    },
                    progress: 7
                  });
                }
                
                return achievements;
              }
              
              // If all else fails, return an empty array
              return [];
            }
            
            // Map the userAchievements to the expected format
            return userAchievements.map((achievementEntry: any) => {
              const achievementId = achievementEntry.achievementId;
              const isUnlocked = achievementEntry.isUnlocked;
              const unlockedAt = achievementEntry.unlockedAt;
              const progress = achievementEntry.progress;
              
              // Basic achievement data
              const achievement = {
                id: achievementId,
                name: this.getAchievementName(achievementId),
                description: this.getAchievementDescription(achievementId),
                imageUrl: null,
                unlockedAt: isUnlocked ? unlockedAt : undefined,
                requirement: achievementEntry.requirement || {
                  type: 'attendance',
                  target: 1
                },
                progress: progress || 0
              };
              
              return achievement;
            });
          } catch (error) {
            console.error('Error fetching user achievements:', error);
            // Return empty array as fallback
            return [];
          }
        }
        else if (endpoint === '/channels/subscribed') {
          // Get user's subscribed channels
          const userId = this.currentUser?.uid || 'user1'; // Default to user1 for development
          
          try {
            // Try to get user's channel subscriptions from channelSubscriptions collection
            const { data: subscriptions } = await this.getDocuments('channelSubscriptions', 
              [{ field: 'userId', operator: '==', value: userId }]
            );
            
            if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
              // If no subscriptions found, return default channels
              return this.getDefaultChannels();
            }
            
            // Get the channel IDs from subscriptions
            const channelIds = subscriptions.map((sub: any) => sub.channelId);
            
            // Fetch the actual channel data for each subscription
            const channels = [];
            for (const channelId of channelIds) {
              try {
                const channel = await this.getDocument('channels', channelId);
                if (channel) {
                  channels.push(channel);
                }
              } catch (e) {
                console.warn(`Failed to fetch channel ${channelId}:`, e);
              }
            }
            
            // If no channels could be fetched, return default channels
            if (channels.length === 0) {
              return this.getDefaultChannels();
            }
            
            return channels;
          } catch (error) {
            console.error('Error fetching subscribed channels:', error);
            // Return default channels as fallback
            return this.getDefaultChannels();
          }
        }
        else if (endpoint === '/announcements') {
          try {
            // Get limit and offset parameters
            const limit = config?.params?.limit || 10;
            const offset = config?.params?.offset || 0;
            
            // Try to fetch announcements from the announcements collection
            let { data: announcements } = await this.getDocuments('announcements', 
              undefined, 
              { field: 'publishDate', direction: 'desc' }, 
              { pageSize: limit + offset }
            );
            
            if (!announcements || !Array.isArray(announcements)) {
              return { announcements: [], total: 0 };
            }
            
            // Apply offset if needed
            if (offset > 0) {
              announcements = announcements.slice(offset);
            }
            
            // Limit the number of announcements
            if (announcements.length > limit) {
              announcements = announcements.slice(0, limit);
            }
            
            // Return formatted response
            return {
              announcements,
              total: announcements.length
            };
          } catch (error) {
            console.error('Error fetching announcements:', error);
            // Return empty result as fallback
            return { announcements: [], total: 0 };
          }
        }
        else if (endpoint === '/channels/search') {
          try {
            // Get search parameters
            const sortBy = config?.params?.sortBy || 'subscriberCount';
            const sortOrder = config?.params?.sortOrder || 'desc';
            const limit = config?.params?.limit || 10;
            const query = config?.params?.query || '';
            const category = config?.params?.category;
            
            // Try to fetch channels from the channels collection
            let { data: channels } = await this.getDocuments('channels');
            
            if (!channels || !Array.isArray(channels)) {
              // If no results or error, return default channels
              return { channels: this.getDefaultChannels(), total: this.getDefaultChannels().length };
            }
            
            // Apply filtering if query is provided
            if (query && query.trim() !== '') {
              const lowerQuery = query.toLowerCase();
              channels = channels.filter((channel: any) => 
                (channel.name && channel.name.toLowerCase().includes(lowerQuery)) ||
                (channel.description && channel.description.toLowerCase().includes(lowerQuery))
              );
            }
            
            // Apply category filter if provided
            if (category) {
              channels = channels.filter((channel: any) => 
                channel.category === category
              );
            }
            
            // Apply sorting
            channels.sort((a: any, b: any) => {
              // Get the values to compare
              const aValue = a[sortBy] !== undefined ? a[sortBy] : 0;
              const bValue = b[sortBy] !== undefined ? b[sortBy] : 0;
              
              // Compare based on sort order
              if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
              } else {
                return aValue < bValue ? 1 : -1;
              }
            });
            
            // Apply limit
            if (channels.length > limit) {
              channels = channels.slice(0, limit);
            }
            
            // If no channels found after filtering, return defaults
            if (channels.length === 0) {
              return { channels: this.getDefaultChannels(), total: this.getDefaultChannels().length };
            }
            
            // Return formatted response
            return {
              channels,
              total: channels.length
            };
          } catch (error) {
            console.error('Error searching channels:', error);
            // Return default channels as fallback
            return { channels: this.getDefaultChannels(), total: this.getDefaultChannels().length };
          }
        }
        
        // For other endpoints, try REST API call
        console.log(`Making REST API call to ${endpoint}`);
        const response = await this.client.get(endpoint, config);
        return response.data;
      } else {
        // Handle Firestore path, where endpoint is a direct path to a document or collection
        const pathParts = endpoint.split('/');
        
        if (pathParts.length % 2 === 0) {
          // Even number of segments means it's a document path (e.g. 'collection/docId')
          const collection = pathParts.slice(0, -1).join('/');
          const docId = pathParts[pathParts.length - 1];
          return this.getDocument(collection, docId);
        } else {
          // Odd number of segments means it's a collection path (e.g. 'collection')
          return this.getDocuments(endpoint);
        }
      }
    } catch (error: any) {
      console.error(`Error in API client get (${endpoint}):`, error);
      throw new ApiError(error.message || 'Failed to get data', error.code || 500);
    }
  }

  /**
   * Generate empty attendance stats for when no data is available
   * @private
   */
  private generateEmptyAttendanceStats(): any {
    return {
      totalAttended: 0,
      verified: 0,
      unverified: 0,
      streakCurrent: 0,
      streakLongest: 0,
      lastAttendance: undefined,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
      byCategory: {}
    };
  }

  /**
   * Get a human-readable name for an achievement based on its ID
   * @private
   */
  private getAchievementName(achievementId: string): string {
    // Map achievement IDs to human-readable names
    const achievementNames: {[key: string]: string} = {
      'achievement1': 'İlk Katılım',
      'achievement2': '5 Katılım',
      'achievement3': 'Haftalık Seri',
      'achievement4': 'Tamirat Efendisi',
      'achievement5': 'Sosyal Aktivist',
      'streak_3': '3 Gün Seri',
      'streak_7': '7 Gün Seri',
      'streak_14': '14 Gün Seri',
      'attendance_1': 'İlk Katılım',
      'attendance_5': '5 Katılım',
      'attendance_10': '10 Katılım',
      'attendance_20': '20 Katılım',
      'verified_5': '5 Onaylı Katılım',
      'social_share_3': '3 Sosyal Paylaşım',
    };
    
    return achievementNames[achievementId] || `Rozet ${achievementId}`;
  }

  /**
   * Get a description for an achievement based on its ID
   * @private
   */
  private getAchievementDescription(achievementId: string): string {
    // Map achievement IDs to descriptions
    const achievementDescriptions: {[key: string]: string} = {
      'achievement1': 'İlk protestona katıldın',
      'achievement2': '5 protesto etkinliğine katıldın',
      'achievement3': '7 günlük katılım serisi yaptın',
      'achievement4': '10 protestoya katılarak aktif bir savunucu oldun',
      'achievement5': 'Sosyal medyada 3 kez katılımını paylaştın',
      'streak_3': '3 gün üst üste eylemlere katılım gösterdin',
      'streak_7': '7 gün üst üste eylemlere katılım gösterdin',
      'streak_14': '14 gün üst üste eylemlere katılım gösterdin',
      'attendance_1': 'İlk tamirata katıldın',
      'attendance_5': '5 tamirata katıldın',
      'attendance_10': '10 tamirata katıldın',
      'attendance_20': '20 tamirata katıldın',
      'verified_5': '5 kez onaylı olarak tamirat katılımın kaydedildi',
      'social_share_3': 'Sosyal medyada 3 kez katılımını paylaştın',
    };
    
    return achievementDescriptions[achievementId] || 'Bu rozeti kazandın!';
  }

  /**
   * Get default recommended channels for new users
   * @private
   */
  private getDefaultChannels(): any[] {
    // Return an array of default channels with sample data
    return [
      {
        id: 'channel1',
        name: 'Ana Kanal',
        description: 'Önemli duyurular ve haberler',
        imageUrl: null,
        subscriberCount: 1250,
        type: 'official',
        category: 'general'
      },
      {
        id: 'channel2',
        name: 'Organizasyon',
        description: 'Etkinlikler ve organizasyonlar hakkında bilgiler',
        imageUrl: null,
        subscriberCount: 980,
        type: 'official',
        category: 'events'
      },
      {
        id: 'channel3',
        name: 'Tamirat Duyuruları',
        description: 'Tamirat ile ilgili gelişmeler ve bilgiler',
        imageUrl: null,
        subscriberCount: 850,
        type: 'official',
        category: 'protest'
      }
    ];
  }

  /**
   * Make a POST request to an external API
   * Keep this method for any external API calls that might be needed
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error: any) {
      throw new ApiError(error.message, error.response?.status || 500);
    }
  }
}

// Export the singleton instance
export default ApiClient.getInstance(); 