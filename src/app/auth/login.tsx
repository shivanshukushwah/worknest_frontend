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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Invalid email format';

    if (!password) newErrors.password = 'Password is required';
    else {
      const pwd = validatePassword(password);
      if (!pwd.valid) newErrors.password = pwd.message;
    }
    if (!role) newErrors.role = 'Role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      shake();
      return;
    }

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
            <Text style={styles.subtitle}>Welcome back to the future of work</Text>
          </Animated.View>

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
            {/* ROLE SELECTOR */}
            <View style={styles.roleWrapper}>
              <Text style={styles.inputLabel}>Login as</Text>
              <View style={styles.roleButtonGroup}>
                {[UserRole.STUDENT, UserRole.EMPLOYER].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[
                      styles.roleButton,
                      role === r && styles.roleButtonActive
                    ]}
                  >
                    <MaterialCommunityIcons 
                      name={r === UserRole.STUDENT ? 'account-school' : 'briefcase-account'} 
                      size={20} 
                      color={role === r ? '#FFF' : '#94A3B8'} 
                    />
                    <Text style={[styles.roleButtonText, role === r && styles.roleButtonTextActive]}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
              variant="primary"
            />
          </Animated.View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Worknest?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerText}> Join Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.15,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#6366F1',
    top: -50,
    right: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#A855F7',
    bottom: 50,
    left: -100,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#F59E0B',
    top: height / 2,
    right: -50,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  lottie: {
    width: 180,
    height: 180,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '400',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)', // For web, won't affect native but looks clean
    elevation: 4,
  },
  roleWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
  },
  roleButtonGroup: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  roleButtonActive: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  inputGroup: {
    gap: 0,
  },
  inputStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFF',
  },
  forgotBtn: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 16,
    height: 56,
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  registerText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 15,
  },
});
