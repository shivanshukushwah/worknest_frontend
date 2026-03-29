import React, { useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function StudentLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => pathname.includes(route);

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: '#007AFF',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Jobs',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="job-details"
          options={{
            title: 'Job Details',
          }}
        />
        <Stack.Screen
          name="apply-job"
          options={{
            title: 'Apply for Job',
          }}
        />
        <Stack.Screen
          name="my-applications"
          options={{
            title: 'My Applications',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerLargeTitle: true,
          }}
        />
        <Stack.Screen
          name="complete-profile"
          options={{
            title: 'Complete Profile',
            headerShown: true,
          }}
        />
      </Stack>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(student)')}
        >
          <MaterialCommunityIcons
            name="briefcase"
            size={24}
            color={isActive('') && !isActive('my-applications') && !isActive('profile') ? '#007AFF' : '#999999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(student)/my-applications')}
        >
          <MaterialCommunityIcons
            name="file-document"
            size={24}
            color={isActive('my-applications') ? '#007AFF' : '#999999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/(student)/profile')}
        >
          <Ionicons
            name="person"
            size={24}
            color={isActive('profile') ? '#007AFF' : '#999999'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
});
