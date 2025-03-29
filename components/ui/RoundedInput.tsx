import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TextInputProps,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface RoundedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const RoundedInput: React.FC<RoundedInputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  ...props
}) => {
  // iOS specific password input attributes
  const passwordAttributes = Platform.OS === 'ios' && secureTextEntry ? {
    // Help iOS recognize this as a password field
    passwordRules: 'required: upper; required: lower; required: digit; max-consecutive: 2; minlength: 8;',
    // Use a valid textContentType value to prevent yellow background
    textContentType: 'oneTimeCode' as const, // This won't trigger the yellow background
    // No need for style here, we'll apply it directly
  } : {};

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        // Apply a dark background for password fields on iOS to override the yellow
        Platform.OS === 'ios' && secureTextEntry ? styles.iosPasswordField : null,
      ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            inputStyle,
            leftIcon ? { paddingLeft: 40 } : null,
            rightIcon ? { paddingRight: 40 } : null,
            // Apply text styling for password fields on iOS
            Platform.OS === 'ios' && secureTextEntry ? styles.iosPasswordText : null,
          ]}
          placeholderTextColor={Colors.dark.placeholder}
          secureTextEntry={secureTextEntry}
          {...passwordAttributes}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: Colors.dark.text,
    marginBottom: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    position: 'relative',
    borderRadius: 16,
    backgroundColor: Colors.dark.navyPurple,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  input: {
    color: Colors.dark.text,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 16,
  },
  // New styles for iOS password fields
  iosPasswordField: {
    backgroundColor: '#2A2A36', // Much darker background to override the yellow
  },
  iosPasswordText: {
    color: '#FFFFFF', // White text for better contrast on dark background
  },
  iconLeft: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  error: {
    color: Colors.dark.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default RoundedInput; 