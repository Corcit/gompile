import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ApiProvider } from './services/api/ApiContext';
import { firestore } from './services/firebase';
import initializeFirestoreData from './services/initFirestore';

export default function App() {
  // Initialize Firestore with sample data when the app starts
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing Firestore with sample data...');
        await initializeFirestoreData();
      } catch (error) {
        console.error('Error initializing Firestore:', error);
      }
    };

    initializeData();
  }, []);

  return (
    <ApiProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 