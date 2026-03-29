import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Shadows } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: string[];
  padding?: number;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({ children, style, gradient, padding = 16, onPress }) => {
  const content = (
    <>
      {gradient ? (
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { padding }, style]}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.card, { padding }, style]}>{children}</View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginVertical: 8,
    ...Shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});

export default Card;
