import { Stack } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function OnboardingLayout() {
  const colorScheme = useColorScheme();
  
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 