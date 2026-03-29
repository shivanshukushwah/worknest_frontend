import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Card, Button, Badge } from '@components/index';
import { jobAPI } from '@api/index';
import { Job, JobType, ApplicationStatus } from '@mytypes/index';
import { formatSalary, formatDate, isExpired } from '@utils/formatting';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

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
        if (response.data.applicationStatus) {
          setApplicationStatus(response.data.applicationStatus);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!job) return;

    router.push({
      pathname: '/(student)/apply-job',
      params: { jobId: job.id },
    });
  };

  const getStatusColor = (status?: ApplicationStatus): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return 'primary';
      case ApplicationStatus.SHORTLISTED:
        return 'success';
      case ApplicationStatus.HIRED:
        return 'success';
      case ApplicationStatus.REJECTED:
        return 'danger';
      default:
        return 'primary';
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

  const isJobExpired = isExpired(job.deadline);
  const hasApplied = !!applicationStatus;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{job.title}</Text>
              {applicationStatus && (
                <Badge label={applicationStatus} color={getStatusColor(applicationStatus)} />
              )}
            </View>
            <View style={styles.companyRow}>
              <Text style={styles.company}>{job.employer.name}</Text>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/reviews', params: { userId: job.employer.id } })}
              >
                <Text style={styles.viewReviewsText}>View Reviews</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.label}>Salary</Text>
              <Text style={styles.value}>{formatSalary(job.salary, job.salaryType)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Positions</Text>
              <Text style={styles.value}>{job.positionsRequired}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Duration</Text>
              <Text style={styles.value}>{job.duration} hours</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Job Type</Text>
              <Badge
                label={job.type === JobType.ONLINE ? 'Online' : 'Offline'}
                color="primary"
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Deadline</Text>
              <Text style={[styles.value, isJobExpired && styles.expired]}>
                {formatDate(job.deadline)}
                {isJobExpired && ' (Expired)'}
              </Text>
            </View>

            {job.location && (
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{job.location}</Text>
              </View>
            )}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </Card>

        {job.skills && job.skills.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsList}>
              {job.skills.map((skill, index) => (
                <Badge key={index} label={skill} color="primary" />
              ))}
            </View>
          </Card>
        )}

        {job.type === JobType.ONLINE && (
          <Card>
            <Text style={styles.sectionTitle}>How to Apply</Text>
            <Text style={styles.infoText}>
              This is an online job. You'll need to provide your LinkedIn, GitHub, or Portfolio URL during application.
            </Text>
            <Text style={styles.infoText}>
              Your profile will be automatically evaluated by our system. Top applicants will be shortlisted for further consideration.
            </Text>
          </Card>
        )}

        {!isJobExpired && !hasApplied && (
          <Button
            title="Apply Now"
            onPress={handleApply}
            fullWidth
            size="large"
            style={styles.applyButton}
          />
        )}

        {hasApplied && (
          <Card style={styles.appliedCard}>
            <Text style={styles.appliedText}>
              ✓ You have already applied for this job
            </Text>
          </Card>
        )}

        {isJobExpired && (
          <Card style={styles.expiredCard}>
            <Text style={styles.expiredText}>
              This job posting has expired
            </Text>
          </Card>
        )}

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
  header: {
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  company: {
    fontSize: 14,
    color: '#666666',
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  viewReviewsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    gap: 12,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  expired: {
    color: '#FF3B30',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 8,
  },
  applyButton: {
    marginVertical: 16,
  },
  appliedCard: {
    backgroundColor: '#D1F4E0',
    marginVertical: 16,
  },
  appliedText: {
    fontSize: 14,
    color: '#186A3B',
    fontWeight: '600',
  },
  expiredCard: {
    backgroundColor: '#FADBD8',
    marginVertical: 16,
  },
  expiredText: {
    fontSize: 14,
    color: '#78281F',
    fontWeight: '600',
  },
  spacing: {
    height: 20,
  },
});
