import { Link, router } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import Mascot from '../../components/mascot/Mascot';
import RoundedButton from '../../components/ui/RoundedButton';
import RoundedCard from '../../components/ui/RoundedCard';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mascotContainer}>
          <Mascot expression="wave" size="large" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Welcome to Arkalardayım Anne!
          </Text>
          
          <Text style={styles.description}>
            Track your protest participation, connect with fellow activists, and stay informed about upcoming events.
          </Text>
          
          <RoundedCard style={styles.mascotMessageCard}>
            <Text style={styles.mascotMessage}>
              "I'll be here to guide you through your activism journey. Let's make a difference together!"
            </Text>
          </RoundedCard>
        </View>
        
        <RoundedButton 
          title="Get Started"
          onPress={() => router.push('/onboarding/nickname')}
          variant="secondary"
          size="large"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  mascotContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.dark.text,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    color: Colors.dark.lightGray,
  },
  mascotMessageCard: {
    backgroundColor: Colors.dark.navyPurple,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.secondary,
    width: '100%',
  },
  mascotMessage: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: Colors.dark.almostWhite,
  },
  button: {
    width: '100%',
  },
}); 