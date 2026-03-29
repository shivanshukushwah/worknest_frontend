import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Screen, Card, Badge } from '@components/index';
import { useNotifications } from '@context/NotificationContext';
import { InAppNotification, NotificationType } from '@mytypes/index';
import { formatTimeAgo } from '@utils/formatting';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.JOB_POSTED:
        return '📋';
      case NotificationType.APPLICATION_STATUS:
        return '📨';
      case NotificationType.JOB_COMPLETED:
        return '✓';
      case NotificationType.NEW_REVIEW:
        return '⭐';
      case NotificationType.PAYMENT_RECEIVED:
        return '💰';
      case NotificationType.WITHDRAWAL_PROCESSED:
        return '💵';
      default:
        return '🔔';
    }
  };

  const renderNotificationItem = ({ item }: { item: InAppNotification }) => (
    <TouchableOpacity
      onPress={() => {
        if (!item.isRead) {
          markAsRead(item.id);
        }
      }}
    >
      <Card
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationIcon}>
            {getNotificationIcon(item.type)}
          </Text>

          <View style={styles.notificationText}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>

          {!item.isRead && <View style={styles.unreadIndicator} />}
        </View>

        <TouchableOpacity
          onPress={() => deleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );

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
      {unreadCount > 0 && (
        <TouchableOpacity
          onPress={markAllAsRead}
          style={styles.markAllButton}
        >
          <Text style={styles.markAllText}>
            Mark all {unreadCount} as read
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>No notifications</Text>
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
  markAllButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E7F3FF',
    borderRadius: 8,
    marginBottom: 12,
  },
  markAllText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
  },
  notificationContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationText: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  message: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 11,
    color: '#999999',
    marginTop: 6,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 6,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#999999',
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});
