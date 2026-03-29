import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen, Card, Avatar } from '@components/index';
import { reviewAPI } from '@api/index';
import { JobReview } from '@mytypes/index';
import { formatDate } from '@utils/formatting';
import { Colors } from '@utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewsScreen() {
  const { userId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<JobReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await reviewAPI.getUserReviews(userId as string);
      if (response.success && response.data) {
        setReviews(response.data as any);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Avatar name={item.fromUser?.name} size="medium" source={item.fromUser?.avatar} />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.fromUser?.name}</Text>
          <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color={Colors.accent} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="star-outline" size={64} color={Colors.gray[200]} />
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 20 },
  reviewCard: { marginBottom: 16, padding: 20 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewerInfo: { marginLeft: 16, flex: 1 },
  reviewerName: { fontSize: 16, fontWeight: '700' as any, color: Colors.text },
  reviewDate: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  ratingBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(251, 191, 36, 0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  ratingText: { fontSize: 13, fontWeight: '700' as any, color: Colors.accent, marginLeft: 4 },
  comment: { fontSize: 14, color: Colors.text, lineHeight: 22, marginTop: 4 },
  loader: { marginTop: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textLight, marginTop: 16, fontWeight: '500' as any },
});
