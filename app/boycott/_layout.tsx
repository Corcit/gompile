import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function BoycottLayout() {
  // Using dark theme as required by the app
  const colorScheme = 'dark';
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: '',
          presentation: 'card',
        }}
      />
    </Stack>
  );
} 