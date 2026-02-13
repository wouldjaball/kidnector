import 'react-native-url-polyfill/dist/setup';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// SecureStore adapter for Supabase auth
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions
export async function signUp(email: string, password: string, parentName: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned');

  // Calculate trial end date (7 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 7);

  // Create family record with trial information
  const { error: familyError } = await supabase.from('families').insert({
    id: authData.user.id,
    email,
    parent_name: parentName,
    subscription_status: 'trial',
    trial_ends_at: trialEndDate.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    onboarding_completed: false,
  });

  if (familyError) throw familyError;

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getFamily() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function getChildren() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('family_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addChild(name: string, age: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('children')
    .insert({
      family_id: user.id,
      name,
      age,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDailyAffirmation(childId: string) {
  const { data, error } = await supabase
    .rpc('get_daily_affirmation', { p_child_id: childId });

  if (error) throw error;
  return data?.[0] || null;
}

export async function submitCompletion(
  childId: string,
  affirmationId: string,
  recordingUrl: string,
  recordingType: 'video' | 'audio',
  durationSeconds: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('completions')
    .insert({
      child_id: childId,
      family_id: user.id,
      affirmation_id: affirmationId,
      recording_url: recordingUrl,
      recording_type: recordingType,
      recording_duration_seconds: durationSeconds,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingCompletions() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('completions')
    .select(`
      *,
      children (name, avatar),
      affirmations (text, category)
    `)
    .eq('family_id', user.id)
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function approveCompletion(completionId: string, screenTimeMinutes: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('completions')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      screen_time_earned_minutes: screenTimeMinutes,
    })
    .eq('id', completionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function requestRedo(completionId: string, reason: string) {
  const { data, error } = await supabase
    .from('completions')
    .update({
      status: 'redo_requested',
      redo_reason: reason,
    })
    .eq('id', completionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTodayCompletion(childId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('completions')
    .select('*')
    .eq('child_id', childId)
    .eq('completion_date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function uploadRecording(
  familyId: string,
  childId: string,
  uri: string,
  type: 'video' | 'audio'
) {
  const date = new Date().toISOString().split('T')[0];
  const ext = type === 'video' ? 'mp4' : 'm4a';
  const path = `${familyId}/${childId}/${date}.${ext}`;

  // Read file as blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(path, blob, {
      contentType: type === 'video' ? 'video/mp4' : 'audio/m4a',
      upsert: true,
    });

  if (error) throw error;
  return data.path;
}

// Trial and subscription helpers
export async function getTrialInfo() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('families')
    .select('subscription_status, trial_ends_at, subscription_expires_at')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  
  if (data.subscription_status === 'trial' && data.trial_ends_at) {
    const now = new Date();
    const trialEnd = new Date(data.trial_ends_at);
    const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return {
      isTrialActive: daysRemaining > 0,
      daysRemaining,
      trialEndDate: trialEnd,
    };
  }
  
  return {
    isTrialActive: false,
    daysRemaining: 0,
    trialEndDate: null,
  };
}

export async function checkSubscriptionAccess() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('families')
    .select('subscription_status, trial_ends_at, subscription_expires_at')
    .eq('id', user.id)
    .single();

  if (error) return false;

  const now = new Date();

  // Check trial
  if (data.subscription_status === 'trial' && data.trial_ends_at) {
    const trialEnd = new Date(data.trial_ends_at);
    return now <= trialEnd;
  }

  // Check active subscription
  if (data.subscription_status === 'active' && data.subscription_expires_at) {
    const subEnd = new Date(data.subscription_expires_at);
    return now <= subEnd;
  }

  return false;
}

export async function completeOnboarding() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('families')
    .update({ onboarding_completed: true })
    .eq('id', user.id);

  if (error) throw error;
}
