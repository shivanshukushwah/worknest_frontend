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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { TextField, Button } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { validateEmail, validatePassword } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';
import { UserRole } from '@mytypes/index';

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
  const slideAnim = useRef(new Animated.Value(40)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
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
      // If login returned user, navigate based on role. Otherwise default to selected role.
      const userRole = userData?.role || role || UserRole.STUDENT;
      const redirectUrl = userRole === UserRole.EMPLOYER ? '/(employer)/index' : '/(student)/index';
      console.log('DEBUG: navigating to', redirectUrl);
      // give context a moment to update before navigating
      await new Promise((res) => setTimeout(res, 200));
      router.replace(redirectUrl);
    } catch (error) {
      shake();
      Alert.alert('Login Failed', getErrorMessage(error));
    }
  };

  return (
    <LinearGradient colors={['#38bdf8', '#0ea5e9']} style={{ flex: 1 }}>
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
          <LottieView
            source={require('../../assets/login.json')}
            autoPlay
            loop
            style={{ width: 220, height: 220, alignSelf: 'center' }}
          />

          {/* HEADER */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your Worknest account</Text>
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
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Login as</Text>
              <TouchableOpacity
                style={styles.roleSelect}
                onPress={() => setShowRolePicker(true)}
              >
                <Text style={styles.roleSelectText}>
                  {role === UserRole.STUDENT
                    ? 'Student'
                    : role === UserRole.EMPLOYER
                    ? 'Employer'
                    : 'Worker'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} />
              </TouchableOpacity>

              <Modal
                visible={showRolePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRolePicker(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowRolePicker(false)}
                >
                  <View style={styles.modalContent}>
                    {[UserRole.STUDENT, UserRole.EMPLOYER, UserRole.WORKER].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.modalItem}
                        onPress={() => {
                          setRole(r);
                          setShowRolePicker(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>
                          {r === UserRole.STUDENT
                            ? 'Student'
                            : r === UserRole.EMPLOYER
                            ? 'Employer'
                            : 'Worker'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            <TextField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              leftIcon={<Ionicons name="mail-outline" size={20} color="#64748b" />}
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!showPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#64748b" />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </Animated.View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerText}> Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
  },
  loginButton: { marginTop: 20 },
  forgotContainer: { alignItems: 'flex-end', marginTop: 6 },
  forgotText: { color: '#0284c7', fontWeight: '600' },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: { color: '#0f172a', fontSize: 14 },
  registerText: { color: '#0284c7', fontWeight: 'bold', fontSize: 15 },
  roleContainer: { marginBottom: 16 },
  roleLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  // dropdown styles
  roleSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  roleSelectText: { fontSize: 14, color: '#0f172a' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
  },
  modalItem: { padding: 12 },
  modalItemText: { fontSize: 16, color: '#111827' },
});
