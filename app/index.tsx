import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Colors } from '../constants/Colors';
import { useColorScheme } from 'react-native';

export default function AppEntryPoint() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding:completed');
        setIsOnboardingCompleted(onboardingCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        <Text style={{ marginTop: 20, color: Colors[colorScheme ?? 'light'].text }}>
          Loading app...
        </Text>
      </View>
    );
  }

  if (isOnboardingCompleted) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/onboarding" />;
  }
} 