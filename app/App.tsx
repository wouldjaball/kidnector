import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { supabase } from './src/lib/supabase';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import ParentDashboard from './src/screens/ParentDashboard';
import ChildRecordScreen from './src/screens/ChildRecordScreen';
import AddChildScreen from './src/screens/AddChildScreen';
import ApprovalScreen from './src/screens/ApprovalScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ChildRecord: { childId: string; childName: string };
  AddChild: undefined;
  Approval: { completionId: string; childName: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={ParentDashboard}
        options={{ title: 'My Family' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#6366f1' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChildRecord" 
            component={ChildRecordScreen}
            options={({ route }) => ({ 
              title: `${route.params.childName}'s Affirmation` 
            })}
          />
          <Stack.Screen 
            name="AddChild" 
            component={AddChildScreen}
            options={{ title: 'Add Child' }}
          />
          <Stack.Screen 
            name="Approval" 
            component={ApprovalScreen}
            options={{ title: 'Review Recording' }}
          />
        </>
      ) : (
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
        <StatusBar style="light" />
      </NavigationContainer>
    </AuthProvider>
  );
}
