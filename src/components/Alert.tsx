import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AlertProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const Alert: React.FC<AlertProps> = ({
  visible,
  type = 'info',
  message,
  duration = 3000,
  onDismiss,
  style,
}) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible && duration) {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!show) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#D1F4E0';
      case 'error':
        return '#FADBD8';
      case 'warning':
        return '#FCF3CF';
      case 'info':
        return '#D6EAF8';
      default:
        return '#E8E8E8';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#186A3B';
      case 'error':
        return '#78281F';
      case 'warning':
        return '#7D6608';
      case 'info':
        return '#154360';
      default:
        return '#333333';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: getTextColor() }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Alert;
