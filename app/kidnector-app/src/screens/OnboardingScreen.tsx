import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

interface Props {
  navigation: any;
}

const { width } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    emoji: '🎯',
    title: 'Set Your Goal',
    description: 'Help your children build confidence through positive daily affirmations that they record themselves.',
  },
  {
    id: 2,
    emoji: '📱',
    title: 'Earn Screen Time',
    description: 'Kids complete their daily affirmation to unlock their screen time. No affirmation, no devices!',
  },
  {
    id: 3,
    emoji: '👨‍👩‍👧‍👦',
    title: 'Stay Connected',
    description: 'Review and approve your child\'s daily progress. Build healthy habits together as a family.',
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { user, refreshFamily } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  function nextStep() {
    if (currentStep < onboardingSteps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: width * nextIndex,
        animated: true,
      });
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: width * prevIndex,
        animated: true,
      });
    }
  }

  async function completeOnboarding() {
    if (!user) return;

    setIsCompleting(true);
    try {
      // Mark onboarding as completed in the database
      const { error } = await supabase
        .from('families')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh family data to update the context
      await refreshFamily();

      // Navigate to the main app
      navigation.replace('ParentDashboard');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      // Continue anyway - don't block the user
      navigation.replace('ParentDashboard');
    } finally {
      setIsCompleting(false);
    }
  }

  function handleScroll(event: any) {
    const x = event.nativeEvent.contentOffset.x;
    const step = Math.round(x / width);
    setCurrentStep(step);
  }

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome to Kidnector!</Text>
        <View style={styles.progressBar}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {onboardingSteps.map((step, index) => (
          <View key={step.id} style={styles.slide}>
            <View style={styles.slideContent}>
              <View style={styles.iconContainer}>
                <Text style={styles.emoji}>{step.emoji}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Trial Badge */}
      <View style={styles.trialBadge}>
        <Text style={styles.trialText}>🎉 Your 7-day free trial has started!</Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, styles.backButton]}
          onPress={previousStep}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled
          ]}>
            Back
          </Text>
        </TouchableOpacity>

        {isLastStep ? (
          <TouchableOpacity
            style={[styles.navButton, styles.completeButton]}
            onPress={completeOnboarding}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.completeButtonText}>Get Started!</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={nextStep}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Skip Option */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={completeOnboarding}
      >
        <Text style={styles.skipButtonText}>Skip Introduction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7ff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#667eea',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  emoji: {
    fontSize: 64,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
  },
  trialBadge: {
    backgroundColor: '#e8f5e9',
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  nextButton: {
    backgroundColor: '#667eea',
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#999',
  },
});