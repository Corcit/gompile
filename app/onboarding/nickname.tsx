import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
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

export default function NicknameScreen() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const validateNickname = (value: string) => {
    if (!value.trim()) {
      setNicknameError('Nickname cannot be empty');
      return false;
    }

    if (value.length < 3) {
      setNicknameError('Nickname must be at least 3 characters');
      return false;
    }

    if (value.length > 20) {
      setNicknameError('Nickname must be less than 20 characters');
      return false;
    }

    // Check for inappropriate content - in a real app would call an API
    if (value.toLowerCase().includes('offensive')) {
      setNicknameError('This nickname contains inappropriate content');
      return false;
    }

    setNicknameError('');
    return true;
  };

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleContinue = async () => {
    if (!validateNickname(nickname) || !validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      // Save the nickname and password to AsyncStorage
      await AsyncStorage.setItem('@user:nickname', nickname);
      await AsyncStorage.setItem('@user:password', password); // In a real app, would never store plain text password
      
      // Continue to the next screen
      router.push('/onboarding/avatar');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nickname.trim().length >= 3 && 
                      password.length >= 8 && 
                      password === confirmPassword;

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
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
            </View>
          </View>

          <View style={styles.mascotContainer}>
            <Mascot expression="thinking" size="small" />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              Create your activist profile
            </Text>
            <Text style={styles.subtitle}>
              Choose a nickname and secure password to join the movement
            </Text>

            <RoundedInput
              label="Nickname"
              placeholder="Enter a nickname"
              value={nickname}
              onChangeText={(text) => {
                setNickname(text);
                validateNickname(text);
              }}
              maxLength={20}
              error={nicknameError}
              autoCapitalize="none"
              returnKeyType="next"
              leftIcon={<Ionicons name="person" size={20} color={Colors.dark.lightGray} />}
            />

            <RoundedInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={passwordError}
              returnKeyType="next"
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.lightGray} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.dark.lightGray}
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
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.lightGray} />}
            />

            <RoundedCard style={styles.tipContainer}>
              <Ionicons name="information-circle" size={22} color={Colors.dark.info} />
              <Text style={styles.tipText}>
                Choose a memorable nickname and strong password. Your nickname will be visible to other activists.
              </Text>
            </RoundedCard>
          </View>

          <View style={styles.footer}>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    backgroundColor: Colors.dark.navyPurple,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.secondary,
    width: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
    color: Colors.dark.lightGray,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 20,
    backgroundColor: Colors.dark.navyPurple,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
    color: Colors.dark.lightGray,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  continueButton: {
    width: '100%',
  },
}); 