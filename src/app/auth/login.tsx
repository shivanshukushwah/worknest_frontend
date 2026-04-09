import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { TextField, Button } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { validateEmail, validatePassword } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';
import { UserRole } from '@mytypes/index';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateStep = (step: number) => {
    const newErrors: any = {};
    if (step === 0) {
      if (!role) newErrors.role = 'Role is required';
    } else {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Invalid email format';
      if (!password) newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 0) {
        setCurrentStep(1);
      } else {
        handleLogin();
      }
    } else {
      shake();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(0);
    } else {
      router.back();
    }
  };

  const handleLogin = async () => {
    try {
      const userData = await login({ email, password, role });
      const userRole = userData?.role || role || UserRole.STUDENT;
      const redirectUrl = userRole === UserRole.EMPLOYER ? '/(employer)/index' : '/(student)/index';
      await new Promise((res) => setTimeout(res, 200));
      router.replace(redirectUrl);
    } catch (error) {
      shake();
      Alert.alert('Login Failed', getErrorMessage(error));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MotiView from={{ opacity: 0, translateX: -50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <View style={styles.roleWrapper}>
              <Text style={styles.inputLabel}>Login as</Text>
              <View style={styles.roleVerticalGroup}>
                {[UserRole.STUDENT, UserRole.WORKER, UserRole.EMPLOYER].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.roleCard, role === r && styles.roleCardActive]}
                  >
                    <View style={[styles.roleIconBox, role === r && styles.roleIconBoxActive]}>
                      <MaterialCommunityIcons 
                        name={
                          r === UserRole.STUDENT ? 'account-school' : 
                          r === UserRole.WORKER ? 'account-wrench' : 
                          'briefcase-account'
                        } 
                        size={28} 
                        color={role === r ? '#FFF' : '#6366F1'} 
                      />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={[styles.roleCardTitle, role === r && styles.roleCardTitleActive]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </View>
                    {role === r && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </MotiView>
        );
      case 1:
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <View style={styles.inputGroup}>
              <TextField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                leftIcon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />}
                style={styles.inputStyle}
              />

              <TextField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />}
                style={styles.inputStyle}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </MotiView>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#0F172A', '#1E293B', '#334155']} 
        style={StyleSheet.absoluteFillObject} 
      />
      
      {/* Background Orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}
        >
          {/* LOTTIE */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 1000 }}
            style={styles.lottieContainer}
          >
            <LottieView
              source={require('../../assets/login.json')}
              autoPlay
              loop
              style={styles.lottie}
            />
          </MotiView>

          {/* HEADER */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>Worknest</Text>
            <Text style={styles.subtitle}>
              {currentStep === 0 ? 'Select your persona' : 'Welcome back to the future of work'}
            </Text>
          </Animated.View>

          <View style={styles.progressContainer}>
            {[0, 1].map((i) => (
              <View 
                key={i} 
                style={[
                  styles.progressDot, 
                  currentStep >= i && styles.progressDotActive,
                  currentStep === i && styles.progressDotCurrent
                ]} 
              />
            ))}
          </View>

          {/* CARD */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
              },
            ]}
          >
            {renderStepContent()}

            <View style={styles.buttonRow}>
              {currentStep > 0 && (
                <Button 
                  title="Back" 
                  onPress={handleBack} 
                  variant="outline" 
                  style={styles.backBtn}
                />
              )}
              <Button 
                title={currentStep === 1 ? 'Sign In' : 'Continue'} 
                loading={isLoading} 
                onPress={handleNext} 
                style={currentStep === 0 ? { flex: 1 } : styles.nextBtn} 
                variant="primary" 
              />
            </View>
          </Animated.View>

          {/* FOOTER */}
          {currentStep === 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Worknest?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerText}> Join Now</Text>
              </TouchableOpacity>
            </View>
          )}
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
  orb3: { width: 200, height: 200, backgroundColor: '#F59E0B', top: height / 2, right: -50 },
  scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  lottieContainer: { alignItems: 'center', marginBottom: 10 },
  lottie: { width: 180, height: 180 },
  title: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 4, marginBottom: 20, textAlign: 'center', fontWeight: '400' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressDotActive: { backgroundColor: '#4F46E5' },
  progressDotCurrent: { width: 30 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', elevation: 4 },
  roleWrapper: { marginBottom: 10 },
  roleVerticalGroup: { gap: 12 },
  roleCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 16
  },
  roleCardActive: { backgroundColor: '#4F46E5', borderColor: '#6366F1' },
  roleIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center' },
  roleIconBoxActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  roleTextContainer: { flex: 1 },
  roleCardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  roleCardTitleActive: { color: '#FFF' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 16, textAlign: 'center' },
  inputGroup: { gap: 0 },
  inputStyle: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#FFF' },
  forgotBtn: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#6366F1', fontWeight: '600', fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  backBtn: { flex: 0.4, borderRadius: 16, height: 56 },
  nextBtn: { flex: 1, borderRadius: 16, height: 56 },
  footer: { marginTop: 32, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: '#94A3B8', fontSize: 15 },
  registerText: { color: '#6366F1', fontWeight: '700', fontSize: 15 },
});
