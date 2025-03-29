import { Redirect } from 'expo-router';
import { useAuth } from '../services/api/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background }}>
        <ActivityIndicator size="large" color={Colors.dark.tint} />
        <Text style={{ marginTop: 10, color: Colors.dark.text }}>Loading...</Text>
      </View>
    );
  }

  // If authenticated, go to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, go to onboarding
  return <Redirect href="/onboarding" />;
} 