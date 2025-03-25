import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ApiProvider } from './services/api/ApiContext';

export default function App() {
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