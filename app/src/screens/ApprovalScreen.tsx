import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { supabase, updateCompletionStatus } from '../lib/supabase';

type RouteProps = RouteProp<RootStackParamList, 'Approval'>;

export default function ApprovalScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { completionId, childName } = route.params;

  const [completion, setCompletion] = useState<any>(null);
  const [affirmation, setAffirmation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadCompletion();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadCompletion = async () => {
    try {
      const { data } = await supabase
        .from('completions')
        .select(`
          *,
          affirmations (text)
        `)
        .eq('id', completionId)
        .single();

      if (data) {
        setCompletion(data);
        setAffirmation(data.affirmations);
      }
    } catch (error) {
      console.error('Error loading completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async () => {
    if (!completion?.recording_url) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: completion.recording_url },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await updateCompletionStatus(completionId, 'approved');
      Alert.alert(
        '✅ Approved!',
        `${childName}'s screen time is now unlocked! Great job!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve');
    } finally {
      setProcessing(false);
    }
  };

  const handleRedo = async () => {
    Alert.alert(
      'Request Redo?',
      `Ask ${childName} to record their affirmation again?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Redo',
          style: 'destructive',
          onPress: async () => {
            setProcessing(true);
            try {
              await updateCompletionStatus(completionId, 'redo_requested');
              Alert.alert(
                '🔄 Redo Requested',
                `${childName} will need to record again.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request redo');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!completion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recording not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Affirmation */}
      <View style={styles.affirmationCard}>
        <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
        <Text style={styles.affirmationText}>
          "{affirmation?.text || completion.custom_affirmation_text || 'No affirmation'}"
        </Text>
      </View>

      {/* Recording Player */}
      <View style={styles.playerContainer}>
        <Text style={styles.playerLabel}>
          {childName}'s Recording
        </Text>
        
        {completion.recording_type === 'video' ? (
          <Video
            source={{ uri: completion.recording_url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
          />
        ) : (
          <TouchableOpacity
            style={styles.audioPlayer}
            onPress={playAudio}
          >
            <View style={styles.audioCircle}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={48}
                color="#6366f1"
              />
            </View>
            <Text style={styles.audioText}>
              {isPlaying ? 'Tap to pause' : 'Tap to play'}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.submittedAt}>
          Submitted {new Date(completion.submitted_at).toLocaleTimeString()}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.redoButton, processing && styles.buttonDisabled]}
          onPress={handleRedo}
          disabled={processing}
        >
          <Ionicons name="refresh" size={24} color="#ef4444" />
          <Text style={styles.redoButtonText}>Request Redo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveButton, processing && styles.buttonDisabled]}
          onPress={handleApprove}
          disabled={processing}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.approveButtonText}>
            {processing ? 'Processing...' : 'Approve'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen Time Info */}
      <View style={styles.screenTimeInfo}>
        <Ionicons name="time-outline" size={20} color="#6b7280" />
        <Text style={styles.screenTimeText}>
          Approving unlocks {completion.screen_time_earned_minutes} minutes of screen time
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  affirmationCard: {
    backgroundColor: '#eef2ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    lineHeight: 26,
  },
  playerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  playerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  video: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  audioPlayer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  submittedAt: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  redoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  redoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#10b981',
  },
  approveButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  screenTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  screenTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
});
