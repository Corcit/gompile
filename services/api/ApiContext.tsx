import { createContext } from 'react';
import UserService from './services/userService';

interface ApiContextValue {
  userService: UserService;
}

export const ApiContext = createContext<ApiContextValue | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize your API client and services here
  const apiClient = {
    get: async (url: string) => {
      // Implement your API client methods
      return Promise.resolve({});
    },
    post: async (url: string, data: any) => {
      return Promise.resolve({});
    },
    put: async (url: string, data: any) => {
      return Promise.resolve({});
    },
    delete: async (url: string) => {
      return Promise.resolve({});
    },
  };

  const userService = new UserService(apiClient);

  return (
    <ApiContext.Provider value={{ userService }}>
      {children}
    </ApiContext.Provider>
  );
}; 