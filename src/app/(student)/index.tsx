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
      } else {
        const fallbackId = (jobsRes.data as any)?._id;
        if (fallbackId) {
          console.log('JobsScreen: Found fallback _id', fallbackId);
          const retryRes = await jobAPI.getJobById(fallbackId);
          if (retryRes.success && retryRes.data) setJobs([retryRes.data]);
        } else {
          console.warn('JobsScreen: API success was true but data was missing and no fallback _id found');
        }
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
          params: { jobId: item.id || (item as any)._id },
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

          <Text style={styles.company}>{item.employer?.name || 'Unknown Employer'}</Text>

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
                  <Text style={styles.welcomeText}>Hello,</Text>
                  <Text style={styles.personHeaderName}>{profile?.name || 'Student'}</Text>
                </View>
                <View style={styles.headerBadges}>
                  <View style={styles.skillBadge}>
                    <Ionicons name="star" size={14} color={Colors.accent} />
                    <Text style={styles.skillBadgeText}>{profile?.skillScore || 0}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.walletHeaderBadge}
                    onPress={() => router.push('/wallet')}
                  >
                    <Ionicons name="wallet" size={14} color={Colors.white} />
                    <Text style={styles.walletBadgeText}>{formatCurrency(profile?.walletBalance || 0)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.quickStatsRow}>
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{profile?.completedJobsCount || 0}</Text>
                  <Text style={styles.quickStatLabel}>Completed</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStatItem}>
                  <Text style={styles.quickStatValue}>{jobs.length}</Text>
                  <Text style={styles.quickStatLabel}>Available</Text>
                </View>
              </View>
            </LinearGradient>
            
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitleHeader}>Available Opportunities</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Ionicons name="refresh" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
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
            <Ionicons name="search-outline" size={64} color={Colors.gray[300]} />
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
  personHeaderName: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '800' as any,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 4,
  },
  skillBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as any,
  },
  walletHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 4,
  },
  walletBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as any,
  },
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700' as any,
    color: Colors.black,
    flex: 1,
  },
  company: {
    fontSize: 13,
    color: Colors.textLight,
    fontWeight: '500' as any,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    padding: 12,
    borderRadius: 12,
  },
  salary: {
    fontSize: 16,
    fontWeight: '800' as any,
    color: Colors.primary,
  },
  positions: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: '600' as any,
  },
  description: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  deadline: {
    fontSize: 11,
    color: Colors.gray[400],
    fontWeight: '500' as any,
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
    textAlign: 'center',
  },
  retryButton: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as any,
    marginTop: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray[400],
    marginTop: 16,
  },
});
