import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface LoaderProps {
  visible: boolean;
  style?: ViewStyle;
  color?: string;
  size?: 'small' | 'large';
}

const Loader: React.FC<LoaderProps> = ({
  visible,
  style,
  color = '#007AFF',
  size = 'large',
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
