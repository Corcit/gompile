import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL of our API 
// In a real app, this would be a configuration file or environment variable
const API_URL = 'http://localhost:80/api';

// Define any default headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Enable mock mode for development without a backend
const USE_MOCK_DATA = true;

// Mock data for development
const MOCK_DATA = {
  '/users/me': {
    userId: 'current-user',
    nickname: 'ActiveUser',
    avatarId: 'user',
    experienceLevel: 2,
    createdAt: new Date().toISOString(),
    protestCount: 24,
  },
  '/users/stats': {
    protestsAttended: 24,
    totalHours: 48,
    achievements: 8,
    currentStreak: 3,
    longestStreak: 7
  },
  '/users/achievements': [
    {
      id: 'achievement1',
      name: 'First Attendance',
      description: 'Attended your first protest',
      iconUrl: null,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      requirement: {
        type: 'attendance',
        count: 1
      }
    },
    {
      id: 'achievement2',
      name: 'Regular Activist',
      description: 'Attended 10 protests',
      iconUrl: null,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      requirement: {
        type: 'attendance',
        count: 10
      }
    },
    {
      id: 'achievement3',
      name: 'Dedicated Activist',
      description: 'Attended 20 protests',
      iconUrl: null,
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      requirement: {
        type: 'attendance',
        count: 20
      }
    },
    {
      id: 'achievement4',
      name: 'Week Streak',
      description: 'Maintained a 7-day attendance streak',
      iconUrl: null,
      isUnlocked: false,
      progress: 42,
      requirement: {
        type: 'streak',
        days: 7
      }
    }
  ],
  '/users/leaderboard/rank': {
    rank: 5,
    score: 24,
    totalParticipants: 120
  },
  '/users/leaderboard': {
    entries: Array.from({ length: 30 }, (_, i) => ({
      userId: `user-${i + 1}`,
      nickname: `Activist${i + 1}`,
      avatarId: ((i % 10) + 1).toString(),
      rank: i + 1,
      score: 100 - i * (i > 0 ? Math.floor(Math.random() * 4) + 1 : 0),
      achievements: []
    })),
    total: 120
  }
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
 * API Client for making HTTP requests to the server
 */
class ApiClient {
  private client: AxiosInstance;
  private static instance: ApiClient;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: DEFAULT_HEADERS,
      timeout: 30000, // 30 seconds
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config: AxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('@user:token');
        if (token && config.headers) {
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
          // Clear token and redirect to login
          AsyncStorage.removeItem('@user:token');
          // In a real app, we would redirect to login or trigger a refresh token flow
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

  /**
   * Make a GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        return this.getMockResponse(url, config);
      }
      
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        return this.getMockResponse(url, config);
      }
      
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        return this.getMockResponse(url, config);
      }
      
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      // Use mock data if enabled
      if (USE_MOCK_DATA) {
        return this.getMockResponse(url, config);
      }
      
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload a file
   */
  public async uploadFile<T>(url: string, file: any, onProgress?: (progress: number) => void): Promise<T> {
    // Use mock data if enabled
    if (USE_MOCK_DATA) {
      return this.getMockResponse(url);
    }
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response: AxiosResponse<T> = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get mock response for development without a backend
   */
  private getMockResponse(url: string, config?: AxiosRequestConfig): any {
    console.log('Using mock data for:', url);
    
    // Extract the base endpoint without query params
    const endpoint = url.split('?')[0];
    
    // Handle special cases with query params
    if (url.includes('/users/leaderboard')) {
      const timeframe = config?.params?.timeframe || 'weekly';
      const limit = config?.params?.limit || 10;
      
      // Create different data for different timeframes
      const mockData = { ...MOCK_DATA['/users/leaderboard'] };
      
      // Adjust scores based on timeframe
      if (timeframe === 'weekly') {
        mockData.entries = mockData.entries.map(entry => ({
          ...entry,
          score: Math.floor(entry.score * 0.2) // Lower scores for weekly
        }));
      } else if (timeframe === 'monthly') {
        mockData.entries = mockData.entries.map(entry => ({
          ...entry,
          score: Math.floor(entry.score * 0.5) // Medium scores for monthly
        }));
      }
      
      // Limit the number of entries
      mockData.entries = mockData.entries.slice(0, limit);
      
      return mockData;
    }
    
    if (url.includes('/users/leaderboard/rank')) {
      const timeframe = config?.params?.timeframe || 'weekly';
      const mockRank = { ...MOCK_DATA['/users/leaderboard/rank'] };
      
      // Adjust rank and score based on timeframe
      if (timeframe === 'weekly') {
        mockRank.score = Math.floor(mockRank.score * 0.2);
      } else if (timeframe === 'monthly') {
        mockRank.score = Math.floor(mockRank.score * 0.5);
      }
      
      return mockRank;
    }
    
    // Return default mock data or empty object
    return MOCK_DATA[endpoint] || {};
  }
}

// Export a singleton instance
export default ApiClient.getInstance(); 