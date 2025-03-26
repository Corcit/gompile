import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';

import { Colors } from '../../constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // Using dark theme as required
  const colorScheme = 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: 'Gompile',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 20,
            color: Colors.dark.almostWhite,
          },
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sıralama',
          tabBarIcon: ({ color }) => <TabBarIcon name="leaderboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="boycott"
        options={{
          title: 'Daha da Gelmem',
          tabBarIcon: ({ color }) => <TabBarIcon name="block" color={color} />,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: 'Haberler',
          tabBarIcon: ({ color }) => <TabBarIcon name="campaign" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
