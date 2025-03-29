import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import RoundedInput from '../components/ui/RoundedInput';
import RoundedButton from '../components/ui/RoundedButton';
import RoundedCard from '../components/ui/RoundedCard';
import { useAuth } from '../services/api/AuthContext';

export default function LoginScreen() {
  const { login, register, isAuthenticated, isLoading, checkUsernameAvailability } = useAuth();
  const params = useLocalSearchParams();
  
  // Check if we should start in register mode
  const [isLogin, setIsLogin] = useState(params.mode !== 'register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Use debounce for username checking
  const usernameTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // If user is already authenticated AND we're not in the registration process, redirect to main app
    if (isAuthenticated) {
      // Get the current user status from AsyncStorage
      AsyncStorage.getItem('@auth:username').then(username => {
        // Only redirect if we have a username stored, which means a real login not just anonymous auth
        if (username) {
          router.replace('/(tabs)');
        }
      });
    }
  }, [isAuthenticated, router]);
  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleGoBack = () => {
    router.back();
  };
  
  const handleOpenMenu = () => {
    // Menu functionality would go here
    Alert.alert('Menu', 'Menu functionality would go here');
  };
  
  // Debounced username validation
  const validateUsernameDebounced = useCallback(async (value: string) => {
    // Clear any existing timeout
    if (usernameTimeout.current) {
      clearTimeout(usernameTimeout.current);
    }
    
    // Basic validation
    if (!value.trim()) {
      setUsernameError('Username cannot be empty');
      return false;
    }
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }

    if (value.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    
    // Check for invalid characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      return false;
    }
    
    // If not in login mode, check if username exists after a delay
    if (!isLogin) {
      setUsernameError('Checking username availability...');
      setCheckingUsername(true);
      
      usernameTimeout.current = setTimeout(async () => {
        try {
          const exists = await checkUsernameAvailability(value);
          if (exists) {
            setUsernameError('Username already taken. Please choose another.');
          } else {
            setUsernameError('');
          }
        } catch (error) {
          console.error('Error checking username:', error);
          setUsernameError('');
        } finally {
          setCheckingUsername(false);
        }
      }, 600);
    } else {
      setUsernameError('');
    }
    
    return true;
  }, [isLogin, checkUsernameAvailability]);
  
  const validateUsername = (value: string) => {
    // Clear error initially
    setUsernameError('');
    
    if (!value || value.trim() === '') {
      setUsernameError('Username cannot be empty');
      return false;
    }
    
    const trimmedValue = value.trim();
    
    if (trimmedValue.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return false;
    }

    if (trimmedValue.length > 20) {
      setUsernameError('Username must be less than 20 characters');
      return false;
    }
    
    // Check for invalid characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedValue)) {
      setUsernameError('Username can only contain letters, numbers, underscores, and hyphens');
      return false;
    }
    
    // If we get here, validation passed
    return true;
  };
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password cannot be empty');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  const handleSubmit = async () => {
    // Clear any previous errors
    setUsernameError('');
    setPasswordError('');
    
    // Validate fields
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword();
    
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }
    
    // For registration, do a final check to ensure username isn't taken
    if (!isLogin) {
      setFormLoading(true);
      try {
        const exists = await checkUsernameAvailability(username);
        if (exists) {
          setUsernameError('Username already taken. Please choose another.');
          setFormLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking username:', error);
      }
    }
    
    setFormLoading(true);
    
    try {
      if (isLogin) {
        // Login
        await login(username, password);
        router.replace('/(tabs)');
      } else {
        // Register
        // Using a default avatar ID for now, in a real app you'd let the user select this
        const avatarId = '1';
        await register(username, password, avatarId);
        // Redirect to avatar selection in the onboarding flow after registration
        router.replace('/onboarding/avatar');
      }
    } catch (error: any) {
      Alert.alert(
        isLogin ? 'Login Failed' : 'Registration Failed',
        error.message || 'Please try again',
        [{ text: 'OK' }]
      );
    } finally {
      setFormLoading(false);
    }
  };
  
  // Reset errors when switching modes
  useEffect(() => {
    setUsernameError('');
    setPasswordError('');
  }, [isLogin]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerWithButtons}>
            <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            
            <Text style={styles.appName}>Boykot App</Text>
            
            <View style={styles.stepIndicatorContainer}>
              <View style={styles.stepDot} />
              <View style={[styles.stepDot, styles.activeDot]} />
              <View style={styles.stepDot} />
              <View style={styles.stepDot} />
            </View>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.subtitle}>
                {isLogin ? 'Login to your account' : 'Create a new account'}
              </Text>
            </View>
            
            <RoundedCard style={styles.formContainer}>
              <RoundedInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  // Clear any existing timeout
                  if (usernameTimeout.current) {
                    clearTimeout(usernameTimeout.current);
                  }
                  
                  // Basic validation for very short usernames
                  if (text.length > 0 && text.length < 3) {
                    setUsernameError('Username must be at least 3 characters');
                    return;
                  } else if (text.length === 0) {
                    setUsernameError('');
                    return;
                  }
                  
                  // For registration, use debounced check to verify availability
                  if (!isLogin && text.length >= 3) {
                    setCheckingUsername(true);
                    setUsernameError('Checking username availability...');
                    
                    usernameTimeout.current = setTimeout(async () => {
                      try {
                        // First do basic validation
                        if (!validateUsername(text)) {
                          setCheckingUsername(false);
                          return;
                        }
                        
                        // Then check availability
                        const exists = await checkUsernameAvailability(text);
                        if (exists) {
                          setUsernameError('Username already taken. Please choose another.');
                        } else {
                          setUsernameError('');
                        }
                      } catch (error) {
                        console.error('Error checking username:', error);
                        setUsernameError('');
                      } finally {
                        setCheckingUsername(false);
                      }
                    }, 600);
                  } else if (text.length >= 3) {
                    // Just do basic validation for login
                    validateUsername(text);
                  }
                }}
                onBlur={() => {
                  if (username && username.length >= 3) {
                    // For registration, check availability on blur as well
                    if (!isLogin) {
                      if (!checkingUsername && usernameError === '') {
                        setCheckingUsername(true);
                        checkUsernameAvailability(username).then(exists => {
                          if (exists) {
                            setUsernameError('Username already taken. Please choose another.');
                          }
                          setCheckingUsername(false);
                        }).catch(error => {
                          console.error('Error checking username on blur:', error);
                          setCheckingUsername(false);
                        });
                      }
                    } else {
                      validateUsername(username);
                    }
                  }
                }}
                error={usernameError}
                autoCapitalize="none"
                returnKeyType="next"
                leftIcon={<Ionicons name="person" size={20} color={Colors.dark.text} />}
                rightIcon={
                  checkingUsername ? 
                  <ActivityIndicator size="small" color={Colors.dark.tint} /> : 
                  undefined
                }
              />
              
              <RoundedInput
                label="Password"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={passwordError}
                returnKeyType={isLogin ? "done" : "next"}
                leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.text} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={Colors.dark.text}
                    />
                  </TouchableOpacity>
                }
              />
              
              {!isLogin && (
                <RoundedInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.text} />}
                />
              )}
              
              <View style={styles.privacyNote}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.dark.tint} />
                <Text style={styles.privacyNoteText}>
                  We don't collect any personal information
                </Text>
              </View>
              
              <RoundedButton
                title={isLogin ? "Login" : "Register"}
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={formLoading || checkingUsername}
                disabled={!isLogin && usernameError !== ''}
              />
              
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setUsernameError('');
                  setPasswordError('');
                }}
              >
                <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </Text>
              </TouchableOpacity>
            </RoundedCard>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.dark.text,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    backgroundColor: Colors.dark.card,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.dark.tint + '15',
    borderRadius: 8,
  },
  privacyNoteText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.dark.text,
  },
  submitButton: {
    marginTop: 20,
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchModeText: {
    color: Colors.dark.tint,
    fontSize: 14,
  },
  headerWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.tint + '30',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.tint,
  },
}); 