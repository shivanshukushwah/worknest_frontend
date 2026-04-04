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
import { Colors, Shadows } from '@utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
      } else {
        const fallbackId = (response.data as any)?._id;
        if (fallbackId) {
          const retryRes = await jobAPI.getJobById(fallbackId);
          if (retryRes.success && retryRes.data) setJob(retryRes.data);
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
      params: { jobId: job.id || (job as any)._id },
    });
  };

  const getStatusColor = (status?: ApplicationStatus): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case ApplicationStatus.APPLIED: return 'primary';
      case ApplicationStatus.SHORTLISTED: return 'success';
      case ApplicationStatus.HIRED: return 'success';
      case ApplicationStatus.REJECTED: return 'danger';
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
        <View style={styles.loaderContainer}>
          <Text style={styles.errorText}>Job not found</Text>
        </View>
      </Screen>
    );
  }

  const isJobExpired = isExpired(job.deadline);
  const hasApplied = !!applicationStatus;

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
            {applicationStatus && (
              <Badge label={(applicationStatus || '').toUpperCase()} color={getStatusColor(applicationStatus)} />
            )}
          </View>
          
          <Text style={styles.title}>{job.title}</Text>
          
          <View style={styles.companyInfo}>
            <Ionicons name="business" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={styles.companyName}>{job.employer?.name || 'Unknown Employer'}</Text>
            {job.employer && (
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/reviews', params: { userId: job.employer.id || (job.employer as any)._id } })}
                style={styles.reviewBadge}
              >
                <Text style={styles.reviewText}>Reviews</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Salary</Text>
              <Text style={styles.statValue}>{formatSalary(job.salary, job.salaryType)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{job.duration} hrs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Type</Text>
              <Text style={styles.statValue}>{job.type === JobType.ONLINE ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentPadding}>
          <Card style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Job Overview</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoLabel}>Deadline:</Text>
              <Text style={[styles.infoValue, isJobExpired && styles.expired]}>
                {formatDate(job.deadline)} {isJobExpired && '(Expired)'}
              </Text>
            </View>
            {job.location && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
                <Text style={styles.infoLabel}>Location:</Text>
                <Text style={styles.infoValue}>{job.location}</Text>
              </View>
            )}
          </Card>

          <Card style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </Card>

          {hasApplied ? (
            <View style={[styles.statusBanner, { backgroundColor: Colors.success + '15', borderColor: Colors.success }]}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={[styles.statusText, { color: Colors.success }]}>You have already applied!</Text>
            </View>
          ) : isJobExpired ? (
            <View style={[styles.statusBanner, { backgroundColor: Colors.danger + '15', borderColor: Colors.danger }]}>
              <Ionicons name="time-outline" size={24} color={Colors.danger} />
              <Text style={[styles.statusText, { color: Colors.danger }]}>This job has expired.</Text>
            </View>
          ) : (
            <Button
              title="Apply for this Job"
              onPress={handleApply}
              fullWidth
              size="large"
              style={styles.applyButton}
              leftIcon={<Ionicons name="paper-plane-outline" size={20} color={Colors.white} />}
            />
          )}
        </View>
        <View style={styles.spacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 40 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },
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
    marginBottom: 16,
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
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  companyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600' as any,
  },
  reviewBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reviewText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700' as any,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    padding: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '700' as any, color: Colors.white },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  contentPadding: { paddingHorizontal: 16, marginTop: 16, gap: 12 },
  detailsCard: { borderRadius: 24, borderWidth: 1, borderColor: Colors.gray[100], ...Shadows.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700' as any, color: Colors.black, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  infoLabel: { fontSize: 13, color: Colors.textLight, fontWeight: '500' as any, width: 70 },
  infoValue: { fontSize: 13, fontWeight: '700' as any, color: Colors.text, flex: 1 },
  descriptionCard: { borderRadius: 24, borderWidth: 1, borderColor: Colors.gray[100], ...Shadows.sm },
  descriptionText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
    marginTop: 8,
  },
  statusText: { fontSize: 15, fontWeight: '700' as any },
  applyButton: { marginTop: 8, borderRadius: 20 },
  expired: { color: Colors.danger },
  spacing: { height: 40 },
  errorText: { fontSize: 16, color: Colors.danger, textAlign: 'center', marginTop: 100 },
});
