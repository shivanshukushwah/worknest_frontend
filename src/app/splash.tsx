import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@context/AuthContext';
import LottieView from 'lottie-react-native';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(student)');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <LottieView
        source={{ uri: 'https://lottie.host/c7e45599-c8f5-4027-a106-16354eddd1c8/snzgHYp2ls.lottie' }}
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
      />
    </View>
  );
}
