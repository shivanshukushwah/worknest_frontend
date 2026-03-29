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
import { jobAPI } from '@api/index';
import { Job, JobStatus } from '@mytypes/index';
import { formatDate, formatSalary } from '@utils/formatting';
import { Colors, Typography, Shadows } from '@utils/theme';

export default function MyJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await jobAPI.getEmployerJobs(1, 20);

      if (response.success && response.data) {
        setJobs(response.data);
      }
    } catch (err: any) {
      if (err?.status === 404 || err?.response?.status === 404) {
        setJobs([]);
        return;
      }
      const message = err.response?.data?.message || 'Failed to fetch jobs';
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
      <View style={styles.topButton}>
        <Button
          title="Post New Job"
          onPress={() => router.push('/(employer)/post-job')}
          fullWidth
          size="medium"
        />
      </View>

      <FlatList
        data={jobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item.id}
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
  topButton: {
    marginBottom: 16,
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
