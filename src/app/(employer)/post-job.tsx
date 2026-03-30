import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, TextField, Button, Card } from '@components/index';
import { useAuth } from '@context/AuthContext';
import { jobAPI, userAPI } from '@api/index';
import { JobType, EmployerProfile } from '@mytypes/index';
import { getErrorMessage } from '@utils/helpers';
import { Colors, Typography, Shadows } from '@utils/theme';

export default function PostJobScreen() {
  const router = useRouter();
  const { registrationData } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    jobType: JobType.OFFLINE as JobType,
    budget: '',
    duration: '',
    applicationDeadlineHours: '',
    category: '',
    location: {
      city: '',
      state: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);

  useEffect(() => {
    userAPI.getEmployerProfile().then(res => {
      if (res.success && res.data) setProfile(res.data);
    }).catch(err => console.error('PostJob: Failed to fetch profile:', err));
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(Number(formData.budget))) {
      newErrors.budget = 'Budget must be a number';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.applicationDeadlineHours) {
      newErrors.applicationDeadlineHours = 'Application deadline is required';
    } else if (isNaN(Number(formData.applicationDeadlineHours)) || Number(formData.applicationDeadlineHours) < 1) {
      newErrors.applicationDeadlineHours = 'Must be at least 1 hour';
    }

    if (formData.jobType === JobType.OFFLINE && !formData.location.city.trim()) {
      newErrors['location.city'] = 'City is required for offline jobs';
    }

    if (!formData.location.state.trim()) {
      newErrors['location.state'] = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePostJob = async () => {
    if (!validateForm()) return;

    const registrationBusinessLocation = (registrationData as any)?.businessLocation || {};
    const registrationBusinessName = (registrationData as any)?.businessName?.trim() || '';
    const registrationBusinessType = (registrationData as any)?.businessType?.trim() || '';

    const hasBusinessLocation = registrationBusinessLocation && 
      (typeof registrationBusinessLocation === 'object' ? 
        (registrationBusinessLocation.city || registrationBusinessLocation.state) : 
        registrationBusinessLocation.trim());
    
    if (!hasBusinessLocation || !registrationBusinessName || !registrationBusinessType) {
      Alert.alert(
        'Registration Data Missing',
        'Some required information from your registration is missing. Please update your profile.',
        [
          { text: 'Update Profile', onPress: () => router.push('/(employer)/profile') },
        ]
      );
      return;
    }

    if (profile && profile.walletBalance < Number(formData.budget)) {
      Alert.alert(
        'Insufficient Balance',
        `Your current balance is ₹${profile.walletBalance}, but the job budget is ₹${formData.budget}. Please add cash to your wallet.`,
        [
          { text: 'Add Cash', onPress: () => router.push('/wallet') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        jobType: formData.jobType,
        budget: Number(formData.budget),
        duration: formData.duration.trim(),
        category: formData.category.trim(),
        applicationDeadlineHours: Number(formData.applicationDeadlineHours),
        location: {
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
        },
      };

      const response = await jobAPI.createJob(jobData as any);

      if (response.success) {
        Alert.alert(
          'Job Posted Successfully',
          'Your job has been posted and is now visible to workers',
          [
            {
              text: 'View Job',
              onPress: () => {
                const id = response.data?.id || (response.data as any)?._id;
                console.log('PostJob: Navigating to details with id =', id);
                router.push({
                  pathname: '/(employer)/job-details',
                  params: { jobId: id },
                });
              },
            },
            {
              text: 'Back to Jobs',
              onPress: () => router.replace('/(employer)'),
            },
          ]
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);
      Alert.alert('Job Posting Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Screen>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <TextField
              label="Job Title"
              placeholder="e.g., Full Stack Developer"
              value={formData.title}
              onChangeText={(text) => handleFieldChange('title', text)}
              error={errors.title}
            />

            <TextField
              label="Description"
              placeholder="Describe the job responsibilities and requirements..."
              value={formData.description}
              onChangeText={(text) => handleFieldChange('description', text)}
              error={errors.description}
              multiline
              numberOfLines={6}
            />

            <TextField
              label="Category"
              placeholder="e.g., home_cleaning, delivery, tutoring"
              value={formData.category}
              onChangeText={(text) => handleFieldChange('category', text)}
              error={errors.category}
            />
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Job Type & Location</Text>

            <View style={styles.typeSelector}>
              <Text style={styles.fieldLabel}>Job Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.typeButton,
                    formData.jobType === JobType.OFFLINE && styles.typeButtonActive,
                  ]}
                  onPress={() => handleFieldChange('jobType', JobType.OFFLINE)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.jobType === JobType.OFFLINE && styles.typeButtonTextActive,
                    ]}
                  >
                    Offline
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.typeButton,
                    formData.jobType === JobType.ONLINE && styles.typeButtonActive,
                  ]}
                  onPress={() => handleFieldChange('jobType', JobType.ONLINE)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.jobType === JobType.ONLINE && styles.typeButtonTextActive,
                    ]}
                  >
                    Online
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.jobType === JobType.OFFLINE && (
              <View style={styles.row}>
                <View style={styles.flex1}>
                  <TextField
                    label="City"
                    placeholder="Enter city"
                    value={formData.location.city}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, location: { ...prev.location, city: text } }))}
                    error={errors['location.city']}
                  />
                </View>
                <View style={styles.flex1}>
                  <TextField
                    label="State"
                    placeholder="Enter state"
                    value={formData.location.state}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, location: { ...prev.location, state: text } }))}
                    error={errors['location.state']}
                  />
                </View>
              </View>
            )}

            {formData.jobType === JobType.ONLINE && (
              <TextField
                label="Region/State (Optional)"
                placeholder="e.g., California or Global"
                value={formData.location.state}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, location: { ...prev.location, state: text } }))}
                error={errors['location.state']}
              />
            )}
          </Card>

          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Budget & Logistics</Text>

            <TextField
              label="Total Budget (₹)"
              placeholder="Enter budget amount"
              value={formData.budget}
              onChangeText={(text) => handleFieldChange('budget', text)}
              error={errors.budget}
              keyboardType="decimal-pad"
            />

            <TextField
              label="Duration"
              placeholder="e.g., 1 day, 1 week, 2 hours"
              value={formData.duration}
              onChangeText={(text) => handleFieldChange('duration', text)}
              error={errors.duration}
            />

            <TextField
              label="Application Deadline (Hours)"
              placeholder="e.g., 3, 24"
              value={formData.applicationDeadlineHours}
              onChangeText={(text) => handleFieldChange('applicationDeadlineHours', text)}
              error={errors.applicationDeadlineHours}
              keyboardType="number-pad"
            />
          </Card>

          <View style={styles.buttonContainer}>
            <Button
              title="Post Job Now"
              onPress={handlePostJob}
              loading={isSubmitting}
              fullWidth
              size="large"
            />
          </View>

          <View style={styles.spacing} />
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800' as any,
    color: Colors.primaryDark,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700' as any,
    marginBottom: 12,
    color: Colors.text,
  },
  typeSelector: {
    marginVertical: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  typeButtonActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
    ...Shadows.md,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '700' as any,
    color: Colors.textLight,
  },
  typeButtonTextActive: {
    color: Colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  buttonContainer: {
    marginVertical: 24,
  },
  spacing: {
    height: 60,
  },
});
