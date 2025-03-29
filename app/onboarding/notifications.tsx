import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  useColorScheme,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoundedButton from '../../components/ui/RoundedButton';
import RoundedCard from '../../components/ui/RoundedCard';
import Mascot from '../../components/mascot/Mascot';

export default function NotificationsScreen() {
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colorScheme = useColorScheme() || 'dark';
  const isDark = colorScheme === 'dark';

  const toggleNotifications = () => {
    setAllowNotifications(!allowNotifications);
  };

  const completeOnboarding = async () => {
    try {
      setIsSubmitting(true);
      
      // Save user preferences
      await AsyncStorage.setItem('notifications_enabled', allowNotifications.toString());
      
      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/onboarding/experience')}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <Text style={styles.appName}>Boykot App</Text>
        
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.activeDot]} />
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.mascotContainer}>
          <Mascot expression="happy" size="medium" />
        </View>

        <RoundedCard style={styles.contentCard}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Stay Updated</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Never miss an important protest or announcement
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <RoundedCard style={styles.optionItem}>
              <View style={styles.optionTextContainer}>
                <Ionicons 
                  name="notifications" 
                  size={24} 
                  color={Colors[colorScheme].tint} 
                />
                <View style={styles.optionTextContent}>
                  <Text style={[styles.optionTitle, isDark && styles.optionTitleDark]}>Push Notifications</Text>
                  <Text style={[styles.optionDescription, isDark && styles.optionDescriptionDark]}>
                    Receive updates about protests, announcements, and community alerts
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ 
                  false: '#767577', 
                  true: Colors[colorScheme].tint + '80'
                }}
                thumbColor={allowNotifications ? Colors[colorScheme].tint : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#3e3e3e' : '#d1d1d1'}
                onValueChange={toggleNotifications}
                value={allowNotifications}
              />
            </RoundedCard>
          </View>

          <View style={[styles.infoContainer, isDark && styles.infoContainerDark]}>
            <MaterialIcons name="privacy-tip" size={20} color={isDark ? "#aaa" : "#888"} />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              You can change these settings anytime in your profile. We value your privacy and will only use notifications to enhance your activism experience.
            </Text>
          </View>
        </RoundedCard>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <RoundedButton 
          title="Skip"
          variant="outline"
          onPress={() => completeOnboarding()}
          style={styles.skipButton}
          disabled={isSubmitting}
        />
        <RoundedButton 
          title="Continue"
          variant="primary"
          onPress={completeOnboarding}
          style={styles.continueButton}
          loading={isSubmitting}
          icon={<Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  containerDark: {
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.tint + '30',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.tint,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.tint,
    borderRadius: 3,
  },
  progressText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  progressTextDark: {
    color: '#fff',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  contentCard: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#aaa',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  optionTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  optionTitleDark: {
    color: '#fff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionDescriptionDark: {
    color: '#aaa',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
  },
  infoContainerDark: {
    backgroundColor: '#282828',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoTextDark: {
    color: '#aaa',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  skipButton: {
    flex: 1,
    marginRight: 10,
  },
  continueButton: {
    flex: 2,
  },
}); 