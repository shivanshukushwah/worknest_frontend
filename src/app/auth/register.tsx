import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { TextField, Button } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { validateEmail, validatePassword, validatePhone } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';
import { UserRole } from '@mytypes/index';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { MotiView, MotiText } from 'moti';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, [currentStep]);

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,
    age: '',
    city: '',
    state: '',
    country: '',
    skills: '',
    education: '',
    experience: '',
    businessName: '',
    businessType: '',
    businessCity: '',
    businessState: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateStep = (step: number) => {
    const e: any = {};
    if (step === 0) {
      if (!formData.role) e.role = 'Role is required';
    } else if (step === 1) {
      if (!formData.name?.trim()) e.name = 'Name is required';
      if (!validateEmail(formData.email)) e.email = 'Invalid email address';
      if (!validatePhone(formData.phone)) e.phone = 'Invalid phone number';
      if (!validatePassword(formData.password).valid) e.password = 'Weak password';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    } else if (step === 2) {
      if (formData.role === UserRole.STUDENT || formData.role === UserRole.WORKER) {
        if (!formData.age) e.age = 'Age is required';
        if (!formData.city?.trim()) e.city = 'City required';
        if (!formData.state?.trim()) e.state = 'State required';
        if (!formData.skills?.trim()) e.skills = 'Skills required';
      }
      if (formData.role === UserRole.STUDENT && !formData.education?.trim()) e.education = 'Education required';
      if (formData.role === UserRole.WORKER && !formData.experience?.trim()) e.experience = 'Experience required';
      if (formData.role === UserRole.EMPLOYER) {
        if (!formData.businessName?.trim()) e.businessName = 'Business name required';
        if (!formData.businessType?.trim()) e.businessType = 'Business type required';
        if (!formData.businessCity?.trim()) e.businessCity = 'City required';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    try {
      const payload: any = { ...formData };
      if (formData.role !== UserRole.EMPLOYER) {
        payload.age = parseInt(formData.age, 10);
        payload.location = { city: formData.city, state: formData.state, country: formData.country || 'India' };
        payload.skills = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else {
        payload.businessLocation = { city: formData.businessCity, state: formData.businessState };
      }
      await register(payload);
    } catch (err: any) {
      Alert.alert('Registration Failed', getErrorMessage(err));
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const addr = await Location.reverseGeocodeAsync(loc.coords);
      const city = addr[0]?.city || '';
      const state = addr[0]?.region || '';
      
      if (formData.role === UserRole.EMPLOYER) {
        handleFieldChange('businessCity', city);
        handleFieldChange('businessState', state);
      } else {
        handleFieldChange('city', city);
        handleFieldChange('state', state);
      }
    } catch (err: any) {
      Alert.alert('Error', 'Unable to get location');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MotiView from={{ opacity: 0, translateX: -50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <View style={styles.roleWrapper}>
              <Text style={styles.inputLabel}>Choose your role</Text>
              <View style={styles.roleVerticalGroup}>
                {[UserRole.STUDENT, UserRole.WORKER, UserRole.EMPLOYER].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleFieldChange('role', r)}
                    style={[styles.roleCard, formData.role === r && styles.roleCardActive]}
                  >
                    <View style={[styles.roleIconBox, formData.role === r && styles.roleIconBoxActive]}>
                      <MaterialCommunityIcons 
                        name={
                          r === UserRole.STUDENT ? 'account-school' : 
                          r === UserRole.WORKER ? 'account-wrench' : 
                          'briefcase-account'
                        } 
                        size={28} 
                        color={formData.role === r ? '#FFF' : '#6366F1'} 
                      />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={[styles.roleCardTitle, formData.role === r && styles.roleCardTitleActive]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                      <Text style={styles.roleCardDesc}>
                        {r === UserRole.STUDENT ? 'Build projects and find internships' : 
                         r === UserRole.WORKER ? 'Find daily work and service jobs' : 
                         'Post jobs and hire talented students'}
                      </Text>
                    </View>
                    {formData.role === r && (
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
              <TextField label="Full Name" value={formData.name} onChangeText={(t) => handleFieldChange('name', t)} error={errors.name} leftIcon={<Ionicons name="person-outline" size={20} color="#94A3B8" />} style={styles.inputStyle} />
              <TextField label="Email" value={formData.email} onChangeText={(t) => handleFieldChange('email', t)} error={errors.email} keyboardType="email-address" leftIcon={<Ionicons name="mail-outline" size={20} color="#94A3B8" />} style={styles.inputStyle} />
              <TextField label="Phone" value={formData.phone} onChangeText={(t) => handleFieldChange('phone', t)} error={errors.phone} keyboardType="phone-pad" leftIcon={<Ionicons name="call-outline" size={20} color="#94A3B8" />} style={styles.inputStyle} />
              
              <TextField 
                label="Password" 
                secureTextEntry={!showPassword} 
                value={formData.password} 
                onChangeText={(t) => handleFieldChange('password', t)} 
                error={errors.password} 
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />}
                style={styles.inputStyle}
                rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" /></TouchableOpacity>} 
              />
              
              <TextField 
                label="Confirm Password" 
                secureTextEntry={!showConfirmPassword} 
                value={formData.confirmPassword} 
                onChangeText={(t) => handleFieldChange('confirmPassword', t)} 
                error={errors.confirmPassword} 
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#94A3B8" />}
                style={styles.inputStyle}
                rightIcon={<TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#94A3B8" /></TouchableOpacity>} 
              />
            </View>
          </MotiView>
        );
      case 2:
        return (
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 400 }}>
             {formData.role === UserRole.STUDENT && (
                <View style={styles.roleFields}>
                  <TextField label="Age" value={formData.age} onChangeText={(t) => handleFieldChange('age', t)} keyboardType="number-pad" style={styles.inputStyle} error={errors.age} />
                  <View style={styles.row}>
                    <TextField label="City" value={formData.city} onChangeText={(t) => handleFieldChange('city', t)} style={[styles.inputStyle, { flex: 1, marginRight: 8 }]} error={errors.city} />
                    <TextField label="State" value={formData.state} onChangeText={(t) => handleFieldChange('state', t)} style={[styles.inputStyle, { flex: 1 }]} error={errors.state} />
                  </View>
                  <TextField label="Skills" placeholder="e.g. Design, Coding" value={formData.skills} onChangeText={(t) => handleFieldChange('skills', t)} style={styles.inputStyle} error={errors.skills} />
                  <TextField label="Education" value={formData.education} onChangeText={(t) => handleFieldChange('education', t)} style={styles.inputStyle} error={errors.education} />
                </View>
              )}

              {formData.role === UserRole.WORKER && (
                <View style={styles.roleFields}>
                  <TextField label="Age" value={formData.age} onChangeText={(t) => handleFieldChange('age', t)} keyboardType="number-pad" style={styles.inputStyle} error={errors.age} />
                  <View style={styles.row}>
                    <TextField label="City" value={formData.city} onChangeText={(t) => handleFieldChange('city', t)} style={[styles.inputStyle, { flex: 1, marginRight: 8 }]} error={errors.city} />
                    <TextField label="State" value={formData.state} onChangeText={(t) => handleFieldChange('state', t)} style={[styles.inputStyle, { flex: 1 }]} error={errors.state} />
                  </View>
                  <TextField label="Skills" placeholder="e.g. Cleaning, Delivery" value={formData.skills} onChangeText={(t) => handleFieldChange('skills', t)} style={styles.inputStyle} error={errors.skills} />
                  <TextField label="Experience (Years)" value={formData.experience} onChangeText={(t) => handleFieldChange('experience', t)} keyboardType="number-pad" style={styles.inputStyle} error={errors.experience} />
                </View>
              )}

              {formData.role === UserRole.EMPLOYER && (
                <View style={styles.roleFields}>
                  <TextField label="Business Name" value={formData.businessName} onChangeText={(t) => handleFieldChange('businessName', t)} style={styles.inputStyle} error={errors.businessName} />
                  <TextField label="Business Type" placeholder="e.g. Tech, Retail" value={formData.businessType} onChangeText={(t) => handleFieldChange('businessType', t)} style={styles.inputStyle} error={errors.businessType} />
                  <View style={styles.row}>
                    <TextField label="City" value={formData.businessCity} onChangeText={(t) => handleFieldChange('businessCity', t)} style={[styles.inputStyle, { flex: 1, marginRight: 8 }]} error={errors.businessCity} />
                    <TextField label="State" value={formData.businessState} onChangeText={(t) => handleFieldChange('businessState', t)} style={[styles.inputStyle, { flex: 1 }]} error={errors.businessState} />
                  </View>
                </View>
              )}
              
              <TouchableOpacity style={styles.locBtn} onPress={getCurrentLocation}>
                <Ionicons name="location-outline" size={18} color="#6366F1" />
                <Text style={styles.locBtnText}>Use Current Location</Text>
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
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <MotiView from={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={styles.lottieContainer}>
            <LottieView source={require('../../assets/register.json')} autoPlay loop style={styles.lottie} />
          </MotiView>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.title}>
              {currentStep === 0 ? 'Welcome!' : currentStep === 1 ? 'Your Account' : 'Final Step'}
            </Text>
            <Text style={styles.subtitle}>
              {currentStep === 0 ? 'Choose how you want to use Worknest' : 
               currentStep === 1 ? 'Secure your working future' : 
               'Tell us a bit more about yourself'}
            </Text>
          </Animated.View>

          <View style={styles.progressContainer}>
            {[0, 1, 2].map((i) => (
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

          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
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
                title={currentStep === 2 ? 'Complete Registration' : 'Continue'} 
                loading={isLoading} 
                onPress={handleNext} 
                style={currentStep === 0 ? { flex: 1 } : styles.nextBtn} 
                variant="primary" 
              />
            </View>
          </Animated.View>

          {currentStep === 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginText}> Sign In</Text>
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
  orb1: { width: 300, height: 300, backgroundColor: '#6366F1', top: -100, left: -100 },
  orb2: { width: 250, height: 250, backgroundColor: '#A855F7', bottom: -50, right: -50 },
  scrollContainer: { flexGrow: 1, padding: 24, paddingBottom: 60 },
  lottieContainer: { alignItems: 'center', marginBottom: 0 },
  lottie: { width: 150, height: 150 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginBottom: 20 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressDotActive: { backgroundColor: '#4F46E5' },
  progressDotCurrent: { width: 30 },
  card: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
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
  roleIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center' },
  roleIconBoxActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  roleTextContainer: { flex: 1 },
  roleCardTitle: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  roleCardTitleActive: { color: '#FFF' },
  roleCardDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#94A3B8', marginBottom: 16, textAlign: 'center' },
  inputGroup: { gap: 0 },
  inputStyle: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#FFF' },
  roleFields: { marginTop: 0 },
  row: { flexDirection: 'row' },
  locBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, marginBottom: 20 },
  locBtnText: { color: '#6366F1', fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  backBtn: { flex: 0.4, borderRadius: 16, height: 56 },
  nextBtn: { flex: 1, borderRadius: 16, height: 56 },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#94A3B8', fontSize: 15 },
  loginText: { color: '#6366F1', fontWeight: '700', fontSize: 15 },
});
