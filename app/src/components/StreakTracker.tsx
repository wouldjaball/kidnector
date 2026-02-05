import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StreakTrackerProps {
  currentStreak: number;
  completedDates: string[]; // Array of YYYY-MM-DD strings
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  completedDates,
}) => {
  const fireAnimation = useRef(new Animated.Value(1)).current;
  const { width } = Dimensions.get('window');

  useEffect(() => {
    // Celebration animation when streak increases
    if (currentStreak > 0) {
      Animated.sequence([
        Animated.timing(fireAnimation, {
          toValue: 1.3,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fireAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStreak]);

  // Generate last 7 days
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      days.push({
        date: dateString,
        dayName,
        completed: completedDates.includes(dateString),
        isToday: i === 0,
      });
    }
    
    return days;
  };

  const days = getLast7Days();

  return (
    <View style={styles.container}>
      {/* Current Streak Display */}
      <View style={styles.streakHeader}>
        <Animated.View
          style={[
            styles.fireContainer,
            { transform: [{ scale: fireAnimation }] },
          ]}
        >
          <Text style={styles.fireEmoji}>🔥</Text>
        </Animated.View>
        <View>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>
            Day{currentStreak !== 1 ? 's' : ''} in a row!
          </Text>
        </View>
      </View>

      {/* 7-Day Calendar */}
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarTitle}>This Week</Text>
        <View style={styles.daysRow}>
          {days.map((day, index) => (
            <View key={day.date} style={styles.dayContainer}>
              <Text style={[
                styles.dayName,
                day.isToday && styles.todayText,
              ]}>
                {day.dayName}
              </Text>
              <View style={[
                styles.dayCircle,
                day.completed && styles.completedDay,
                day.isToday && styles.todayCircle,
              ]}>
                {day.completed ? (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color="white"
                  />
                ) : (
                  <View style={styles.emptyDay} />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  fireContainer: {
    marginRight: 12,
  },
  fireEmoji: {
    fontSize: 40,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  streakLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  todayText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  completedDay: {
    backgroundColor: '#4ECDC4',
  },
  todayCircle: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  emptyDay: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
});

export default StreakTracker;