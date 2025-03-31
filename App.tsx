import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { ApiProvider } from './services/api/ApiContext';
import { firestore } from './services/firebase';
import initializeFirestoreData from './services/initFirestore';

export default function App() {
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Firestore with sample data when the app starts
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Starting Firestore initialization...');
        
        // Check if firestore is properly initialized
        if (!firestore) {
          throw new Error('Firestore is not properly initialized');
        }
        
        console.log('Firestore instance exists, proceeding with data initialization...');
        await initializeFirestoreData();
        console.log('Firestore initialization completed successfully');
      } catch (error) {
        console.error('Error during initialization:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      }
    };

    initializeData();
  }, []);

  if (initError) {
    console.log('Initialization error occurred:', initError);
  }

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