import { Stack } from 'expo-router';
import React from 'react';
import Colors from '../../constants/Colors';

export default function BoycottLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
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