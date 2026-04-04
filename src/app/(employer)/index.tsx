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
          params: { jobId: item.id || (item as any)._id },
        })
      }
    >
      <Card style={styles.cardWrapper}>
        <View style={styles.jobCard}>
          <View style={styles.header}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Badge 
              label={(item.status || 'open').toUpperCase()} 
              color={getStatusColor(item.status || JobStatus.OPEN)} 
            />
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
            params: { jobId: item.id || (item as any)._id },
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
        keyExtractor={(item) => item.id || (item as any)._id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <LinearGradient
              colors={[Colors.primaryDark, Colors.secondaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerGradient}
            >
              <View style={styles.topHeaderRow}>
                <View>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.businessHeaderName}>{profile?.businessName || 'Business'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.walletHeaderBadge}
                  onPress={() => router.push('/wallet')}
                >
                  <Ionicons name="wallet" size={16} color={Colors.white} />
                  <Text style={styles.walletBadgeText}>{formatCurrency(profile?.walletBalance || 0)}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{profile?.activeJobsCount || 0}</Text>
                  <Text style={styles.quickStatLabel}>Active</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{jobs.length}</Text>
                  <Text style={styles.quickStatLabel}>Total</Text>
                </View>
                <TouchableOpacity 
                  style={styles.postJobCircle}
                  onPress={() => router.push('/(employer)/post-job')}
                >
                  <Ionicons name="add" size={24} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleHeader}>My Job Listings</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
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
            <Ionicons name="briefcase-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyText}>No jobs posted yet</Text>
            <Button
              title="Post Your First Job"
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
  headerSection: {
    marginBottom: 16,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: -40,
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500' as any,
  },
  businessHeaderName: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800' as any,
  },
  walletHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  walletBadgeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as any,
  },
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as any,
  },
  quickStatLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  quickStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  postJobCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitleHeader: {
    fontSize: 18,
    fontWeight: '700' as any,
    color: Colors.black,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    ...Shadows.sm,
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
    fontSize: 16,
    fontWeight: '700' as any,
    color: Colors.black,
    flex: 1,
  },
  details: {
    gap: 8,
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
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
    fontSize: 10,
    color: Colors.textLight,
    fontWeight: '600' as any,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 13,
    fontWeight: '700' as any,
    color: Colors.text,
  },
  actionButton: {
    marginTop: 4,
    borderRadius: 12,
    height: 44,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as any,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[400],
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    width: 200,
  },
});
