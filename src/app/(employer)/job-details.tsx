import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Card, Badge, Button } from '@components/index';
import { jobAPI } from '@api/index';
import { Job, JobType, JobStatus } from '@mytypes/index';
import { formatSalary, formatDate, isExpired } from '@utils/formatting';
import { Colors, Shadows } from '@utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('JobDetailsScreen: Received jobId =', jobId);
    if (jobId) {
      fetchJobDetails();
    } else {
      console.warn('JobDetailsScreen: No jobId provided in params');
      setIsLoading(false);
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setIsLoading(true);
      console.log('JobDetailsScreen: Fetching job details for', jobId);
      const response = await jobAPI.getJobById(jobId as string);
      console.log('JobDetailsScreen: API Response =', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        setJob(response.data);
      } else {
        const fallbackId = (response.data as any)?._id;
        if (fallbackId) {
          console.log('JobDetailsScreen: Found fallback _id', fallbackId);
          const retryRes = await jobAPI.getJobById(fallbackId);
          if (retryRes.success && retryRes.data) setJob(retryRes.data);
        } else {
          console.warn('JobDetailsScreen: API success was true but data was missing and no fallback _id found');
        }
      }
    } catch (error: any) {
      console.error('JobDetailsScreen: Fetch Error =', error?.message || error);
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseJob = async () => {
    if (!job) return;

    Alert.alert(
      'Close Job',
      'Are you sure you want to close this job? Students will no longer be able to apply.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Close Job',
          onPress: async () => {
            try {
              await jobAPI.closeJob(job.id);
              Alert.alert('Success', 'Job closed successfully');
              fetchJobDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to close job');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: JobStatus): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case JobStatus.OPEN: return 'success';
      case JobStatus.CLOSED: return 'danger';
      case JobStatus.IN_PROGRESS: return 'primary';
      case JobStatus.COMPLETED: return 'success';
      default: return 'primary';
    }
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
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
    <Screen scrollable={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.primaryDark, Colors.secondaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Badge label={(job.status || 'open').toUpperCase()} color={getStatusColor(job.status || JobStatus.OPEN)} />
          </View>
          <Text style={styles.title}>{job.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>{formatSalary(job.salary, job.salaryType)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Applicants</Text>
              <Text style={styles.statValue}>{job.applicationsCount || 0}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Positions</Text>
              <Text style={styles.statValue}>{job.positionsRequired}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentPadding}>
          <Card style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Essential Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Ionicons name="flash-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>{job.type === JobType.ONLINE ? 'Online' : 'Offline'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Duration</Text>
                <Text style={styles.infoValue}>{job.duration} hrs</Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.infoLabel}>Deadline</Text>
                <Text style={[styles.infoValue, isExpired(job.deadline) && styles.expired]}>
                  {formatDate(job.deadline)}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </Card>

          <View style={styles.actions}>
            <Button
              title="Manage Applications"
              onPress={() =>
                router.push({
                  pathname: '/(employer)/applicants',
                  params: { jobId: job.id || (job as any)._id },
                })
              }
              fullWidth
              size="large"
              leftIcon={<Ionicons name="people-outline" size={20} color={Colors.white} />}
            />

            {job.status === JobStatus.OPEN && (
              <Button
                title="Close Posting"
                variant="outline"
                onPress={handleCloseJob}
                fullWidth
                style={styles.closeButton}
                leftIcon={<Ionicons name="close-circle-outline" size={20} color={Colors.danger} />}
              />
            )}
          </View>
        </View>
        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: -40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800' as any,
    color: Colors.white,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700' as any,
    color: Colors.white,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  contentPadding: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  detailsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: Colors.black,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '600' as any,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700' as any,
    color: Colors.text,
  },
  descriptionCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    ...Shadows.sm,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  closeButton: {
    borderColor: Colors.danger,
    borderRadius: 16,
  },
  expired: {
    color: Colors.danger,
  },
  spacing: {
    height: 40,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 100,
  },
});
