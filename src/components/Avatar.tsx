import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { getInitials } from '@utils/helpers';
import { Colors } from '../utils/theme';

interface AvatarProps {
  source?: string;
  initials?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle | ImageStyle;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  name,
  size = 'medium',
  style,
}) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, fontSize: 12 };
      case 'large':
        return { width: 64, height: 64, fontSize: 24 };
      default:
        return { width: 48, height: 48, fontSize: 16 };
    }
  };

  const sizeStyle = getSizeStyle();

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar,
          {
            width: sizeStyle.width,
            height: sizeStyle.height,
            borderRadius: sizeStyle.width / 2,
          },
          style as any,
        ]}
      />
    );
  }

  const displayInitials = initials || (name ? getInitials(name) : '?');

  return (
    <View
      style={[
        styles.avatar,
        styles.initialsContainer,
        {
          width: sizeStyle.width,
          height: sizeStyle.height,
          borderRadius: sizeStyle.width / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initialsText, { fontSize: sizeStyle.fontSize }]}>
        {displayInitials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.gray[200],
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  initialsText: {
    fontWeight: '700',
    color: Colors.white,
  },
});

export default Avatar;
