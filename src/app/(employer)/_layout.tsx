import React from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@utils/theme';

export default function EmployerLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '') {
      return pathname === '/(employer)' || pathname === '/(employer)/';
    }
    return pathname.includes(route);
  };

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: Colors.white,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'My Jobs',
          }}
        />
        <Stack.Screen
          name="post-job"
          options={{
            title: 'Post a Job',
          }}
        />
        <Stack.Screen
          name="job-details"
          options={{
            title: 'Job Details',
          }}
        />
        <Stack.Screen
          name="applicants"
          options={{
            title: 'Applicants',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
          }}
        />
      </Stack>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(employer)')}
        >
          <MaterialCommunityIcons
            name={isActive('') && !isActive('post-job') && !isActive('profile') ? "briefcase" : "briefcase-outline"}
            size={24}
            color={isActive('') && !isActive('post-job') && !isActive('profile') ? Colors.primary : Colors.textLight}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(employer)/post-job')}
        >
          <MaterialCommunityIcons
            name={isActive('post-job') ? "plus-circle" : "plus-circle-outline"}
            size={24}
            color={isActive('post-job') ? Colors.primary : Colors.textLight}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(employer)/profile')}
        >
          <Ionicons
            name={isActive('profile') ? "person" : "person-outline"}
            size={24}
            color={isActive('profile') ? Colors.primary : Colors.textLight}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingBottom: 24,
    paddingTop: 12,
    ...Shadows.md,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
