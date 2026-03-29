import { useState, useEffect, useRef } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  /* ===================== ANIMATIONS ===================== */

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

  /* ===================== STATE ===================== */

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.STUDENT,

    // Student
    age: '',
    city: '',
    state: '',
    country: '',
    skills: '',
    education: '',

    // Worker
    experience: '',
    location: '',

    // Employer
    businessName: '',
    businessType: '',
    businessLocation: '',
    businessCity: '',
    businessState: '',
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // role dropdown modal
  const [showRolePicker, setShowRolePicker] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  /* ===================== VALIDATION ===================== */

  const validateForm = () => {
    const e: any = {};

    // Common validation for all roles
    if (!formData.name?.trim()) e.name = 'Name is required';
    if (!validateEmail(formData.email)) e.email = 'Invalid email address';
    if (!validatePhone(formData.phone)) e.phone = 'Invalid phone number';
    if (!validatePassword(formData.password).valid) e.password = 'Weak password';
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    // Student: age, location (city/state/country), skills, education
    if (formData.role === UserRole.STUDENT) {
      if (!formData.age || formData.age <= 0) e.age = 'Age is required';
      if (!formData.city?.trim()) e.city = 'City required';
      if (!formData.state?.trim()) e.state = 'State required';
      if (!formData.country?.trim()) e.country = 'Country required';
      if (!formData.skills?.trim()) e.skills = 'Skills required';
      if (!formData.education?.trim()) e.education = 'Education required';
    }

    // Worker: age, location (city/state/country), skills, experience
    if (formData.role === UserRole.WORKER) {
      if (!formData.age || formData.age <= 0) e.age = 'Age is required';
      if (!formData.city?.trim()) e.city = 'City required';
      if (!formData.state?.trim()) e.state = 'State required';
      if (!formData.country?.trim()) e.country = 'Country required';
      if (!formData.skills?.trim()) e.skills = 'Skills required';
      if (!formData.experience?.trim()) e.experience = 'Experience required';
    }

    // Employer: businessName, businessType, businessCity, businessState
    if (formData.role === UserRole.EMPLOYER) {
      if (!formData.businessName?.trim()) e.businessName = 'Business name required';
      if (!formData.businessType?.trim()) e.businessType = 'Business type required';
      if (!formData.businessCity?.trim()) e.businessCity = 'Business city required';
      if (!formData.businessState?.trim()) e.businessState = 'Business state required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ===================== REGISTER ===================== */

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      };

      // STUDENT → include age, location, skills, education
      if (formData.role === UserRole.STUDENT) {
        payload.age = parseInt(formData.age, 10);
        payload.location = {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        };
        payload.skills = formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        payload.education = formData.education;
      }

      // WORKER → include age, location, skills, experience
      if (formData.role === UserRole.WORKER) {
        payload.age = parseInt(formData.age, 10);
        payload.location = {
          city: formData.city,
          state: formData.state,
          country: formData.country,
        };
        payload.skills = formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s);
        payload.experience = formData.experience;
      }

      // EMPLOYER → include businessName, businessType, businessLocation
      if (formData.role === UserRole.EMPLOYER) {
        console.log('Employer registration - businessCity:', formData.businessCity, 'businessState:', formData.businessState);
        payload.businessName = formData.businessName;
        payload.businessType = formData.businessType;
        payload.businessLocation = {
          city: formData.businessCity.trim(),
          state: formData.businessState.trim(),
        };
        console.log('Final businessLocation object:', payload.businessLocation);
      }

      console.log('REGISTER PAYLOAD 👉', JSON.stringify(payload, null, 2));

      await register(payload);
      // Navigation will happen automatically through AuthContext
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Don't show error for network errors since we simulate success
      if (!err.isNetworkError) {
        Alert.alert('Registration Failed', getErrorMessage(err));
      }
    }
  };

  /* ===================== LOCATION ===================== */

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get current location');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const addr = await Location.reverseGeocodeAsync(loc.coords);

      if (formData.role === UserRole.EMPLOYER) {
        // For employer, fill businessCity and businessState
        handleFieldChange('businessCity', addr[0]?.city || '');
        handleFieldChange('businessState', addr[0]?.region || '');
      } else {
        // For student/worker, fill city, state, country
        handleFieldChange('city', addr[0]?.city || '');
        handleFieldChange('state', addr[0]?.region || '');
        handleFieldChange('country', addr[0]?.country || '');
      }

      Alert.alert('Success', 'Location updated from current position');
    } catch (err: any) {
      console.error('Location error', err);
      Alert.alert('Location error', err.message || 'Unable to get location');
    }
  };

  /* ===================== UI ===================== */

  return (
    <LinearGradient colors={['#4facfe', '#00f2fe']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <LottieView
            source={require('../../assets/register.json')}
            autoPlay
            loop
            style={{ width: 260, height: 260, alignSelf: 'center' }}
          />

          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Join Worknest</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TextField label="Full Name" value={formData.name}
              onChangeText={(t) => handleFieldChange('name', t)} error={errors.name} />

            <TextField label="Email" keyboardType="email-address" value={formData.email}
              onChangeText={(t) => handleFieldChange('email', t)} error={errors.email} />

            <TextField label="Phone" keyboardType="phone-pad" value={formData.phone}
              onChangeText={(t) => handleFieldChange('phone', t)} error={errors.phone} />

            {/* PASSWORD */}
            <TextField
              label="Password"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(t) => handleFieldChange('password', t)}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                  />
                </TouchableOpacity>
              }
            />

            {/* CONFIRM PASSWORD */}
            <TextField
              label="Confirm Password"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(t) => handleFieldChange('confirmPassword', t)}
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                  />
                </TouchableOpacity>
              }
            />

            {/* ROLE DROPDOWN */}
            <View>
              <Text style={styles.roleLabel}>Select Role</Text>
              <TouchableOpacity
                style={styles.roleSelect}
                onPress={() => setShowRolePicker(true)}
              >
                <Text style={styles.roleSelectText}>
                  {formData.role
                    ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
                    : 'Select Role'}
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
                    {[UserRole.WORKER, UserRole.STUDENT, UserRole.EMPLOYER].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={styles.modalItem}
                        onPress={() => {
                          handleFieldChange('role', r);
                          setShowRolePicker(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>

            {/* STUDENT */}
            {formData.role === UserRole.STUDENT && (
              <>
                <TextField 
                  label="Age" 
                  keyboardType="number-pad"
                  value={formData.age}
                  onChangeText={(t) => handleFieldChange('age', t)} 
                  error={errors.age} 
                />
                <TextField 
                  label="City" 
                  value={formData.city}
                  onChangeText={(t) => handleFieldChange('city', t)} 
                  error={errors.city} 
                />
                <TextField 
                  label="State" 
                  value={formData.state}
                  onChangeText={(t) => handleFieldChange('state', t)} 
                  error={errors.state} 
                />
                <TextField 
                  label="Country" 
                  value={formData.country}
                  onChangeText={(t) => handleFieldChange('country', t)} 
                  error={errors.country} 
                />
                <TextField 
                  label="Skills" 
                  placeholder="e.g. python, javascript, design" 
                  value={formData.skills}
                  onChangeText={(t) => handleFieldChange('skills', t)} 
                  error={errors.skills} 
                />
                <TextField 
                  label="Education" 
                  placeholder="e.g. B.Tech Computer Science" 
                  value={formData.education}
                  onChangeText={(t) => handleFieldChange('education', t)} 
                  error={errors.education} 
                />
              </>
            )}

            {/* WORKER */}
            {formData.role === UserRole.WORKER && (
              <>
                <TextField 
                  label="Age" 
                  keyboardType="number-pad"
                  value={formData.age}
                  onChangeText={(t) => handleFieldChange('age', t)} 
                  error={errors.age} 
                />
                <TextField 
                  label="City" 
                  value={formData.city}
                  onChangeText={(t) => handleFieldChange('city', t)} 
                  error={errors.city} 
                />
                <TextField 
                  label="State" 
                  value={formData.state}
                  onChangeText={(t) => handleFieldChange('state', t)} 
                  error={errors.state} 
                />
                <TextField 
                  label="Country" 
                  value={formData.country}
                  onChangeText={(t) => handleFieldChange('country', t)} 
                  error={errors.country} 
                />
                <TextField 
                  label="Skills" 
                  placeholder="e.g. plumbing, carpentry, welding" 
                  value={formData.skills}
                  onChangeText={(t) => handleFieldChange('skills', t)} 
                  error={errors.skills} 
                />
                <TextField 
                  label="Experience" 
                  placeholder="e.g. 5 years" 
                  value={formData.experience}
                  onChangeText={(t) => handleFieldChange('experience', t)} 
                  error={errors.experience} 
                />
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                  <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
                </TouchableOpacity>
              </>
            )}

            {/* EMPLOYER */}
            {formData.role === UserRole.EMPLOYER && (
              <>
                <TextField label="Business Name" value={formData.businessName}
                  onChangeText={(t) => handleFieldChange('businessName', t)}
                  error={errors.businessName} />

                <TextField label="Business Type"
                  placeholder="service / IT / manufacturing"
                  value={formData.businessType}
                  onChangeText={(t) => handleFieldChange('businessType', t)}
                  error={errors.businessType} />

                <TextField 
                  label="Business City"
                  placeholder="e.g., Bikaner"
                  value={formData.businessCity}
                  onChangeText={(t: string) => handleFieldChange('businessCity', t)}
                  error={errors.businessCity} />

                <TextField 
                  label="Business State"
                  placeholder="e.g., Rajasthan"
                  value={formData.businessState}
                  onChangeText={(t: string) => handleFieldChange('businessState', t)}
                  error={errors.businessState} />
                
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                  <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
                </TouchableOpacity>
              </>
            )}

            <Button title="Create Account" loading={isLoading} onPress={handleRegister} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 16, color: '#334155', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 6 },
  // replaced button group with dropdown
  roleLabel: { marginBottom: 4, fontWeight: '600', color: '#334155' },
  roleSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  roleSelectText: { color: '#111827' },
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
  locationButton: {
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    alignItems: 'center',
  },
  locationButtonText: { color: '#fff', fontWeight: '600' },
});
