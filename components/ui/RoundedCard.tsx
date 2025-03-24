import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors } from '../../constants/Colors';

interface RoundedCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: number;
  color?: string;
}

const RoundedCard: React.FC<RoundedCardProps> = ({
  children,
  style,
  elevation = 2,
  color = Colors.dark.card,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: color },
        elevation > 0 && {
          shadowOpacity: 0.1,
          shadowRadius: elevation * 2,
          shadowOffset: { width: 0, height: elevation },
          elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    margin: 8,
    overflow: 'hidden',
  },
});

export default RoundedCard; 