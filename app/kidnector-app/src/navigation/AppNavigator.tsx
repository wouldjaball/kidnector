import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../lib/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ParentDashboardScreen from '../screens/ParentDashboardScreen';
import AddChildScreen from '../screens/AddChildScreen';
import ChildHomeScreen from '../screens/ChildHomeScreen';
// import RecordingScreen from '../screens/RecordingScreen';
// import ApprovalScreen from '../screens/ApprovalScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
      {/* <Stack.Screen name="Recording" component={RecordingScreen} />
      <Stack.Screen name="Approval" component={ApprovalScreen} />
      <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} /> */}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { session, family, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f7ff' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  // Determine which stack to show
  const getInitialStack = () => {
    if (!session) {
      return <AuthStack />;
    }
    
    // If user is logged in but hasn't completed onboarding
    if (session && family && !family.onboarding_completed) {
      return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
          <Stack.Screen name="AddChild" component={AddChildScreen} />
        </Stack.Navigator>
      );
    }
    
    // User is logged in and has completed onboarding
    return <AppStack />;
  };

  return (
    <NavigationContainer>
      {getInitialStack()}
    </NavigationContainer>
  );
}
