import React, { createContext, useContext } from 'react';
import UserService from './services/userService';
import AttendanceService from './services/attendanceService';
import AnnouncementService from './services/announcementService';
import BoycottService from './services/boycottService';
import apiClient from './apiClient';
import { useAuth } from './AuthContext';

interface ApiContextValue {
  userService: UserService;
  attendanceService: AttendanceService;
  announcementService: AnnouncementService;
  boycottService: BoycottService;
}

export const ApiContext = createContext<ApiContextValue | null>(null);

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();
  
  // Initialize service instances with the API client
  const userService = new UserService(apiClient);
  const attendanceService = new AttendanceService(apiClient);
  const announcementService = new AnnouncementService(apiClient);
  const boycottService = new BoycottService(apiClient);
  
  // Provide the services to the app
  return (
    <ApiContext.Provider 
      value={{ 
        userService, 
        attendanceService, 
        announcementService, 
        boycottService
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}; 