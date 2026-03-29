import React, { useEffect, useState } from 'react';
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
import { applicationAPI } from '@api/index';
import { JobApplication, ApplicationStatus } from '@mytypes/index';
import { formatDate, formatSalary } from '@utils/formatting';

export default function MyApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await applicationAPI.getMyApplications(1, 20);

      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch applications';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const getStatusColor = (status: ApplicationStatus): 'primary' | 'success' | 'warning' | 'danger' => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return 'primary';
      case ApplicationStatus.SHORTLISTED:
        return 'success';
      case ApplicationStatus.HIRED:
        return 'success';
      case ApplicationStatus.REJECTED:
        return 'danger';
      case ApplicationStatus.COMPLETED:
        return 'success';
      default:
        return 'primary';
    }
  };

  const renderApplicationItem = ({ item }: { item: JobApplication }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/(student)/job-details',
          params: { jobId: item.jobId },
        })
      }
    >
      <Card>
        <View style={styles.applicationCard}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.jobTitle}>{item.job.title}</Text>
              <Badge
                label={item.status.toUpperCase()}
                color={getStatusColor(item.status)}
              />
            </View>
            <Text style={styles.company}>{item.job.employer.name}</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Salary</Text>
              <Text style={styles.value}>
                {formatSalary(item.job.salary, item.job.salaryType)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Applied</Text>
              <Text style={styles.value}>{formatDate(item.appliedAt)}</Text>
            </View>
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
          <TouchableOpacity onPress={fetchApplications}>
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
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applications yet</Text>
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
  applicationCard: {
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  company: {
    fontSize: 12,
    color: '#666666',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666666',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
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
