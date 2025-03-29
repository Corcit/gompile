import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { ApiProvider } from '../services/api/ApiContext';
import { AuthProvider } from '../services/api/AuthContext';

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
        // Any preparation tasks like loading fonts, etc.
        
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
    <AuthProvider>
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
          <Stack.Screen name="login" options={{ gestureEnabled: false }} />
          <Stack.Screen 
            name="onboarding" 
            options={{ 
              headerShown: false,
              gestureEnabled: false 
            }} 
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        </Stack>
      </ApiProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});
