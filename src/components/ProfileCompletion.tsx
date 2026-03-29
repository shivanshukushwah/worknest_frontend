import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { getCompletionColor, getProfileCompletionMessage } from '@utils/profile-completion';

interface ProfileCompletionProps {
  percentage: number;
  showMessage?: boolean;
  style?: ViewStyle;
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  percentage,
  showMessage = true,
  style,
}) => {
  const color = getCompletionColor(percentage);
  const message = getProfileCompletionMessage(percentage);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Profile Completion</Text>
        <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {showMessage && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  message: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
});

export default ProfileCompletion;
