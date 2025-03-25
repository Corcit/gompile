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

export default function NicknameScreen() {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [footerHeight, setFooterHeight] = useState(80); // Default height estimation

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
              leftIcon={<Ionicons name="person" size={20} color={Colors.dark.textSecondary} />}
            />

            <RoundedInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={passwordError}
              returnKeyType="next"
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.textSecondary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.dark.textSecondary}
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
              leftIcon={<Ionicons name="lock-closed" size={20} color={Colors.dark.textSecondary} />}
            />

            <RoundedCard style={styles.tipContainer}>
              <Ionicons name="information-circle" size={22} color={Colors.dark.blue} />
              <Text style={styles.tipText}>
                Choose a memorable nickname and strong password. Your nickname will be visible to other activists.
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
    backgroundColor: Colors.dark.navyPurple,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.yellowGold,
    width: 20,
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
    backgroundColor: Colors.dark.navyPurple,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footer: {
    width: '100%',
    padding: 16,
    backgroundColor: Colors.dark.background,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    width: '90%',
    backgroundColor: Colors.dark.yellowGold,
  },
}); 