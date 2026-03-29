import React, { useEffect, useState } from 'react';
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
import { Colors, Typography, Shadows } from '@utils/theme';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (error) {
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
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{job.title}</Text>
              <Badge label={job.status.toUpperCase()} color={getStatusColor(job.status)} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Budget</Text>
              <Text style={styles.statValue}>{formatSalary(job.salary, job.salaryType)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Applicants</Text>
              <Text style={styles.statValue}>{job.applicationsCount || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Required</Text>
              <Text style={styles.statValue}>{job.positionsRequired}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Badge 
              label={job.type === JobType.ONLINE ? 'Online' : 'Offline'} 
              color="primary" 
            />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{job.duration} hours</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Deadline</Text>
            <Text style={[styles.infoValue, isExpired(job.deadline) && styles.expired]}>
              {formatDate(job.deadline)}
            </Text>
          </View>

          {job.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{job.location}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </Card>

        {job.skills && job.skills.length > 0 && (
          <Card style={styles.skillsCard}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsList}>
              {job.skills.map((skill, index) => (
                <Badge key={index} label={skill} color="accent" />
              ))}
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            title="View Applications"
            onPress={() =>
              router.push({
                pathname: '/(employer)/applicants',
                params: { jobId: job.id },
              })
            }
            fullWidth
            size="large"
          />

          {job.status === JobStatus.OPEN && (
            <Button
              title="Close Job Posting"
              variant="outline"
              onPress={handleCloseJob}
              fullWidth
              style={styles.closeButton}
            />
          )}
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
    paddingTop: 100,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: 64,
  },
  headerCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    marginBottom: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginTop: -16, 
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    gap: 12,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.white,
    lineHeight: 32,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeight.medium as any,
  },
  statValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.white,
  },
  detailsCard: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.black,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textLight,
    fontWeight: Typography.fontWeight.medium as any,
  },
  infoValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold as any,
    color: Colors.text,
  },
  expired: {
    color: Colors.danger,
  },
  descriptionCard: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 24,
  },
  skillsCard: {
    marginTop: 4,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actions: {
    marginTop: 20,
    gap: 12,
    paddingHorizontal: 4,
  },
  closeButton: {
    borderColor: Colors.danger,
  },
  spacing: {
    height: 40,
  },
});
