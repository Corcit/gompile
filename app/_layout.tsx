import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { ApiProvider } from '../services/api/ApiContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  // We'll use dark mode always as per requirements
  const colorScheme = 'dark';

  useEffect(() => {
    // Prepare resources
    async function prepare() {
      try {
        // Check if onboarding is completed
        const onboardingCompleted = await AsyncStorage.getItem('@onboarding:completed');
        
        // Any other preparation tasks like loading fonts, etc.
        
      } catch (e) {
        console.warn('Error preparing app:', e);
      } finally {
        // Tell the application to render
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.dark.background }]}>
        <Text style={[styles.loadingText, { color: Colors.dark.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ApiProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/index" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/nickname" />
        <Stack.Screen name="onboarding/avatar" />
        <Stack.Screen name="onboarding/experience" />
        <Stack.Screen name="onboarding/notifications" />
        <Stack.Screen name="onboarding/final-registration" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
