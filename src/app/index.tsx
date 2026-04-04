import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Badge } from '@components/index';
import { jobAPI } from '@api/index';
import { JobWithApplicationStatus, ApplicationStatus } from '@mytypes/index';
import { formatSalary, formatDate } from '@utils/formatting';
import { useAuth } from '@context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobWithApplicationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await jobAPI.getAllJobs(1, 20);

      if (response.success && response.data) {
        setJobs(response.data);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch jobs';
      setError(message);
    } finally {
      setIsLoading(false);
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
      onPress={() =>
        router.push({
          pathname: '/(student)/job-details',
          params: { jobId: item.id },
        })
      }
    >
      <Card>
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            {(item.applicationStatus || (item as any).status) && (
              <Badge
                label={(item.applicationStatus || (item as any).status || '').toUpperCase()}
                color={getApplicationStatusColor(item.applicationStatus || (item as any).status)}
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
            {(item.type || item.jobType) && (
              <Badge label={(item.type || item.jobType || '').toUpperCase()} color="primary" />
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

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
  listContent: {
    paddingVertical: 8,
  },
  jobCard: {
    gap: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  company: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  positions: {
    fontSize: 12,
    color: '#999999',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deadline: {
    fontSize: 12,
    color: '#999999',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  retryButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
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
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});
