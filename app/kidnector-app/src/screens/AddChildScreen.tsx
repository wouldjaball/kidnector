import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { addChild } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface Props {
  navigation: any;
}

const AVATARS = ['👦', '👧', '🧒', '👶', '🧒🏽', '👦🏻', '👧🏾', '🧒🏼'];

export default function AddChildScreen({ navigation }: Props) {
  const { refreshChildren } = useAuth();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [screenTime, setScreenTime] = useState('60');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAddChild() {
    if (!name.trim()) {
      Alert.alert('Error', "Please enter your child's name");
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 3 || ageNum > 18) {
      Alert.alert('Error', 'Please enter a valid age (3-18)');
      return;
    }

    setIsLoading(true);
    try {
      await addChild(name.trim(), ageNum);
      await refreshChildren();
      Alert.alert('Success!', `${name} has been added!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add child');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Child</Text>
        </View>

        <View style={styles.form}>
          {/* Avatar Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Choose an Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.avatarSelected,
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarEmoji}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Child's Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Emma"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Age */}
          <View style={styles.section}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 8"
              placeholderTextColor="#999"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>

          {/* Screen Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Daily Screen Time (minutes)</Text>
            <View style={styles.screenTimeOptions}>
              {['30', '45', '60', '90', '120'].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.screenTimeOption,
                    screenTime === mins && styles.screenTimeSelected,
                  ]}
                  onPress={() => setScreenTime(mins)}
                >
                  <Text
                    style={[
                      styles.screenTimeText,
                      screenTime === mins && styles.screenTimeTextSelected,
                    ]}
                  >
                    {mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAddChild}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add {name || 'Child'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#667eea',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#667eea',
    backgroundColor: '#ede7f6',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  screenTimeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  screenTimeOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f8f7ff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  screenTimeSelected: {
    borderColor: '#667eea',
    backgroundColor: '#ede7f6',
  },
  screenTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  screenTimeTextSelected: {
    color: '#667eea',
  },
  submitButton: {
    height: 56,
    backgroundColor: '#667eea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
