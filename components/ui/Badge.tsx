import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Colors } from '../../constants/Colors';

type BadgeType = 'achievement' | 'level' | 'streak' | 'attendance' | 'special';

interface BadgeProps {
  title: string;
  description?: string;
  type?: BadgeType;
  icon?: any; // Image source
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  size?: 'small' | 'medium' | 'large';
  unlocked?: boolean;
  style?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  title,
  description,
  type = 'achievement',
  icon,
  iconColor,
  backgroundColor,
  borderColor,
  size = 'medium',
  unlocked = true,
  style,
  iconStyle,
  titleStyle,
  descriptionStyle,
}) => {
  // Get the size dimensions
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 60;
      case 'medium':
        return 80;
      case 'large':
        return 100;
      default:
        return 80;
    }
  };

  // Get background color based on type
  const getBackgroundColor = (): string => {
    if (backgroundColor) return backgroundColor;
    if (!unlocked) return Colors.dark.navyPurple;

    switch (type) {
      case 'achievement':
        return Colors.dark.primary;
      case 'level':
        return Colors.dark.accent;
      case 'streak':
        return Colors.dark.secondary;
      case 'attendance':
        return Colors.dark.info;
      case 'special':
        return Colors.dark.accent;
      default:
        return Colors.dark.primary;
    }
  };

  // Get border color based on type
  const getBorderColor = (): string => {
    if (borderColor) return borderColor;
    if (!unlocked) return 'rgba(255, 255, 255, 0.2)';

    switch (type) {
      case 'achievement':
        return Colors.dark.primary;
      case 'level':
        return Colors.dark.accent;
      case 'streak':
        return Colors.dark.secondary;
      case 'attendance':
        return Colors.dark.info;
      case 'special':
        return Colors.dark.accent;
      default:
        return Colors.dark.primary;
    }
  };

  // Get text color
  const getTextColor = (): string => {
    if (!unlocked) return Colors.dark.lightGray;
    return Colors.dark.text;
  };

  const badgeSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            opacity: unlocked ? 1 : 0.5,
          },
        ]}
      >
        {icon ? (
          <Image
            source={icon}
            style={[
              styles.icon,
              {
                width: badgeSize * 0.6,
                height: badgeSize * 0.6,
                tintColor: iconColor || Colors.dark.text,
              },
              iconStyle,
            ]}
            resizeMode="contain"
          />
        ) : (
          <Text style={[styles.placeholder, { color: iconColor || Colors.dark.text }]}>
            {title.charAt(0)}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.title,
          {
            color: getTextColor(),
            fontSize: size === 'small' ? 12 : size === 'medium' ? 14 : 16,
          },
          titleStyle,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: unlocked ? Colors.dark.lightGray : Colors.dark.navyPurple,
              fontSize: size === 'small' ? 10 : size === 'medium' ? 12 : 14,
            },
            descriptionStyle,
          ]}
          numberOfLines={2}
        >
          {description}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 40,
    height: 40,
  },
  placeholder: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  description: {
    textAlign: 'center',
    maxWidth: 120,
  },
});

export default Badge; 