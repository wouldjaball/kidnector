import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Props {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export default function EmailVerificationScreen({ navigation, route }: Props) {
  const [isResending, setIsResending] = useState(false);
  const [lastResent, setLastResent] = useState<number | null>(null);
  const email = route.params?.email;

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.replace('Onboarding');
      }
    };

    checkVerification();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigation.replace('Onboarding');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigation]);

  async function resendVerification() {
    if (!email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    // Prevent spam (60 second cooldown)
    const now = Date.now();
    if (lastResent && (now - lastResent) < 60000) {
      const remainingSeconds = Math.ceil(60 - (now - lastResent) / 1000);
      Alert.alert('Please wait', `You can resend in ${remainingSeconds} seconds`);
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      setLastResent(now);
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  }

  function goToLogin() {
    navigation.navigate('Login');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        {/* Header */}
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to:
        </Text>
        <Text style={styles.email}>{email}</Text>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Click the link in the email to verify your account and complete setup.
          </Text>
          <Text style={styles.instructionNote}>
            Don't forget to check your spam folder!
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.resendButton, isResending && styles.resendButtonDisabled]}
            onPress={resendVerification}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={goToLogin}
          >
            <Text style={styles.loginButtonText}>
              Wrong email? <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help */}
        <View style={styles.help}>
          <Text style={styles.helpTitle}>Still not receiving emails?</Text>
          <Text style={styles.helpText}>
            • Check your spam/junk folder{'\n'}
            • Make sure you entered the correct email{'\n'}
            • Try resending the verification email
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 32,
  },
  instructions: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  instructionText: {
    fontSize: 16,
    color: '#1a1a1a',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  instructionNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    marginBottom: 32,
  },
  resendButton: {
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  resendButtonDisabled: {
    opacity: 0.7,
  },
  resendButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#666',
    fontSize: 15,
  },
  loginBold: {
    color: '#667eea',
    fontWeight: '600',
  },
  help: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});