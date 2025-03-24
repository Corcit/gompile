import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import Mascot from '../mascot/Mascot';

interface AttendanceButtonProps {
  onPress: () => Promise<boolean>;
  disabled?: boolean;
}

const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = async () => {
    if (disabled || isVerifying || isSuccess) return;

    // Start the animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Set verifying state
    setIsVerifying(true);

    try {
      // Call the attendance verification function
      const result = await onPress();
      
      // Show success state
      setIsSuccess(result);
      
      // Reset after 3 seconds
      if (result) {
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Attendance verification failed:', error);
    } finally {
      // Reset verifying state
      setIsVerifying(false);
    }
  };

  const getButtonColor = () => {
    if (isSuccess) return Colors.dark.success;
    return Colors.dark.primary;
  };

  const getButtonText = () => {
    if (isSuccess) return 'Attendance Verified!';
    if (isVerifying) return 'Verifying...';
    return 'I Am Attending';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: getButtonColor() },
            disabled && styles.disabled,
          ]}
          onPress={handlePress}
          disabled={disabled || isVerifying || isSuccess}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {isSuccess && (
        <View style={styles.mascotContainer}>
          <Mascot expression="celebrate" size="medium" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonText: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  mascotContainer: {
    position: 'absolute',
    bottom: -60,
  },
});

export default AttendanceButton; 