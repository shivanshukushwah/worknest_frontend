import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Card, Badge, Button, Avatar } from '@components/index';
import { jobAPI, applicationAPI } from '@api/index';
import { JobApplication, ApplicationStatus } from '@mytypes/index';

import { Colors, Typography, Shadows } from '@utils/theme';

export default function ApplicantsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'shortlisted'>('all');

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  }, [jobId, activeTab]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = activeTab === 'all' 
        ? await jobAPI.getJobApplications(jobId as string, 1, 50)
        : await jobAPI.getShortlistedApplications(jobId as string, 1);

      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch applicants';
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

  const handleHire = async (applicationId: string) => {
    try {
      const response = await applicationAPI.hireApplicant(jobId as string, applicationId);
      if (response.success) {
        Alert.alert('Success', 'Applicant hired successfully');
        fetchApplications();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to hire applicant');
    }
  };

  const handleReject = async (applicationId: string) => {
    Alert.alert(
      'Reject Application',
      'Are you sure you want to reject this application?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Reject',
          onPress: async () => {
            try {
              await applicationAPI.rejectApplication(jobId as string, applicationId);
              Alert.alert('Success', 'Application rejected');
              fetchApplications();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject application');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: ApplicationStatus): 'primary' | 'success' | 'danger' => {
    switch (status) {
      case ApplicationStatus.SHORTLISTED:
        return 'success';
      case ApplicationStatus.REJECTED:
        return 'danger';
      case ApplicationStatus.HIRED:
        return 'success';
      default:
        return 'primary';
    }
  };

  const renderApplicantItem = ({ item }: { item: JobApplication }) => (
    <Card style={styles.cardWrapper}>
      <View style={styles.applicantCard}>
        <View style={styles.applicantHeader}>
          <View style={styles.applicantInfo}>
            <Avatar name={item.student.name} size="medium" />
            <View style={styles.textContent}>
              <Text style={styles.name}>{item.student.name}</Text>
              <View style={styles.studentMeta}>
                {item.student.skillScore !== undefined && (
                  <Text style={styles.skillScore}>Score: {item.student.skillScore}</Text>
                )}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: '/reviews', params: { userId: item.student.id } })}
                >
                  <Text style={styles.viewReviewsText}>View Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Badge label={(item.status || 'applied').toUpperCase()} color={getStatusColor(item.status || ApplicationStatus.APPLIED)} />
        </View>

        {item.coverLetter && (
          <View style={styles.coverLetter}>
            <Text style={styles.coverLetterLabel}>Cover Letter</Text>
            <Text style={styles.coverLetterText} numberOfLines={3}>
              {item.coverLetter}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          {item.status === ApplicationStatus.APPLIED && (
            <>
              <Button
                title="Shortlist"
                variant="secondary"
                size="small"
                onPress={() =>
                  applicationAPI.shortlistApplication(jobId as string, item.id).then(() => fetchApplications())
                }
                style={styles.actionButton}
              />
              <Button
                title="Reject"
                variant="danger"
                size="small"
                onPress={() => handleReject(item.id)}
                style={styles.actionButton}
              />
            </>
          )}

          {item.status === ApplicationStatus.SHORTLISTED && (
            <>
              <Button
                title="Hire Now"
                variant="primary"
                size="small"
                onPress={() => handleHire(item.id)}
                style={styles.actionButton}
              />
              <Button
                title="Reject"
                variant="danger"
                size="small"
                onPress={() => handleReject(item.id)}
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </View>
    </Card>
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

  return (
    <Screen scrollable={false}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({activeTab === 'all' ? applications.length : '...'})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'shortlisted' && styles.activeTab]}
          onPress={() => setActiveTab('shortlisted')}
        >
          <Text style={[styles.tabText, activeTab === 'shortlisted' && styles.activeTabText]}>
            Shortlisted
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderApplicantItem}
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
              <Text style={styles.emptyText}>
                {activeTab === 'all' ? 'No applicants yet' : 'No shortlisted candidates yet'}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium as any,
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold as any,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  applicantCard: {
    gap: 8,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.black,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  viewReviewsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  skillScore: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
  },
  coverLetter: {
    padding: 12,
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  coverLetterLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    fontWeight: Typography.fontWeight.bold as any,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  coverLetterText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
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
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.gray[400],
  },
});
