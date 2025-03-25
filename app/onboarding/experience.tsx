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

  const incrementCount = () => {
    setProtestCount(prev => prev + 1);
  };

  const decrementCount = () => {
    setProtestCount(prev => Math.max(0, prev - 1));
  };

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
        <Text style={styles.title}>Tamirat Deneyiminiz</Text>
        <Text style={styles.subtitle}>
          Tamirat deneyiminizi anlamamıza yardımcı olun
        </Text>
      </View>

      <View style={styles.mascotContainer}>
        <Mascot expression={getMascotExpression()} size="small" />
      </View>

      {!skipQuestion ? (
        <RoundedCard style={styles.counterContainer}>
          <Text style={styles.counterLabel}>
            Kaç tamirata katıldınız?
          </Text>

          <View style={styles.counterControls}>
            <TouchableOpacity
              style={[styles.counterButton, protestCount === 0 && styles.counterButtonDisabled]}
              onPress={decrementCount}
              disabled={protestCount === 0}
            >
              <MaterialIcons name="remove" size={24} color={protestCount === 0 ? Colors.dark.lightGray : Colors.dark.text} />
            </TouchableOpacity>

            <Text style={styles.counterValue}>{protestCount}</Text>

            <TouchableOpacity
              style={styles.counterButton}
              onPress={incrementCount}
            >
              <MaterialIcons name="add" size={24} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.resultContainer}>
            <MaterialIcons
              name="emoji-events"
              size={24}
              color={Colors.dark.secondary}
            />
            <Text style={styles.resultText}>
              {protestCount === 0
                ? "Tamirat yolculuğunuza yeni başlıyorsunuz!"
                : protestCount < 5
                ? "Gelişmekte olan bir tesisatçısınız!"
                : protestCount < 20
                ? "Deneyimli bir tesisatçısınız!"
                : "Usta tesisatçısınız!"}
            </Text>
          </View>
        </RoundedCard>
      ) : (
        <RoundedCard style={styles.skipContainer}>
          <MaterialIcons name="visibility-off" size={48} color={Colors.dark.lightGray} />
          <Text style={styles.skipText}>
            Bu soruyu atlamayı seçtiniz.
          </Text>
          <Text style={styles.skipSubtext}>
            Daha sonra profilinizden güncelleyebilirsiniz.
          </Text>
        </RoundedCard>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={[styles.skipButtonText, skipQuestion && styles.skipButtonTextActive]}>
          {skipQuestion ? 'Soruyu Yanıtla' : 'Soruyu Atla'}
        </Text>
      </TouchableOpacity>

      <RoundedCard style={styles.tip}>
        <MaterialIcons name="lightbulb" size={20} color={Colors.dark.secondary} />
        <Text style={styles.tipText}>
          Tamirat konusunda yeni misiniz? Daha fazla etkinliğe katıldıkça ilerlemenizi takip edin!
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
  counterContainer: {
    flex: 1,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.dark.card,
  },
  counterLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.dark.text,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  counterButton: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  counterButtonDisabled: {
    backgroundColor: Colors.dark.navyPurple,
  },
  counterValue: {
    fontSize: 16,
    marginHorizontal: 10,
    color: Colors.dark.text,
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