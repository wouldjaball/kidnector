import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getDailyAffirmation, getTodayCompletion } from '../lib/supabase';
import { Child, Completion } from '../lib/database.types';

interface Props {
  route: { params: { child: Child } };
  navigation: any;
}

interface Affirmation {
  id: string;
  text: string;
  category: string;
}

export default function ChildHomeScreen({ route, navigation }: Props) {
  const { child } = route.params;
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [todayCompletion, setTodayCompletion] = useState<Completion | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [aff, completion] = await Promise.all([
        getDailyAffirmation(child.id),
        getTodayCompletion(child.id),
      ]);
      setAffirmation(aff);
      setTodayCompletion(completion);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Already completed and approved today
  if (todayCompletion?.status === 'approved') {
    return (
      <View style={styles.container}>
        <View style={styles.unlockedContent}>
          <Text style={styles.unlockedIcon}>🎉</Text>
          <Text style={styles.unlockedTitle}>Screen Time Unlocked!</Text>
          <Text style={styles.unlockedTime}>
            {todayCompletion.screen_time_earned_minutes} minutes
          </Text>
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>
              {child.current_streak} day streak!
            </Text>
          </View>
          <Text style={styles.unlockedMessage}>
            Great job today, {child.name}! You earned your screen time.
          </Text>
        </View>
      </View>
    );
  }

  // Waiting for approval
  if (todayCompletion?.status === 'pending') {
    return (
      <View style={styles.container}>
        <View style={styles.waitingContent}>
          <Text style={styles.waitingIcon}>⏳</Text>
          <Text style={styles.waitingTitle}>Waiting for Approval</Text>
          <Text style={styles.waitingMessage}>
            Great job recording your affirmation! Ask a parent to check the app
            and approve it.
          </Text>
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>
              Keep your {child.current_streak} day streak going!
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Redo requested
  if (todayCompletion?.status === 'redo_requested') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.redoIcon}>🔄</Text>
          <Text style={styles.redoTitle}>Let's Try Again!</Text>
          <Text style={styles.redoReason}>
            {todayCompletion.redo_reason || 'Your parent wants you to try again.'}
          </Text>
          <View style={styles.affirmationCard}>
            <Text style={styles.affirmationLabel}>Say this affirmation:</Text>
            <Text style={styles.affirmationText}>{affirmation?.text}</Text>
          </View>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() =>
              navigation.navigate('Recording', { child, affirmation })
            }
          >
            <Text style={styles.recordButtonIcon}>🎬</Text>
            <Text style={styles.recordButtonText}>Record Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Ready to record
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {child.name}! 👋</Text>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeIcon}>🔥</Text>
          <Text style={styles.streakBadgeText}>{child.current_streak}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Time to earn your screen time!</Text>
        
        <View style={styles.affirmationCard}>
          <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
          <Text style={styles.affirmationText}>{affirmation?.text}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryEmoji(affirmation?.category)} {affirmation?.category}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={() =>
            navigation.navigate('Recording', { child, affirmation })
          }
        >
          <Text style={styles.recordButtonIcon}>🎬</Text>
          <Text style={styles.recordButtonText}>Record My Affirmation</Text>
        </TouchableOpacity>

        <Text style={styles.rewardText}>
          🎁 Complete this to earn {child.daily_screen_time_minutes} minutes of screen time!
        </Text>
      </View>
    </View>
  );
}

function getCategoryEmoji(category?: string): string {
  const emojis: Record<string, string> = {
    confidence: '💪',
    kindness: '💝',
    gratitude: '🙏',
    growth: '🌱',
    courage: '🦁',
    custom: '⭐',
  };
  return emojis[category || 'confidence'] || '✨';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakBadgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 30,
  },
  affirmationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 30,
  },
  affirmationLabel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 12,
  },
  affirmationText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#f8f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    color: '#667eea',
    textTransform: 'capitalize',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 20,
  },
  recordButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  rewardText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  // Unlocked styles
  unlockedContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  unlockedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  unlockedTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 10,
  },
  unlockedTime: {
    fontSize: 48,
    fontWeight: '800',
    color: '#667eea',
    marginBottom: 20,
  },
  unlockedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Waiting styles
  waitingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  waitingIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  waitingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  waitingMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
  },
  // Redo styles
  redoIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  redoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  redoReason: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});
