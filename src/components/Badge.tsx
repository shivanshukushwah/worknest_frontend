import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/theme';

interface BadgeProps {
  label: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
}

const Badge: React.FC<BadgeProps> = ({ label, color = 'primary' }) => {
  const getBackgroundColor = () => {
    switch (color) {
      case 'success':
        return 'rgba(16, 185, 129, 0.1)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.1)';
      case 'danger':
        return 'rgba(244, 63, 94, 0.1)';
      case 'accent':
        return 'rgba(251, 191, 36, 0.1)';
      case 'primary':
      default:
        return 'rgba(79, 70, 229, 0.1)';
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'success':
        return Colors.success;
      case 'warning':
        return '#B45309'; // Darker amber
      case 'danger':
        return Colors.danger;
      case 'accent':
        return '#92400E'; // Darker amber/accent
      case 'primary':
      default:
        return Colors.primary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Badge;
