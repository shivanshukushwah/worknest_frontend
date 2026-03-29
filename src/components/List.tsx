import React from 'react';
import { View, Text, StyleSheet, FlatList, ViewStyle } from 'react-native';
import { Colors, Typography } from '../utils/theme';
import Card from './Card';
import { Ionicons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  icon?: any;
  iconColor?: string;
  onPress?: () => void;
}

interface ListProps {
  items: ListItemProps[];
  style?: ViewStyle;
}

const ListItem: React.FC<ListItemProps & { onPress?: () => void }> = ({
  title,
  subtitle,
  trailing,
  icon,
  iconColor,
  onPress,
}) => {
  return (
    <Card
      style={[
        styles.listItem,
        onPress && styles.listItemTouchable,
      ] as any}
      onPress={onPress}
    >
      <View style={styles.listItemContent}>
        <View style={styles.leftContent}>
          {icon && (
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={22} color={iconColor || Colors.primary} />
            </View>
          )}
          <View style={styles.listItemText}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
        </View>
        {trailing && <View style={styles.trailing}>{trailing}</View>}
      </View>
    </Card>
  );
};

const List: React.FC<ListProps> = ({ items, style }) => {
  return (
    <View style={style}>
      <FlatList
        data={items}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={item.subtitle}
            trailing={item.trailing}
            icon={item.icon}
            iconColor={item.iconColor}
            onPress={item.onPress}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
    marginBottom: 0,
  },
  listItemTouchable: {
    opacity: 0.8,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listItemText: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold as any,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  trailing: {
    marginLeft: 12,
  },
});

export { ListItem };
export default List;
