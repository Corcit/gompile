import { Redirect } from 'expo-router';
import React from 'react';

export default function BoycottRedirect() {
  // Redirect to the tab version of the boycott screen
  return <Redirect href={'/(tabs)/boycott' as any} />;
} 