import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, firestore } from '../firebase';

// Set to false to use real Firebase Auth
const USE_DEV_MODE = false;

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, password: string, avatarId: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<{nickname: string, avatarId: string}>) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

// Mock User for dev mode
interface MockUser {
  uid: string;
  username: string;
  avatarId: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mockUser, setMockUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRealUser, setIsRealUser] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (USE_DEV_MODE) {
        // In dev mode, check AsyncStorage for user data
        try {
          const isAuthenticated = await AsyncStorage.getItem('@auth:isAuthenticated');
          const username = await AsyncStorage.getItem('@auth:username');
          const avatarId = await AsyncStorage.getItem('@auth:avatarId') || '1';
          
          if (isAuthenticated === 'true' && username) {
            // Create a mock user
            setMockUser({
              uid: `dev-${username}`,
              username,
              avatarId
            });
            setIsRealUser(true);
          }
        } catch (error) {
          console.error('Error checking auth state in dev mode:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // In production mode, use Firebase Auth
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
          setUser(authUser);
          
          if (authUser) {
            // Check if this is a real user with a profile
            try {
              const userProfileDoc = await getDoc(doc(firestore, 'userProfiles', authUser.uid));
              
              if (userProfileDoc.exists()) {
                // Store username in AsyncStorage for easy access
                const nickname = userProfileDoc.data().nickname;
                if (nickname) {
                  await AsyncStorage.setItem('@auth:username', nickname);
                  setIsRealUser(true);
                } else {
                  setIsRealUser(false);
                }
              } else {
                // No profile means this is just an anonymous auth for checking username
                setIsRealUser(false);
              }
            } catch (error) {
              console.error('Error getting user profile:', error);
              setIsRealUser(false);
            }
          } else {
            setIsRealUser(false);
          }
          
          // Store authentication state
          await AsyncStorage.setItem('@auth:isAuthenticated', isRealUser ? 'true' : 'false');
          setIsLoading(false);
        });
        
        return () => unsubscribe();
      }
    };
    
    checkAuth();
  }, []);
  
  // Helper to check if username exists
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    if (USE_DEV_MODE) {
      // In dev mode, check AsyncStorage
      try {
        const storedUsernames = await AsyncStorage.getItem('@auth:usernames');
        if (storedUsernames) {
          const usernames = JSON.parse(storedUsernames);
          return usernames.includes(username);
        }
        return false;
      } catch (error) {
        console.error('Error checking username in dev mode:', error);
        return false;
      }
    } else {
      try {
        // Ensure we have authentication
        if (!auth.currentUser) {
          try {
            console.log("Signing in anonymously to check username");
            await signInAnonymously(auth);
          } catch (authError) {
            console.error("Failed to sign in anonymously for username check:", authError);
            // Continue anyway, the query might still work
          }
        }
        
        // First check userProfiles collection for nickname
        console.log("Checking if username exists in userProfiles:", username);
        const profilesQuery = query(collection(firestore, 'userProfiles'), where('nickname', '==', username));
        const profilesSnapshot = await getDocs(profilesQuery);
        
        // Also check userCredentials collection for username
        console.log("Checking if username exists in userCredentials:", username);
        const credentialsQuery = query(collection(firestore, 'userCredentials'), where('username', '==', username));
        const credentialsSnapshot = await getDocs(credentialsQuery);
        
        // If username exists in either collection, return true
        const exists = !profilesSnapshot.empty || !credentialsSnapshot.empty;
        console.log(`Username ${username} exists: ${exists}`);
        return exists;
      } catch (error) {
        console.error('Error checking username:', error);
        // If we can't check, assume username doesn't exist to allow registration to proceed
        return false;
      }
    }
  };
  
  // Helper to get user credential by username
  const getUserByUsername = async (username: string): Promise<{uid: string, password: string} | null> => {
    if (USE_DEV_MODE) return null;
    
    try {
      const q = query(collection(firestore, 'userCredentials'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return {
          uid: userDoc.data().userId,
          password: userDoc.data().password
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      return null;
    }
  };
  
  const login = async (username: string, password: string): Promise<User | any> => {
    try {
      setIsLoading(true);
      
      if (USE_DEV_MODE) {
        // In dev mode, check stored credentials
        const storedPassword = await AsyncStorage.getItem(`@auth:password:${username}`);
        
        if (!storedPassword) {
          throw new Error('Username not found. Please check your credentials or register.');
        }
        
        if (storedPassword !== password) {
          throw new Error('Invalid username or password. Please try again.');
        }
        
        // Login successful in dev mode
        const avatarId = await AsyncStorage.getItem(`@auth:avatarId:${username}`) || '1';
        const mockUser = {
          uid: `dev-${username}`,
          username,
          avatarId
        };
        
        await AsyncStorage.setItem('@auth:isAuthenticated', 'true');
        await AsyncStorage.setItem('@auth:username', username);
        await AsyncStorage.setItem('@auth:avatarId', avatarId);
        
        setMockUser(mockUser);
        return mockUser;
      } else {
        // In production mode, sign in anonymously first (only if not already signed in)
        if (!auth.currentUser) {
          try {
            console.log("Signing in anonymously for login");
            await signInAnonymously(auth);
          } catch (authError) {
            console.error("Failed to sign in anonymously:", authError);
            throw new Error('Authentication failed. Please try again later.');
          }
        }
        
        // Now check if username exists with authenticated session
        console.log("Checking username:", username);
        const q = query(collection(firestore, 'userCredentials'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Username not found. Please check your credentials or register.');
        }
        
        const userDoc = querySnapshot.docs[0];
        const userCredential = {
          uid: userDoc.data().userId,
          password: userDoc.data().password
        };
        
        // Check password
        if (userCredential.password !== password) {
          throw new Error('Invalid username or password. Please try again.');
        }
        
        // Important change: Store the actual user ID from credentials
        // We'll use this ID to reference the user's data in Firestore
        const actualUserId = userCredential.uid;
        await AsyncStorage.setItem('@auth:actualUserId', actualUserId);
        
        // Get the user's full profile data using the ACTUAL user ID
        console.log("Getting user profile with ID:", actualUserId);
        const userProfileRef = doc(firestore, 'userProfiles', actualUserId);
        const userProfileDoc = await getDoc(userProfileRef);
        
        if (!userProfileDoc.exists()) {
          console.warn("User profile not found for existing user. This shouldn't happen.");
        } else {
          console.log("User profile retrieved successfully.");
        }
        
        await AsyncStorage.setItem('@auth:isAuthenticated', 'true');
        await AsyncStorage.setItem('@auth:username', username);
        
        // We're reusing the original user's ID for data access
        setIsRealUser(true);
        
        // Return a modified user object with the actual userId
        return {
          ...auth.currentUser,
          actualUserId
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to update user references when migrating between anonymous accounts
  const updateUserReferences = async (oldUid: string, newUid: string) => {
    try {
      // Get the user profile data
      const userProfileDoc = await getDoc(doc(firestore, 'userProfiles', oldUid));
      const userSettingsDoc = await getDoc(doc(firestore, 'userSettings', oldUid));
      const leaderboardDoc = await getDoc(doc(firestore, 'leaderboard', oldUid));
      const userCredentialsQuery = query(
        collection(firestore, 'userCredentials'), 
        where('userId', '==', oldUid)
      );
      const userCredentialsSnapshot = await getDocs(userCredentialsQuery);
      
      // Create new documents with new UID
      if (userProfileDoc.exists()) {
        const profileData = userProfileDoc.data();
        await setDoc(doc(firestore, 'userProfiles', newUid), {
          ...profileData,
          id: newUid,
          updatedAt: new Date()
        });
      }
      
      if (userSettingsDoc.exists()) {
        const settingsData = userSettingsDoc.data();
        await setDoc(doc(firestore, 'userSettings', newUid), {
          ...settingsData,
          id: newUid,
          updatedAt: new Date()
        });
      }
      
      if (leaderboardDoc.exists()) {
        const leaderboardData = leaderboardDoc.data();
        await setDoc(doc(firestore, 'leaderboard', newUid), {
          ...leaderboardData,
          userId: newUid,
          updatedAt: new Date()
        });
      }
      
      // Update user credentials with new userId
      if (!userCredentialsSnapshot.empty) {
        const credentialDoc = userCredentialsSnapshot.docs[0];
        await setDoc(doc(firestore, 'userCredentials', credentialDoc.id), {
          ...credentialDoc.data(),
          userId: newUid,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user references:', error);
    }
  };

  const register = async (
    username: string, 
    password: string, 
    avatarId: string
  ): Promise<User | any> => {
    try {
      setIsLoading(true);
      
      // Double-check if username already exists - critical for preventing duplicates
      console.log("Final check if username exists:", username);
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        throw new Error('Username already taken. Please choose another username.');
      }
      
      if (USE_DEV_MODE) {
        // Dev mode code remains unchanged
        await AsyncStorage.setItem(`@auth:password:${username}`, password);
        await AsyncStorage.setItem(`@auth:avatarId:${username}`, avatarId);
        
        // Keep track of registered usernames
        const storedUsernames = await AsyncStorage.getItem('@auth:usernames');
        const usernames = storedUsernames ? JSON.parse(storedUsernames) : [];
        usernames.push(username);
        await AsyncStorage.setItem('@auth:usernames', JSON.stringify(usernames));
        
        // Create a mock user
        const mockUser = {
          uid: `dev-${username}`,
          username,
          avatarId
        };
        
        await AsyncStorage.setItem('@auth:isAuthenticated', 'true');
        await AsyncStorage.setItem('@auth:username', username);
        await AsyncStorage.setItem('@auth:avatarId', avatarId);
        
        setMockUser(mockUser);
        return mockUser;
      } else {
        // Make sure we have an anonymous user first
        let currentUser = auth.currentUser;
        if (!currentUser) {
          const result = await signInAnonymously(auth);
          currentUser = result.user;
        }
        
        try {
          // Create user credential first with a randomly generated document ID
          const userCredentialsRef = doc(collection(firestore, 'userCredentials'));
          await setDoc(userCredentialsRef, {
            userId: currentUser.uid,
            username: username,
            password: password, // In a real app, you should hash this password
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Now create the user profile
          await setDoc(doc(firestore, 'userProfiles', currentUser.uid), {
            id: currentUser.uid,
            nickname: username,
            avatarId: avatarId,
            experienceLevel: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Create user settings
          await setDoc(doc(firestore, 'userSettings', currentUser.uid), {
            id: currentUser.uid,
            notifications: { enabled: true },
            showOnLeaderboard: true,
            nickname: username,
            avatar: {
              id: avatarId,
              url: `https://via.placeholder.com/150` // In a real app, you'd use actual avatar URLs
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          // Create initial leaderboard entry
          await setDoc(doc(firestore, 'leaderboard', currentUser.uid), {
            userId: currentUser.uid,
            rank: 0,
            nickname: username,
            avatarId: avatarId,
            score: 0,
            achievements: [],
            weeklyScore: 0,
            monthlyScore: 0,
            allTimeScore: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await AsyncStorage.setItem('@auth:isAuthenticated', 'true');
          await AsyncStorage.setItem('@auth:username', username);
          
          return currentUser;
        } catch (error) {
          console.error('Firestore document creation error:', error);
          throw new Error('Failed to create user profile. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Improved error handling
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Anonymous authentication is not enabled. Please enable it in the Firebase Console.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
        throw new Error('Permission denied. Please check your Firebase security rules.');
      }
      
      throw new Error(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (USE_DEV_MODE) {
        // In dev mode, just clear the stored auth state
        await AsyncStorage.removeItem('@auth:isAuthenticated');
        await AsyncStorage.removeItem('@auth:username');
        await AsyncStorage.removeItem('@auth:avatarId');
        setMockUser(null);
      } else {
        await signOut(auth);
        await AsyncStorage.removeItem('@auth:isAuthenticated');
        await AsyncStorage.removeItem('@auth:username');
      }

      // Force clear authentication state
      setUser(null);
      setMockUser(null);
      
      // Clear any other relevant auth data
      await AsyncStorage.setItem('@auth:isAuthenticated', 'false');
      
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateUserProfile = async (data: Partial<{nickname: string, avatarId: string}>): Promise<void> => {
    if (!user && !mockUser) {
      throw new Error('User not authenticated');
    }
    
    try {
      // If trying to update username, check if the new username exists
      if (data.nickname && data.nickname !== await AsyncStorage.getItem('@auth:username')) {
        const usernameExists = await checkUsernameExists(data.nickname);
        if (usernameExists) {
          throw new Error('Username already taken. Please choose another username.');
        }
      }
      
      if (USE_DEV_MODE) {
        // In dev mode, update stored user data
        const currentUsername = await AsyncStorage.getItem('@auth:username');
        
        if (data.nickname && currentUsername) {
          // Update the username in the usernames list
          const storedUsernames = await AsyncStorage.getItem('@auth:usernames');
          if (storedUsernames) {
            const usernames = JSON.parse(storedUsernames);
            const index = usernames.indexOf(currentUsername);
            if (index !== -1) {
              usernames[index] = data.nickname;
              await AsyncStorage.setItem('@auth:usernames', JSON.stringify(usernames));
            }
          }
          
          // Copy password to new username
          const password = await AsyncStorage.getItem(`@auth:password:${currentUsername}`);
          if (password) {
            await AsyncStorage.setItem(`@auth:password:${data.nickname}`, password);
            await AsyncStorage.removeItem(`@auth:password:${currentUsername}`);
          }
          
          // Update current username
          await AsyncStorage.setItem('@auth:username', data.nickname);
        }
        
        if (data.avatarId) {
          const username = data.nickname || await AsyncStorage.getItem('@auth:username');
          if (username) {
            await AsyncStorage.setItem(`@auth:avatarId:${username}`, data.avatarId);
            await AsyncStorage.setItem('@auth:avatarId', data.avatarId);
          }
        }
        
        // Update mock user
        if (mockUser) {
          const updatedMockUser = {
            ...mockUser,
            ...(data.nickname && { username: data.nickname }),
            ...(data.avatarId && { avatarId: data.avatarId })
          };
          setMockUser(updatedMockUser as MockUser);
        }
      } else {
        if (!user) return;
        
        const userProfileRef = doc(firestore, 'userProfiles', user.uid);
        const userSettingsRef = doc(firestore, 'userSettings', user.uid);
        const leaderboardRef = doc(firestore, 'leaderboard', user.uid);
        
        // Update profile
        const profileSnapshot = await getDoc(userProfileRef);
        if (profileSnapshot.exists()) {
          await setDoc(userProfileRef, {
            ...profileSnapshot.data(),
            ...data,
            updatedAt: new Date()
          }, { merge: true });
        }
        
        // Update settings
        const settingsSnapshot = await getDoc(userSettingsRef);
        if (settingsSnapshot.exists()) {
          await setDoc(userSettingsRef, {
            ...settingsSnapshot.data(),
            ...(data.nickname && { nickname: data.nickname }),
            ...(data.avatarId && { 
              avatar: {
                id: data.avatarId,
                url: `https://via.placeholder.com/150` // In a real app, you'd use actual avatar URLs
              }
            }),
            updatedAt: new Date()
          }, { merge: true });
        }
        
        // Update leaderboard entry
        const leaderboardSnapshot = await getDoc(leaderboardRef);
        if (leaderboardSnapshot.exists()) {
          await setDoc(leaderboardRef, {
            ...leaderboardSnapshot.data(),
            ...(data.nickname && { nickname: data.nickname }),
            ...(data.avatarId && { avatarId: data.avatarId }),
            updatedAt: new Date()
          }, { merge: true });
        }
        
        // Update username in userCredentials if nickname changed
        if (data.nickname) {
          const q = query(
            collection(firestore, 'userCredentials'), 
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const credentialDoc = querySnapshot.docs[0];
            await setDoc(doc(firestore, 'userCredentials', credentialDoc.id), {
              ...credentialDoc.data(),
              username: data.nickname,
              updatedAt: new Date()
            }, { merge: true });
          }
          
          // If username was updated, store it locally
          await AsyncStorage.setItem('@auth:username', data.nickname);
        }
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user: USE_DEV_MODE ? (mockUser as unknown as User) : user,
        isAuthenticated: USE_DEV_MODE ? !!mockUser : (!!user && isRealUser),
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        checkUsernameAvailability: checkUsernameExists
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 