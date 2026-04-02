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
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { TextField, Button } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { validateOTP } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';

const PENDING_EMAIL_KEY = 'worknest_pending_email';
const { width, height } = Dimensions.get('window');

export default function OTPVerification() {
  const { verifyOTP, isLoading, isAuthenticated, clearOTPPending } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        const stored = await SecureStore.getItemAsync(PENDING_EMAIL_KEY);
        if (stored) setEmail(stored);
      } catch (err) {
        console.error('Error loading email:', err);
      }
    };
    loadEmail();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
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
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      Alert.alert('Verification Failed', message);
    }
  };

  const handleResendOTP = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    try {
      setResendTimer(60);
      setOtp('');
      setError(null);
      Alert.alert('Success', 'A new OTP has been sent to your email');
    } catch (err) {
      Alert.alert('Failed', getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#0F172A', '#1E293B', '#334155']} 
        style={StyleSheet.absoluteFillObject} 
      />
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              clearOTPPending();
              router.replace('/auth');
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <MotiView from={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={styles.lottieContainer}>
            <LottieView source={require('../../assets/opt-verification.json')} autoPlay loop style={styles.lottie} />
          </MotiView>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Verify Email</Text>
            <Text style={styles.subtitle}>We've sent a code to your inbox</Text>
          </Animated.View>

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TextField
              label="Email Address"
              value={email}
              onChangeText={(t) => { setEmail(t); if (error) setError(null); }}
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
              style={styles.inputStyle}
            />

            <TextField
              label="OTP Code"
              placeholder="000000"
              value={otp}
              onChangeText={(t) => { setOtp(t); if (error) setError(null); }}
              keyboardType="number-pad"
              leftIcon={<Ionicons name="key-outline" size={20} color="#94A3B8" />}
              style={styles.inputStyle}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button title="Verify Now" onPress={handleVerifyOTP} loading={isLoading} fullWidth style={styles.verifyBtn} variant="primary" />

            <TouchableOpacity onPress={handleResendOTP} disabled={resendTimer > 0 || isResending} style={styles.resendBtn}>
              <Text style={[styles.resendText, resendTimer > 0 && styles.resendDisabled]}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't get a code? Resend"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  orb: { position: 'absolute', borderRadius: 999, opacity: 0.15 },
  orb1: { width: 300, height: 300, backgroundColor: '#6366F1', top: -50, right: -100 },
  orb2: { width: 250, height: 250, backgroundColor: '#A855F7', bottom: 50, left: -100 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  backButtonText: { color: '#FFF', fontWeight: '600' },
  lottieContainer: { alignItems: 'center', marginBottom: 10 },
  lottie: { width: 180, height: 180 },
  title: { fontSize: 36, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 30 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputStyle: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#FFF' },
  errorText: { color: '#F43F5E', fontSize: 13, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  verifyBtn: { marginTop: 20, borderRadius: 16, height: 56 },
  resendBtn: { marginTop: 20, alignItems: 'center' },
  resendText: { color: '#6366F1', fontWeight: '600', fontSize: 14 },
  resendDisabled: { color: '#64748B' },
});
