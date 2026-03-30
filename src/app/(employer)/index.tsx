import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Screen, Card, Badge, Button } from '@components/index';
import { jobAPI, userAPI } from '@api/index';
import { Job, JobStatus, EmployerProfile } from '@mytypes/index';
import { formatDate, formatSalary, formatCurrency } from '@utils/formatting';
import { Colors, Typography, Shadows } from '@utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MyJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both jobs and profile
      const [jobsRes, profileRes] = await Promise.all([
        jobAPI.getEmployerJobs(1, 20),
        userAPI.getEmployerProfile()
      ]);

      console.log('Employer Jobs Response:', JSON.stringify(jobsRes, null, 2));
      console.log('Employer Profile Response:', JSON.stringify(profileRes, null, 2));

      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
      }

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        setJobs([]);
        return;
      }
      const message = err.response?.data?.message || 'Failed to fetch data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const getStatusColor = (status: JobStatus): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case JobStatus.OPEN:
        return 'success';
      case JobStatus.CLOSED:
        return 'danger';
      case JobStatus.IN_PROGRESS:
        return 'primary';
      case JobStatus.COMPLETED:
        return 'success';
      default:
        return 'primary';
    }
  };

  const renderJobItem = ({ item }: { item: Job }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/(employer)/job-details',
          params: { jobId: item.id },
        })
      }
    >
      <Card style={styles.cardWrapper}>
        <View style={styles.jobCard}>
          <View style={styles.header}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Badge label={item.status.toUpperCase()} color={getStatusColor(item.status)} />
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Text style={styles.label}>Salary</Text>
                <Text style={styles.value}>{formatSalary(item.salary, item.salaryType)}</Text>
              </View>
              <View style={[styles.detailLabelGroup, { alignItems: 'flex-end' }]}>
                <Text style={styles.label}>Applications</Text>
                <Text style={styles.value}>{item.applicationsCount || 0}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelGroup}>
                <Text style={styles.label}>Positions</Text>
                <Text style={styles.value}>{item.positionsRequired}</Text>
              </View>
              <View style={[styles.detailLabelGroup, { alignItems: 'flex-end' }]}>
                <Text style={styles.label}>Posted</Text>
                <Text style={styles.value}>{formatDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>

          <Button
            title="View Applicants"
            variant="accent"
            size="small"
            onPress={() =>
              router.push({
                pathname: '/(employer)/applicants',
                params: { jobId: item.id },
              })
            }
            style={styles.actionButton}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (error && !isLoading) {
    return (
      <Screen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchJobs}>
            <Text style={styles.retryButton}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.balanceCard}
            >
              <View style={styles.balanceHeader}>
                <View>
                  <Text style={styles.balanceLabel}>Account Balance</Text>
                  <Text style={styles.balanceAmount}>{formatCurrency(profile?.walletBalance || 0)}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.walletIcon}
                  onPress={() => router.push('/wallet')}
                >
                  <Ionicons name="wallet-outline" size={28} color={Colors.white} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile?.activeJobsCount || 0}</Text>
                  <Text style={styles.statLabel}>Active Jobs</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{jobs.length}</Text>
                  <Text style={styles.statLabel}>Total Posted</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.topButton}>
              <Button
                title="Post New Job"
                onPress={() => router.push('/(employer)/post-job')}
                fullWidth
                size="large"
                leftIcon={<Ionicons name="add-circle-outline" size={20} color={Colors.white} />}
              />
            </View>

            {jobs.length > 0 && <Text style={styles.sectionTitleHeader}>My Active Listings</Text>}
          </>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs posted yet</Text>
            <Button
              title="Post Your First Job"
              variant="primary"
              onPress={() => router.push('/(employer)/post-job')}
              style={styles.emptyButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    ...Shadows.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600' as any,
    marginBottom: 4,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '800' as any,
  },
  walletIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as any,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  topButton: {
    marginBottom: 24,
  },
  sectionTitleHeader: {
    fontSize: 18,
    fontWeight: '700' as any,
    color: Colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  jobCard: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  jobTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.black,
    flex: 1,
  },
  details: {
    gap: 12,
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelGroup: {
    gap: 2,
  },
  label: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    fontWeight: Typography.fontWeight.medium as any,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold as any,
    color: Colors.text,
  },
  actionButton: {
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold as any,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.gray[400],
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 4,
  },
});
