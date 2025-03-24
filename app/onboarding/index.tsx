import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { router, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';

export default function OnboardingIndex() {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // Check if onboarding has been completed
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        
        if (hasCompletedOnboarding === 'true') {
          // If onboarding is completed, go to main app
          router.replace('/(tabs)');
        } else {
          // Otherwise, go to the welcome screen
          router.replace('/onboarding/welcome');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to welcome screen on error
        router.replace('/onboarding/welcome');
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.dark.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
}); 