import { useContext } from 'react';
import { ApiContext } from '../ApiContext';
import UserService from '../services/userService';

export function useUserService(): UserService {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useUserService must be used within an ApiProvider');
  }
  return context.userService;
} 