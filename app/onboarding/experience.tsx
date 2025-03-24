import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import Slider from '@react-native-community/slider';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import RoundedButton from '../../components/ui/RoundedButton';
import RoundedCard from '../../components/ui/RoundedCard';
import RoundedInput from '../../components/ui/RoundedInput';
import Mascot from '../../components/mascot/Mascot';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExperienceScreen() {
  const [protestCount, setProtestCount] = useState(0);
  const [skipQuestion, setSkipQuestion] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSliderChange = (value: number) => {
    setProtestCount(Math.round(value));
    if (skipQuestion) {
      setSkipQuestion(false);
    }
  };

  const handleInputChange = (text: string) => {
    const value = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setProtestCount(value);
      if (skipQuestion) {
        setSkipQuestion(false);
      }
    } else if (text === '') {
      setProtestCount(0);
    }
  };

  const handleSkip = () => {
    setSkipQuestion(!skipQuestion);
    if (!skipQuestion) {
      setProtestCount(0);
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      // Save protest count to AsyncStorage
      await AsyncStorage.setItem('@user:protestCount', protestCount.toString());
      // Navigate to the next screen
      router.push('/onboarding/notifications');
    } catch (error) {
      console.error('Error saving protest count:', error);
      Alert.alert('Error', 'Failed to save your experience data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMascotExpression = () => {
    if (skipQuestion) return 'thinking';
    if (protestCount === 0) return 'default';
    if (protestCount < 5) return 'happy';
    if (protestCount < 20) return 'excited';
    return 'celebrate';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        
        <View style={styles.progressIndicator}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.activeDot]} />
          <View style={styles.progressDot} />
        </View>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Your Protest Experience</Text>
        <Text style={styles.subtitle}>
          Help us understand your level of activism
        </Text>
      </View>

      <View style={styles.mascotContainer}>
        <Mascot expression={getMascotExpression()} size="small" />
      </View>

      {!skipQuestion ? (
        <RoundedCard style={styles.experienceContainer}>
          <Text style={styles.question}>
            How many protests have you attended so far?
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={protestCount}
              onValueChange={handleSliderChange}
              minimumTrackTintColor={Colors.dark.secondary}
              maximumTrackTintColor={Colors.dark.navyPurple}
              thumbTintColor={Colors.dark.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0</Text>
              <Text style={styles.sliderLabel}>50</Text>
              <Text style={styles.sliderLabel}>100+</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Exact number:</Text>
            <TextInput
              style={[
                styles.input,
                { color: Colors.dark.text }
              ]}
              keyboardType="numeric"
              value={protestCount.toString()}
              onChangeText={handleInputChange}
              maxLength={3}
              placeholderTextColor={Colors.dark.placeholder}
              selectionColor={Colors.dark.secondary}
            />
          </View>

          <View style={styles.resultContainer}>
            <MaterialIcons
              name="emoji-events"
              size={24}
              color={Colors.dark.secondary}
            />
            <Text style={styles.resultText}>
              {protestCount === 0
                ? "You're just starting your activism journey!"
                : protestCount < 5
                ? "You're an emerging activist!"
                : protestCount < 20
                ? "You're an experienced activist!"
                : "You're a veteran activist!"}
            </Text>
          </View>
        </RoundedCard>
      ) : (
        <RoundedCard style={styles.skipContainer}>
          <MaterialIcons name="visibility-off" size={48} color={Colors.dark.lightGray} />
          <Text style={styles.skipText}>
            You've chosen to skip this question.
          </Text>
          <Text style={styles.skipSubtext}>
            You can always update this later in your profile.
          </Text>
        </RoundedCard>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={[styles.skipButtonText, skipQuestion && styles.skipButtonTextActive]}>
          {skipQuestion ? 'Answer Question' : 'Skip Question'}
        </Text>
      </TouchableOpacity>

      <RoundedCard style={styles.tip}>
        <MaterialIcons name="lightbulb" size={20} color={Colors.dark.secondary} />
        <Text style={styles.tipText}>
          New to protests? Track your progress as you participate in more actions!
        </Text>
      </RoundedCard>

      <View style={styles.navigation}>
        <RoundedButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          variant="secondary"
          size="large"
          style={styles.continueButton}
          icon={<MaterialIcons name="arrow-forward" size={24} color={Colors.dark.text} style={{ marginLeft: 8 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.navyPurple,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.secondary,
    width: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.lightGray,
    textAlign: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  experienceContainer: {
    flex: 1,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.dark.card,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.dark.text,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    color: Colors.dark.lightGray,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    color: Colors.dark.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 8,
    padding: 10,
    width: 70,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: Colors.dark.navyPurple,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.navyPurple,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    marginLeft: 10,
    flexShrink: 1,
    color: Colors.dark.text,
  },
  skipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 30,
    backgroundColor: Colors.dark.card,
  },
  skipText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.dark.text,
  },
  skipSubtext: {
    fontSize: 14,
    color: Colors.dark.lightGray,
    textAlign: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  skipButtonText: {
    color: Colors.dark.lightGray,
    fontSize: 16,
  },
  skipButtonTextActive: {
    color: Colors.dark.secondary,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.navyPurple,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  tipText: {
    fontSize: 14,
    marginLeft: 10,
    flexShrink: 1,
    color: Colors.dark.lightGray,
  },
  navigation: {
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
  },
}); 