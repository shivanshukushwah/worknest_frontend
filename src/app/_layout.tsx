import React from 'react';
import { View } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import LottieView from 'lottie-react-native';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { UserProvider } from '@context/UserContext';
import { NotificationProvider } from '@context/NotificationContext';
import { UserRole } from '@mytypes/index';

function RootNavigationContent() {
  const { isAuthenticated, isOTPPending, isLoading, user } = useAuth();
  const segments = useSegments();

  const inAuthGroup = segments[0] === "auth";
  const inStudentGroup = segments[0] === "(student)";
  const inEmployerGroup = segments[0] === "(employer)";
  const inWalletScreen = segments[0] === "wallet";
  const inNotificationsScreen = segments[0] === "notifications";
  const inProfileScreen = segments[0] === "profile";
  const inOTPScreen =
    segments[0] === "auth" && segments[1] === "otp-verification";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LottieView
          source={require("../assets/lottie/job.json")}
          autoPlay
          loop
          style={{ width: 400, height: 400 }}
        />
      </View>
    );
  }

  if (isOTPPending && !inOTPScreen) {
    return <Redirect href="/auth/otp-verification" />;
  }

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/auth" />;
  }

  if (isAuthenticated && inAuthGroup) {
    const redirectUrl =
      user?.role === UserRole.EMPLOYER ? "/(employer)" : "/(student)";
    return <Redirect href={redirectUrl} />;
  }

  if (
    isAuthenticated &&
    !inStudentGroup &&
    !inEmployerGroup &&
    !inAuthGroup &&
    !inWalletScreen &&
    !inNotificationsScreen &&
    !inProfileScreen
  ) {
    // If user is authenticated but not currently inside any protected group,
    // redirect them to their role's root (student/employer/worker).
    // Workers use the (student) layout. This ensures
    // authenticated users land in the correct layout after an app restart
    // even when the path is empty.
    const redirectUrl =
      user?.role === UserRole.EMPLOYER ? "/(employer)" : "/(student)";
    return <Redirect href={redirectUrl} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(employer)" />
      <Stack.Screen name="index" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="splash" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <NotificationProvider>
          <RootNavigationContent />
        </NotificationProvider>
      </UserProvider>
    </AuthProvider>
  );
}
