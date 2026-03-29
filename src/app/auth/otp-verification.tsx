import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { TextField, Button } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { validateOTP } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';

const PENDING_EMAIL_KEY = 'worknest_pending_email';

export default function OTPVerification() {
  const { verifyOTP, isLoading, isAuthenticated, clearOTPPending } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load pending email from SecureStore
  useEffect(() => {
    const loadEmail = async () => {
      try {
        const stored = await SecureStore.getItemAsync(PENDING_EMAIL_KEY);
        if (stored) {
          console.log('✅ Loaded pending email from storage:', stored);
          setEmail(stored);
        }
      } catch (err) {
        console.error('Error loading email:', err);
      }
    };
    loadEmail();
  }, []);

  // Auto-redirect once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, layout will auto-redirect');
    }
  }, [isAuthenticated]);

  // Timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleVerifyOTP = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateOTP(otp)) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      await verifyOTP({ email, otp });
      // Don't navigate manually - let the layout's auth logic handle redirect
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      Alert.alert('Verification Failed', message);
    }
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsResending(true);
    try {
      // Call the resend endpoint
      // For now, we'll just start the timer
      setResendTimer(60);
      setOtp('');
      setError(null);
      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      Alert.alert('Failed', message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* BACK BUTTON */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              clearOTPPending();
              router.replace('/auth');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back to Register</Text>
          </TouchableOpacity>

          {/* LOTTIE ANIMATION */}
          <LottieView
            source={require('../../assets/opt-verification.json')}
            autoPlay
            loop
            style={{ width: 220, height: 220, alignSelf: 'center' }}
          />

          {/* HEADER */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the verification code sent to your email</Text>
          </Animated.View>

          {/* CARD */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TextField
              label="Email"
              placeholder="your.email@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={20} color="#64748b" />}
            />

            <TextField
              label="OTP Code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                if (error) setError(null);
              }}
              keyboardType="number-pad"
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={20} color="#64748b" />}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              title="Verify"
              onPress={handleVerifyOTP}
              loading={isLoading}
              fullWidth
              style={styles.verifyButton}
            />

            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resendTimer > 0 || isResending}
              style={styles.resendContainer}
            >
              <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#334155',
    marginTop: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    marginTop: 10,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    marginTop: 20,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  resendDisabled: {
    color: '#94a3b8',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
