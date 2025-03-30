import React from 'react';
import { View, Image, StyleSheet, Animated, Easing, StyleProp, ViewStyle } from 'react-native';

// Types of expressions/states for the mascot
export type MascotExpression = 
  'default' | 
  'happy' | 
  'excited' | 
  'celebrate' | 
  'sad' | 
  'thinking' | 
  'sleeping' | 
  'wave';

interface MascotProps {
  expression?: MascotExpression;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mascot component that displays the app's mascot character
 * with different expressions and animations
 */
const Mascot: React.FC<MascotProps> = ({
  expression = 'default',
  size = 'medium',
  animated = true,
  style,
}) => {
  // Animation values
  const bounceAnim = React.useRef(new Animated.Value(0)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Get the appropriate image based on expression
  const getMascotImage = () => {
    // Use the new image file with a cache-busting timestamp
    return require('../../assets/mascot/default-new.png');
  };

  // Get the appropriate size based on the size prop
  const getMascotSize = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'medium':
        return { width: 120, height: 120 };
      case 'large':
        return { width: 180, height: 180 };
      default:
        return { width: 120, height: 120 };
    }
  };

  // Start animations
  React.useEffect(() => {
    if (animated) {
      startAnimation();
    }
  }, [animated, expression]);

  // Different animations for different expressions
  const startAnimation = () => {
    switch (expression) {
      case 'default':
        startIdleAnimation();
        break;
      case 'happy':
        startHappyAnimation();
        break;
      case 'excited':
        startExcitedAnimation();
        break;
      case 'celebrate':
        startCelebrateAnimation();
        break;
      case 'sad':
        startSadAnimation();
        break;
      case 'thinking':
        startThinkingAnimation();
        break;
      case 'sleeping':
        // No animation for sleeping
        break;
      case 'wave':
        startWaveAnimation();
        break;
      default:
        startIdleAnimation();
    }
  };

  const startIdleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startHappyAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startExcitedAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCelebrateAnimation = () => {
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const startSadAnimation = () => {
    Animated.timing(bounceAnim, {
      toValue: 5,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const startThinkingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.3,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.3,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Calculate rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.mascotContainer,
          {
            transform: [
              { translateY: bounceAnim },
              { scale: scaleAnim },
              { rotate },
            ],
          },
        ]}
      >
        <Image
          source={getMascotImage()}
          style={[styles.mascot, getMascotSize()]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    width: 120,
    height: 120,
  },
});

export default Mascot; 