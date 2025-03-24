import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface RoundedButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const RoundedButton: React.FC<RoundedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.dark.primary,
          borderColor: Colors.dark.primary,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.dark.secondary,
          borderColor: Colors.dark.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Colors.dark.tint,
          borderWidth: 2,
        };
      case 'danger':
        return {
          backgroundColor: Colors.dark.error,
          borderColor: Colors.dark.error,
        };
      default:
        return {
          backgroundColor: Colors.dark.primary,
          borderColor: Colors.dark.primary,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 12,
        };
      case 'medium':
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 16,
        };
      case 'large':
        return {
          paddingVertical: 14,
          paddingHorizontal: 28,
          borderRadius: 20,
        };
      default:
        return {
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 16,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return Colors.dark.tint;
    }
    return Colors.dark.text;
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.dark.tint : Colors.dark.text}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              { color: getTextColor(), fontSize: getTextSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default RoundedButton; 