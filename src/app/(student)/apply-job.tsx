import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, TextField, Button, Card } from '@components/index';
import { jobAPI, applicationAPI } from '@api/index';
import { Job, JobType } from '@mytypes/index';
import { validateProfileUrl } from '@utils/validation';
import { getErrorMessage } from '@utils/helpers';

export default function ApplyJobScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    coverLetter: '',
    profileUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await jobAPI.getJobById(jobId as string);

      if (response.success && response.data) {
        setJob(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (job?.type === JobType.ONLINE) {
      if (!formData.profileUrl.trim()) {
        newErrors.profileUrl = 'Profile URL is required for online jobs';
      } else if (!validateProfileUrl(formData.profileUrl)) {
        newErrors.profileUrl = 'Please provide a valid LinkedIn, GitHub, or Portfolio URL';
      }
    }

    if (formData.coverLetter.length > 1000) {
      newErrors.coverLetter = 'Cover letter cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = async () => {
    if (!validateForm() || !job) return;

    try {
      setIsSubmitting(true);

      const applicationData: any = {
        coverLetter: formData.coverLetter || undefined,
      };

      if (job.type === JobType.ONLINE) {
        applicationData.profileUrl = formData.profileUrl;
      }

      const response = await applicationAPI.applyForJob(job.id, applicationData);

      if (response.success) {
        Alert.alert(
          'Application Submitted',
          'Your application has been submitted successfully!',
          [
            {
              text: 'View Status',
              onPress: () => {
                router.push('/(student)/my-applications');
              },
            },
            {
              text: 'Browse Jobs',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);
      Alert.alert('Application Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </Screen>
    );
  }

  if (!job) {
    return (
      <Screen>
        <Text style={styles.errorText}>Job not found</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.employer.name}</Text>
        </Card>

        {job.type === JobType.ONLINE && (
          <Card>
            <Text style={styles.sectionTitle}>Profile URL (Required)</Text>
            <Text style={styles.info}>
              Share your professional profile from LinkedIn, GitHub, or Portfolio. We'll evaluate your profile to shortlist candidates.
            </Text>
            <TextField
              label="Profile URL"
              placeholder="https://linkedin.com/in/yourprofile"
              value={formData.profileUrl}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, profileUrl: text }));
                if (errors.profileUrl) {
                  setErrors((prev) => ({ ...prev, profileUrl: undefined }));
                }
              }}
              error={errors.profileUrl}
            />
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Cover Letter (Optional)</Text>
          <Text style={styles.info}>
            Tell the employer why you're a great fit for this job.
          </Text>
          <TextField
            label="Your Message"
            placeholder="Write your cover letter here..."
            value={formData.coverLetter}
            onChangeText={(text) => {
              setFormData((prev) => ({ ...prev, coverLetter: text }));
              if (errors.coverLetter) {
                setErrors((prev) => ({ ...prev, coverLetter: undefined }));
              }
            }}
            error={errors.coverLetter}
            multiline
            numberOfLines={6}
          />
          <Text style={styles.characterCount}>
            {formData.coverLetter.length} / 1000 characters
          </Text>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Submit Application"
            onPress={handleApply}
            loading={isSubmitting}
            fullWidth
            size="large"
          />
        </View>

        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 32,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  company: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  buttonContainer: {
    marginVertical: 16,
  },
  spacing: {
    height: 20,
  },
});
