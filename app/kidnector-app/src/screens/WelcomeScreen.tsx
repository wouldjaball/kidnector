import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';

interface Props {
  navigation: any;
}

const { height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Welcome to Kidnector</Text>
          <Text style={styles.subtitle}>
            Help your kids build confidence through daily affirmations and earn screen time!
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>🗣️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Daily Affirmations</Text>
              <Text style={styles.featureDescription}>
                Kids record themselves saying positive affirmations
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>⏰</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Earn Screen Time</Text>
              <Text style={styles.featureDescription}>
                Completed affirmations unlock precious screen time
              </Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureEmoji}>👨‍👩‍👧‍👦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Parent Approval</Text>
              <Text style={styles.featureDescription}>
                Review and approve your child's daily progress
              </Text>
            </View>
          </View>
        </View>

        {/* Trial Info */}
        <View style={styles.trialInfo}>
          <Text style={styles.trialText}>
            🎉 Start your <Text style={styles.trialBold}>7-day free trial</Text>
          </Text>
          <Text style={styles.trialSubtext}>
            No credit card required • Cancel anytime
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>
              Already have an account? <Text style={styles.loginBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  features: {
    paddingVertical: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trialInfo: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  trialText: {
    fontSize: 18,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 4,
  },
  trialBold: {
    fontWeight: '700',
  },
  trialSubtext: {
    fontSize: 14,
    color: '#4caf50',
    textAlign: 'center',
  },
  buttons: {
    paddingBottom: 40,
  },
  signUpButton: {
    height: 56,
    backgroundColor: '#667eea',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#666',
    fontSize: 16,
  },
  loginBold: {
    color: '#667eea',
    fontWeight: '600',
  },
});