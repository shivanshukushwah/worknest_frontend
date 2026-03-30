import { useState, useEffect } from 'react';
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
import { useCallback } from 'react';
import { Screen, Card, Badge } from '@components/index';
import { jobAPI, userAPI } from '@api/index';
import { JobWithApplicationStatus, ApplicationStatus, StudentProfile } from '@mytypes/index';
import { formatSalary, formatDate, formatCurrency } from '@utils/formatting';
import { Colors, Typography, Shadows } from '@utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithApplicationStatus[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
    }, [])
  );

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [jobsRes, profileRes] = await Promise.all([
        jobAPI.getAllJobs(1, 20),
        userAPI.getStudentProfile()
      ]);

      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
        setPage(1);
        setHasMore(jobsRes.pagination.page < jobsRes.pagination.pages);
      }

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreJobs = async () => {
    if (!hasMore || isLoading) return;

    try {
      const nextPage = page + 1;
      const response = await jobAPI.getAllJobs(nextPage, 20);

      if (response.success && response.data) {
        setJobs((prev) => [...prev, ...response.data]);
        setPage(nextPage);
        setHasMore(nextPage < response.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to fetch more jobs:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const getApplicationStatusColor = (status?: ApplicationStatus) => {
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

  const renderJobItem = ({ item }: { item: JobWithApplicationStatus }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: '/(student)/job-details',
          params: { jobId: item.id },
        })
      }
    >
      <Card 
        style={styles.cardWrapper}
      >
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            {item.applicationStatus && (
              <Badge
                label={item.applicationStatus.toUpperCase()}
                color={getApplicationStatusColor(item.applicationStatus)}
              />
            )}
          </View>

          <Text style={styles.company}>{item.employer.name}</Text>

          <View style={styles.jobDetails}>
            <Text style={styles.salary}>{formatSalary(item.salary, item.salaryType)}</Text>
            <Text style={styles.positions}>
              {item.positionsRequired} position
              {item.positionsRequired > 1 ? 's' : ''}
            </Text>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.jobFooter}>
            <Text style={styles.deadline}>
              Deadline: {formatDate(item.deadline)}
            </Text>
            {item.type && (
              <Badge label={item.type.toUpperCase()} color="primary" />
            )}
          </View>
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

  if (isLoading && !refreshing) {
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
                  <Text style={styles.balanceLabel}>Wallet Balance</Text>
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
                  <Text style={styles.statValue}>{profile?.completedJobsCount || 0}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{profile?.skillScore || 0}</Text>
                  <Text style={styles.statLabel}>Skill Score</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitleHeader}>Available Opportunities</Text>
          </>
        }
        onEndReached={fetchMoreJobs}
        onEndReachedThreshold={0.5}
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
            <Text style={styles.emptyText}>No jobs available</Text>
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
    marginTop: 8,
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
  sectionTitleHeader: {
    fontSize: 18,
    fontWeight: '700' as any,
    color: Colors.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  jobCard: {
    gap: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  jobTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.black,
    flex: 1,
  },
  company: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  salary: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.primary,
  },
  positions: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[500],
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: 8,
  },
  deadline: {
    fontSize: Typography.fontSize.xs,
    color: Colors.gray[400],
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
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.gray[400],
  },
});
