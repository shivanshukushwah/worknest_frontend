import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Shadows } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'accent';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const getGradientColors = (): string[] => {
    if (disabled || loading) return [Colors.gray[300], Colors.gray[400]];
    switch (variant) {
      case 'primary':
        return [Colors.primary, Colors.primaryDark];
      case 'secondary':
        return [Colors.secondary, '#7C3AED']; // Violet 600
      case 'accent':
        return [Colors.accent, '#F59E0B']; // Amber 500
      case 'danger':
        return [Colors.danger, '#E11D48']; // Rose 600
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return [Colors.primary, Colors.primaryDark];
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return Colors.primary;
    return Colors.white;
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const isOutline = variant === 'outline';

  return (
    <Animated.View style={[fullWidth && { width: '100%' }, animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={fullWidth ? { width: '100%' } : {}}
      >
        <LinearGradient
          colors={getGradientColors() as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            getPadding(),
            isOutline && {
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderColor: Colors.primary,
            },
            !isOutline && !disabled && !loading && Shadows.md,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={getTextColor()} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: getTextColor() },
                textStyle,
              ]}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default Button;
