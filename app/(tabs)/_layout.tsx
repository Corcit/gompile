import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  // Using dark theme as required
  const colorScheme = 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.dark.almostWhite,
        tabBarStyle: { 
          paddingBottom: 5,
          backgroundColor: Colors.dark.navyPurple,
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
          opacity: 1,
        },
        tabBarIconStyle: {
          opacity: 1,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarShowLabel: true,
        headerStyle: {
          backgroundColor: Colors.dark.background,
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarActiveBackgroundColor: Colors.dark.background + '44',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          headerTitle: 'arkalardayım anne',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="leaderboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
