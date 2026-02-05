import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from '../config/supabase';

// Import all screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import AuthScreen from '../screens/AuthScreen';
import AddChildScreen from '../screens/AddChildScreen';
import ParentDashboard from '../screens/ParentDashboard';
import ChildRecordScreen from '../screens/ChildRecordScreen';
import ApprovalScreen from '../screens/ApprovalScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={session ? "ParentDashboard" : "Onboarding"}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Auth Flow */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ title: 'Welcome to Kidnector' }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Sign In' }}
        />

        {/* Main App Flow */}
        <Stack.Screen 
          name="ParentDashboard" 
          component={ParentDashboard} 
          options={{ 
            title: 'Family Dashboard',
            headerLeft: null, // Disable back button
          }}
        />
        <Stack.Screen 
          name="AddChild" 
          component={AddChildScreen} 
          options={{ title: 'Add Child' }}
        />
        <Stack.Screen 
          name="ChildRecord" 
          component={ChildRecordScreen} 
          options={{ title: 'Daily Affirmation' }}
        />
        <Stack.Screen 
          name="Approval" 
          component={ApprovalScreen} 
          options={{ title: 'Review Recording' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}