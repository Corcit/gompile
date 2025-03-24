import ApiClient from './apiClient';
import AttendanceService from './services/attendanceService';
import AnnouncementService from './services/announcementService';
import UserService from './services/userService';

/**
 * API Services
 * Central export for all API services
 */

// Get the single API client instance (it's already a singleton)
const apiClient = ApiClient;

// Create service instances
const attendanceService = new AttendanceService(apiClient);
const announcementService = new AnnouncementService(apiClient);
const userService = new UserService(apiClient);

// Individual service exports
export { 
  attendanceService,
  announcementService,
  userService,
  apiClient
};

// Models
export * from './models/Attendance';
export * from './models/Announcement';
export * from './models/UserProfile';

// Default export as a bundle of all services
export default {
  attendanceService,
  announcementService,
  userService,
  apiClient
}; 