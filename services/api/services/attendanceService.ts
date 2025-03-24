import { AttendanceRecord, ProtestEvent, VerificationMethod, VerificationRequest, AttendanceStats } from '../models/Attendance';
import ApiClient from '../apiClient';

/**
 * Service for handling attendance-related operations
 */
export default class AttendanceService {
  private apiClient: any;
  
  constructor(apiClient: any) {
    this.apiClient = apiClient;
  }

  /**
   * Records a new attendance
   * @param userId User ID
   * @param verificationData Verification request data
   * @returns Created attendance record
   */
  async recordAttendance(verificationData: VerificationRequest): Promise<AttendanceRecord> {
    return this.apiClient.post('/attendance/record', verificationData);
  }

  /**
   * Verify attendance using location
   * @param protestId Protest ID
   * @param latitude Latitude
   * @param longitude Longitude
   * @param accuracy Accuracy in meters
   * @returns Verification result
   */
  async verifyByLocation(protestId: string, latitude: number, longitude: number, accuracy: number): Promise<{verified: boolean; message: string}> {
    const verificationData: VerificationRequest = {
      protestId,
      userId: 'current', // Server will resolve from auth token
      method: VerificationMethod.LOCATION,
      data: {
        location: {
          latitude,
          longitude,
          accuracy
        }
      }
    };
    
    return this.apiClient.post('/attendance/verify', verificationData);
  }
  
  /**
   * Verify attendance using a code
   * @param protestId Protest ID
   * @param code Verification code
   * @returns Verification result
   */
  async verifyByCode(protestId: string, code: string): Promise<{verified: boolean; message: string}> {
    const verificationData: VerificationRequest = {
      protestId,
      userId: 'current', // Server will resolve from auth token
      method: VerificationMethod.CODE,
      data: {
        code
      }
    };
    
    return this.apiClient.post('/attendance/verify', verificationData);
  }
  
  /**
   * Gets a user's attendance history
   * @param userId User ID (optional, defaults to current user)
   * @param limit Number of records to return
   * @param offset Offset for pagination
   * @returns List of attendance records
   */
  async getAttendanceHistory(userId?: string, limit = 10, offset = 0): Promise<{records: AttendanceRecord[]; total: number}> {
    const params = {
      userId: userId || 'current', // If not provided, server will use current user
      limit,
      offset
    };
    
    return this.apiClient.get('/attendance/history', { params });
  }
  
  /**
   * Gets attendance statistics for a user
   * @param userId User ID (optional, defaults to current user)
   * @returns Attendance statistics
   */
  async getAttendanceStats(userId?: string): Promise<AttendanceStats> {
    const params = {
      userId: userId || 'current' // If not provided, server will use current user
    };
    
    return this.apiClient.get('/attendance/stats', { params });
  }
  
  /**
   * Shares an attendance record to social media
   * @param recordId Attendance record ID to share
   * @param platform Platform to share to ('twitter', 'facebook', etc.)
   * @returns Success status
   */
  async shareAttendance(recordId: string, platform: string): Promise<{success: boolean; url?: string}> {
    return this.apiClient.post('/attendance/share', { recordId, platform });
  }
  
  /**
   * Gets upcoming events/protests
   * @param limit Number of events to return
   * @param offset Offset for pagination
   * @returns List of upcoming events
   */
  async getUpcomingEvents(limit = 10, offset = 0): Promise<{events: ProtestEvent[]; total: number}> {
    return this.apiClient.get('/events/upcoming', { params: { limit, offset } });
  }
  
  /**
   * Gets events near a location
   * @param latitude Latitude
   * @param longitude Longitude
   * @param radius Radius in kilometers
   * @param limit Number of events to return
   * @returns List of nearby events
   */
  async getNearbyEvents(latitude: number, longitude: number, radius = 10, limit = 10): Promise<ProtestEvent[]> {
    return this.apiClient.get('/events/nearby', { params: { latitude, longitude, radius, limit } });
  }
  
  /**
   * Gets details for a specific event
   * @param eventId Event ID
   * @returns Event details
   */
  async getEventDetails(eventId: string): Promise<ProtestEvent> {
    return this.apiClient.get(`/events/${eventId}`);
  }
  
  /**
   * Registers user for an event
   * @param eventId Event ID
   * @returns Registration status
   */
  async registerForEvent(eventId: string): Promise<{success: boolean; registrationId?: string}> {
    return this.apiClient.post(`/events/${eventId}/register`, {});
  }
  
  /**
   * Cancels registration for an event
   * @param eventId Event ID
   * @returns Cancellation status
   */
  async cancelRegistration(eventId: string): Promise<{success: boolean}> {
    return this.apiClient.post(`/events/${eventId}/cancel`, {});
  }
  
  /**
   * Searches for events
   * @param query Search query
   * @param filters Additional filters
   * @returns Search results
   */
  async searchEvents(query: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
    limit?: number;
    offset?: number;
  }): Promise<{events: ProtestEvent[]; total: number}> {
    return this.apiClient.get('/events/search', { 
      params: { 
        query,
        ...filters
      }
    });
  }
} 