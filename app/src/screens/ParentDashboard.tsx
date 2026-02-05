import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { supabase, getChildren, getTodayCompletion } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Child {
  id: string;
  name: string;
  age: number | null;
  avatar: string | null;
  daily_screen_time_minutes: number;
  current_streak: number;
  todayStatus?: 'pending' | 'approved' | 'redo_requested' | 'not_started';
  completionId?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ParentDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadChildren = useCallback(async () => {
    try {
      const childrenData = await getChildren();
      
      // Get today's status for each child
      const childrenWithStatus = await Promise.all(
        childrenData.map(async (child) => {
          const completion = await getTodayCompletion(child.id);
          return {
            ...child,
            todayStatus: completion?.status || 'not_started',
            completionId: completion?.id,
          };
        })
      );
      
      setChildren(childrenWithStatus);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChildren();
    }, [loadChildren])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'redo_requested': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return '✅ Done for today!';
      case 'pending': return '⏳ Waiting for approval';
      case 'redo_requested': return '🔄 Redo requested';
      default: return '📝 Not started';
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'redo_requested': return 'refresh-circle';
      default: return 'play-circle';
    }
  };

  const handleChildPress = (child: Child) => {
    if (child.todayStatus === 'pending' && child.completionId) {
      // Navigate to approval screen
      navigation.navigate('Approval', {
        completionId: child.completionId,
        childName: child.name,
      });
    } else if (child.todayStatus !== 'approved') {
      // Navigate to record screen
      navigation.navigate('ChildRecord', {
        childId: child.id,
        childName: child.name,
      });
    }
  };

  const renderChild = ({ item }: { item: Child }) => (
    <TouchableOpacity
      style={styles.childCard}
      onPress={() => handleChildPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.childHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.avatar || item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{item.name}</Text>
          {item.age && <Text style={styles.childAge}>{item.age} years old</Text>}
        </View>
        <Ionicons
          name={getStatusIcon(item.todayStatus || 'not_started')}
          size={32}
          color={getStatusColor(item.todayStatus || 'not_started')}
        />
      </View>

      <View style={styles.childStats}>
        <View style={styles.statItem}>
          <Ionicons name="flame" size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{item.current_streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color="#6366f1" />
          <Text style={styles.statValue}>{item.daily_screen_time_minutes}</Text>
          <Text style={styles.statLabel}>min/day</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.todayStatus || 'not_started') + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.todayStatus || 'not_started') }]}>
          {getStatusText(item.todayStatus || 'not_started')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={80} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No children yet</Text>
      <Text style={styles.emptyText}>
        Add your first child to start earning screen time through affirmations!
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddChild')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Child</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={children}
        renderItem={renderChild}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListHeaderComponent={
          children.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Today's Progress</Text>
              <Text style={styles.headerSubtitle}>
                Tap a child to review or start their affirmation
              </Text>
            </View>
          ) : null
        }
      />

      {children.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddChild')}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  childAge: {
    fontSize: 14,
    color: '#6b7280',
  },
  childStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 6,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
