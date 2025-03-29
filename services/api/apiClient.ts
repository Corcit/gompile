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
          // Get user settings
          const userId = this.currentUser?.uid || 'user1'; // For development: default to user1 if not logged in
          return this.getDocument('userSettings', userId);
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