import ApiClient from './apiClient';
import AttendanceService from './services/attendanceService';
import AnnouncementService from './services/announcementService';
import UserService from './services/userService';
import BoycottService from './services/boycottService';

/**
 * API Services
 * Central export for all API services
 */

// Get the singleton API client instance
const apiClient = ApiClient;

// Create service instances
const attendanceService = new AttendanceService(apiClient);
const announcementService = new AnnouncementService(apiClient);
const userService = new UserService(apiClient);
const boycottService = new BoycottService(apiClient);

// Individual service exports
export { 
  attendanceService,
  announcementService,
  userService,
  boycottService,
  apiClient
};

// Export the API context provider and hook
export { ApiProvider, useApi } from './ApiContext';

// Models
export * from './models/Attendance';
export * from './models/Announcement';
export * from './models/UserProfile';
export * from './models/BoycottCompany';

// Default export as a bundle of all services
export default {
  attendanceService,
  announcementService,
  userService,
  boycottService,
  apiClient
}; 