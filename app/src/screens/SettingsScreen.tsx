import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { supabase, getCurrentFamily } from '../lib/supabase';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFamily();
  }, []);

  const loadFamily = async () => {
    try {
      const familyData = await getCurrentFamily();
      setFamily(familyData);
    } catch (error) {
      console.error('Error loading family:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const getSubscriptionBadge = () => {
    if (!family) return null;
    
    const status = family.subscription_status;
    const expiresAt = family.subscription_expires_at 
      ? new Date(family.subscription_expires_at) 
      : null;
    
    if (status === 'trial' && expiresAt) {
      const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        text: `Trial: ${daysLeft} days left`,
        color: daysLeft <= 2 ? '#ef4444' : '#f59e0b',
        bgColor: daysLeft <= 2 ? '#fee2e2' : '#fef3c7',
      };
    }
    
    if (status === 'active') {
      return {
        text: 'Active Subscription',
        color: '#10b981',
        bgColor: '#d1fae5',
      };
    }
    
    return {
      text: 'Subscription Expired',
      color: '#ef4444',
      bgColor: '#fee2e2',
    };
  };

  const subscriptionBadge = getSubscriptionBadge();

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {family?.parent_name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{family?.parent_name || 'Loading...'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Subscription Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.card}>
          <View style={styles.subscriptionRow}>
            <View>
              <Text style={styles.subscriptionLabel}>Status</Text>
              {subscriptionBadge && (
                <View style={[styles.badge, { backgroundColor: subscriptionBadge.bgColor }]}>
                  <Text style={[styles.badgeText, { color: subscriptionBadge.color }]}>
                    {subscriptionBadge.text}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </View>
          
          <TouchableOpacity style={styles.upgradeButton}>
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          
          <Text style={styles.pricingText}>
            $9.99/month or $79.99/year (save 33%)
          </Text>
        </View>
      </View>

      {/* Settings Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="notifications-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="time-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Timezone</Text>
            <Text style={styles.settingsValue}>{family?.timezone || 'Auto'}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="book-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Affirmation Library</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="help-circle-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Contact Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsRow}>
            <View style={styles.settingsIconContainer}>
              <Ionicons name="document-text-outline" size={20} color="#6366f1" />
            </View>
            <Text style={styles.settingsText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.versionText}>Kidnector v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  pricingText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  settingsValue: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 14,
    borderRadius: 12,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    paddingBottom: 32,
  },
});
