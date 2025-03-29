import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import RoundedInput from '../../components/ui/RoundedInput';
import RoundedButton from '../../components/ui/RoundedButton';
import RoundedCard from '../../components/ui/RoundedCard';
import Mascot from '../../components/mascot/Mascot';
import { useAuth } from '../../services/api/AuthContext';

export default function NicknameScreen() {
  const { register, checkUsernameAvailability, isAuthenticated } = useAuth();
  
  const [isLogin, setIsLogin] = useState(false); // Default to register mode in onboarding
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [footerHeight, setFooterHeight] = useState(80); // Default height estimation

  // Use debounce for username checking
  const usernameTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // If user is already authenticated, redirect to main app
    if (isAuthenticated) {
      // Get the current user status from AsyncStorage
      AsyncStorage.getItem('@auth:username').then(username => {
        // Only redirect if we have a username stored, which means a real login not just anonymous auth
        if (username) {
          router.replace('/(tabs)');
        }
      });
    }
  }, [isAuthenticated]);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Debounced username validation
  const validateUsernameDebounced = useCallback(async (value: string) => {
    // Clear any existing timeout
    if (usernameTimeout.current) {
      clearTimeout(usernameTimeout.current);
    }
    
    // Basic validation
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setNicknameError('Username cannot be empty');
      return false;
    }
    
    if (trimmedValue.length < 3) {
      setNicknameError('Username must be at least 3 characters');
      return false;
    }

    if (trimmedValue.length > 20) {
      setNicknameError('Username must be less than 20 characters');
      return false;
    }
    
    // Check for invalid characters
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedValue)) {
      setNicknameError('Username can only contain letters, numbers, underscores, and hyphens');
      return false;
    }
    
    // If in registration mode, check if username exists after a delay
    if (!isLogin) {
      setNicknameError('Checking username availability...');
      setCheckingUsername(true);
      
      usernameTimeout.current = setTimeout(async () => {
        try {
          const exists = await checkUsernameAvailability(trimmedValue);
          if (exists) {
            setNicknameError('Username already taken. Please choose another.');
          } else {
            setNicknameError('');
          }
        } catch (error) {
          console.error('Error checking username:', error);
          setNicknameError('');
        } finally {
          setCheckingUsername(false);
        }
      }, 600);
    } else {
      setNicknameError('');
    }
    
    return true;
  }, [isLogin, checkUsernameAvailability]);

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

  const handleContinue = async () => {
    // Clear any previous errors
    setNicknameError('');
    setPasswordError('');
    
    // Validate password
    const isPasswordValid = validatePassword();
    if (!isPasswordValid) {
      return;
    }
    
    // We need to check username availability regardless of debounced result
    try {
      setLoading(true);
      
      // Double-check username availability synchronously before proceeding
      const trimmedUsername = nickname.trim();
      
      // Basic validation checks
      if (!trimmedUsername) {
        setNicknameError('Username cannot be empty');
        setLoading(false);
        return;
      }
      
      if (trimmedUsername.length < 3) {
        setNicknameError('Username must be at least 3 characters');
        setLoading(false);
        return;
      }
      
      if (trimmedUsername.length > 20) {
        setNicknameError('Username must be less than 20 characters');
        setLoading(false);
        return;
      }
      
      // Check for invalid characters
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(trimmedUsername)) {
        setNicknameError('Username can only contain letters, numbers, underscores, and hyphens');
        setLoading(false);
        return;
      }
      
      // Critical check: Make sure username isn't already taken before registration
      const exists = await checkUsernameAvailability(trimmedUsername);
      if (exists) {
        setNicknameError('Username already taken. Please choose another.');
        setLoading(false);
        return;
      }
      
      // If we get here, username is valid and available
      // Register using the AuthContext
      const avatarId = '1';
      await register(trimmedUsername, password, avatarId);
      
      // Continue to avatar selection
      router.push('/onboarding/avatar');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(
        'Registration Failed',
        error.message || 'Please try again',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nickname.trim().length >= 3 && 
                      password.length >= 8 && 
                      (!isLogin ? password === confirmPassword : true) &&
                      !checkingUsername && 
                      !nicknameError;

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
            <View style={styles.progressIndicator}>
              <View style={[styles.progressDot, styles.activeDot]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>
          </View>

          <View style={styles.mascotContainer}>
            <Mascot expression="thinking" size="small" />
          </View>

          <ScrollView 
            style={[styles.scrollView, { marginBottom: footerHeight }]}
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>
              Create your activist profile
            </Text>
            <Text style={styles.subtitle}>
              Choose a username and secure password to join the movement
            </Text>

            <RoundedInput
              label="Username"
              placeholder="Enter a username"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                validateUsernameDebounced(text);
              }}
              maxLength={20}
              error={nicknameError}
              autoCapitalize="none"
              returnKeyType="next"
              leftIcon={<Ionicons name="person" size={20} color={Colors.dark.secondary} />}
              rightIcon={checkingUsername ? 
                <View style={{padding: 5}}>
                  <Ionicons name="sync" size={20} color={Colors.dark.secondary} /> 
                </View> : undefined}
            />

            <RoundedInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={passwordError}
              returnKeyType="next"
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.secondary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.dark.secondary}
                  />
                </TouchableOpacity>
              }
            />

            <RoundedInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              error={passwordError ? "" : confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
              returnKeyType="done"
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.secondary} />}
            />

            <RoundedCard style={styles.tipContainer}>
              <Ionicons name="information-circle" size={22} color={Colors.dark.accent} />
              <Text style={styles.tipText}>
                Choose a memorable username and strong password. Your username will be visible to other activists.
              </Text>
            </RoundedCard>
          </ScrollView>

          <View 
            style={styles.footer}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setFooterHeight(height);
            }}
          >
            <View style={styles.buttonContainer}>
              <RoundedButton
                title="Continue"
                onPress={handleContinue}
                disabled={!isFormValid}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.continueButton}
                icon={<Ionicons name="arrow-forward" size={20} color={Colors.dark.text} style={{ marginLeft: 8 }} />}
              />
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.secondary,
    marginHorizontal: 6,
    opacity: 0.3,
  },
  activeDot: {
    opacity: 1,
  },
  mascotContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.secondary,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.secondary,
    marginBottom: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.secondary,
    opacity: 0.8,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Colors.dark.text,
  },
  footer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingTop: 16,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.background,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
  },
}); 