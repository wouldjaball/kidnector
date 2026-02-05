import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Camera, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../App';
import { 
  supabase, 
  getTodayAffirmation, 
  submitRecording, 
  uploadRecording 
} from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type RouteProps = RouteProp<RootStackParamList, 'ChildRecord'>;

export default function ChildRecordScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { childId, childName } = route.params;
  const { user } = useAuth();
  
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [affirmation, setAffirmation] = useState<any>(null);
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  
  const cameraRef = useRef<CameraView>(null);
  const audioRecordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadData();
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const loadData = async () => {
    try {
      // Get child data
      const { data: childData } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single();
      
      setChild(childData);
      
      // Get today's affirmation
      if (childData?.age) {
        const aff = await getTodayAffirmation(childData.age);
        setAffirmation(aff);
      } else {
        // Fallback affirmation
        setAffirmation({
          id: 'default',
          text: "I am capable of achieving great things today!",
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermissions = async () => {
    if (mode === 'video') {
      const camera = await requestCameraPermission();
      const mic = await requestMicPermission();
      return camera.granted && mic.granted;
    } else {
      const mic = await requestMicPermission();
      return mic.granted;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and microphone permissions to record affirmations.'
      );
      return;
    }

    setIsRecording(true);
    setRecordingDuration(0);
    
    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(d => d + 1);
    }, 1000);

    if (mode === 'video') {
      // Start video recording
      if (cameraRef.current) {
        try {
          const video = await cameraRef.current.recordAsync({
            maxDuration: 60,
          });
          if (video) {
            handleRecordingComplete(video.uri);
          }
        } catch (error) {
          console.error('Error recording video:', error);
          setIsRecording(false);
        }
      }
    } else {
      // Start audio recording
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        audioRecordingRef.current = recording;
      } catch (error) {
        console.error('Error starting audio recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    setIsRecording(false);

    if (mode === 'video') {
      if (cameraRef.current) {
        cameraRef.current.stopRecording();
      }
    } else {
      if (audioRecordingRef.current) {
        try {
          await audioRecordingRef.current.stopAndUnloadAsync();
          const uri = audioRecordingRef.current.getURI();
          if (uri) {
            handleRecordingComplete(uri);
          }
        } catch (error) {
          console.error('Error stopping audio recording:', error);
        }
      }
    }
  };

  const handleRecordingComplete = async (uri: string) => {
    Alert.alert(
      'Submit Recording?',
      "Send this recording to your parent for approval?",
      [
        { text: 'Record Again', style: 'cancel' },
        { 
          text: 'Submit', 
          onPress: () => submitToParent(uri),
        },
      ]
    );
  };

  const submitToParent = async (uri: string) => {
    if (!user || !child) return;
    
    setSubmitting(true);
    try {
      // Upload recording
      const recordingUrl = await uploadRecording(
        user.id,
        childId,
        uri,
        mode
      );
      
      // Submit completion
      await submitRecording(
        childId,
        affirmation?.id || 'default',
        recordingUrl,
        mode,
        child.daily_screen_time_minutes
      );
      
      Alert.alert(
        '🎉 Great job!',
        'Your recording has been sent to your parent for approval.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit recording');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Affirmation Display */}
      <View style={styles.affirmationContainer}>
        <Text style={styles.affirmationLabel}>Today's Affirmation</Text>
        <Text style={styles.affirmationText}>
          "{affirmation?.text || 'Loading...'}"
        </Text>
        <Text style={styles.instruction}>
          Read this aloud and record yourself saying it!
        </Text>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'video' && styles.modeButtonActive]}
          onPress={() => setMode('video')}
          disabled={isRecording}
        >
          <Ionicons 
            name="videocam" 
            size={20} 
            color={mode === 'video' ? '#fff' : '#6366f1'} 
          />
          <Text style={[styles.modeText, mode === 'video' && styles.modeTextActive]}>
            Video
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'audio' && styles.modeButtonActive]}
          onPress={() => setMode('audio')}
          disabled={isRecording}
        >
          <Ionicons 
            name="mic" 
            size={20} 
            color={mode === 'audio' ? '#fff' : '#6366f1'} 
          />
          <Text style={[styles.modeText, mode === 'audio' && styles.modeTextActive]}>
            Audio
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recording Area */}
      <View style={styles.recordingArea}>
        {mode === 'video' ? (
          cameraPermission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mode="video"
            />
          ) : (
            <View style={styles.permissionPrompt}>
              <Ionicons name="videocam-off" size={48} color="#9ca3af" />
              <Text style={styles.permissionText}>Camera permission required</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.audioVisualizer}>
            <Animated.View 
              style={[
                styles.audioCircle,
                { transform: [{ scale: pulseAnim }] },
                isRecording && styles.audioCircleRecording,
              ]}
            >
              <Ionicons 
                name="mic" 
                size={64} 
                color={isRecording ? '#ef4444' : '#6366f1'} 
              />
            </Animated.View>
            <Text style={styles.audioStatus}>
              {isRecording ? 'Recording...' : 'Tap to start recording'}
            </Text>
          </View>
        )}

        {/* Duration Display */}
        {isRecording && (
          <View style={styles.durationContainer}>
            <View style={styles.recordingIndicator} />
            <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}
      </View>

      {/* Record Button */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonRecording,
            submitting && styles.recordButtonDisabled,
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={submitting}
        >
          {submitting ? (
            <Text style={styles.recordButtonText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons 
                name={isRecording ? 'stop' : 'play'} 
                size={32} 
                color="#fff" 
              />
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Stop' : 'Start Recording'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  affirmationContainer: {
    padding: 20,
    backgroundColor: '#eef2ff',
    margin: 16,
    borderRadius: 16,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  affirmationText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    lineHeight: 30,
  },
  instruction: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeButtonActive: {
    backgroundColor: '#6366f1',
  },
  modeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  modeTextActive: {
    color: '#fff',
  },
  recordingArea: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
  },
  camera: {
    flex: 1,
  },
  permissionPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  audioVisualizer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioCircleRecording: {
    backgroundColor: '#fee2e2',
  },
  audioStatus: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 24,
  },
  durationContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  recordingIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  durationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  controls: {
    padding: 24,
    alignItems: 'center',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    minWidth: 200,
  },
  recordButtonRecording: {
    backgroundColor: '#ef4444',
  },
  recordButtonDisabled: {
    opacity: 0.6,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
