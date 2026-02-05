import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { signOut, getPendingCompletions } from '../lib/supabase';
import { Child } from '../lib/database.types';

interface Props {
  navigation: any;
}

interface PendingCompletion {
  id: string;
  child_id: string;
  recording_url: string;
  submitted_at: string;
  children: { name: string; avatar: string };
  affirmations: { text: string; category: string };
}

export default function ParentDashboardScreen({ navigation }: Props) {
  const { family, children, refreshChildren } = useAuth();
  const [pendingCompletions, setPendingCompletions] = useState<PendingCompletion[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPendingCompletions();
  }, []);

  async function loadPendingCompletions() {
    try {
      const completions = await getPendingCompletions();
      setPendingCompletions(completions as PendingCompletion[]);
    } catch (error) {
      console.error('Error loading pending completions:', error);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([refreshChildren(), loadPendingCompletions()]);
    setRefreshing(false);
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.parentName}>{family?.parent_name || 'Parent'} 👋</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Approvals */}
        {pendingCompletions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Pending Approvals</Text>
            {pendingCompletions.map((completion) => (
              <TouchableOpacity
                key={completion.id}
                style={styles.pendingCard}
                onPress={() => navigation.navigate('Approval', { completion })}
              >
                <View style={styles.pendingAvatar}>
                  <Text style={styles.pendingAvatarText}>
                    {completion.children.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.pendingInfo}>
                  <Text style={styles.pendingName}>{completion.children.name}</Text>
                  <Text style={styles.pendingTime}>
                    Submitted their affirmation
                  </Text>
                </View>
                <Text style={styles.pendingArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Children */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Your Children</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddChild')}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👶</Text>
              <Text style={styles.emptyTitle}>No children yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first child to get started
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddChild')}
              >
                <Text style={styles.emptyButtonText}>Add Child</Text>
              </TouchableOpacity>
            </View>
          ) : (
            children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.childCard}
                onPress={() => navigation.navigate('ChildDetail', { child })}
              >
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>
                    {child.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>{child.age} years old</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakIcon}>🔥</Text>
                  <Text style={styles.streakCount}>{child.current_streak}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Stats */}
        {children.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Family Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {children.reduce((sum, c) => sum + c.total_completions, 0)}
                </Text>
                <Text style={styles.statLabel}>Total Affirmations</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {Math.max(...children.map((c) => c.longest_streak), 0)}
                </Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>
          </View>
        )}

        {/* Trial Banner */}
        {family?.subscription_status === 'trial' && (
          <View style={styles.trialBanner}>
            <Text style={styles.trialText}>
              🎉 Free trial • {getDaysRemaining(family.trial_ends_at)} days left
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text style={styles.trialLink}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getDaysRemaining(trialEndsAt: string): number {
  const now = new Date();
  const end = new Date(trialEndsAt);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#667eea',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  parentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#667eea',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  pendingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffc107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  pendingTime: {
    fontSize: 13,
    color: '#666',
  },
  pendingArrow: {
    fontSize: 20,
    color: '#ffc107',
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  childInfo: {
    flex: 1,
    marginLeft: 12,
  },
  childName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  streakCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  trialBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  trialText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  trialLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
});
