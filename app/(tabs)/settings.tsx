import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  Alert, 
  Image, 
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoundedCard from '../../components/ui/RoundedCard';
import RoundedButton from '../../components/ui/RoundedButton';
import { userService } from '../../services/api';
import { UserSettings as UserSettingsType, createDefaultUserSettings } from '../../services/api/models/UserProfile';

// Extended user settings interface with additional UI-specific fields
interface ExtendedUserSettings extends UserSettingsType {
  nickname?: string;
  avatarUrl?: string;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  showOnLeaderboard?: boolean;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // State for user settings
  const [settings, setSettings] = useState<ExtendedUserSettings>(createDefaultUserSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load user settings from the API
  const loadUserSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const userSettings = await userService.getUserSettings();
      
      // Get additional user profile data to enhance settings
      const userProfile = await userService.getCurrentUser();
      
      // Combine API settings with UI-specific settings
      const extendedSettings: ExtendedUserSettings = {
        ...userSettings,
        nickname: userProfile.nickname,
        avatarUrl: userProfile.avatarId ? `https://api.arkalardayim.com/avatars/${userProfile.avatarId}.png` : undefined,
        quietHoursEnabled: false, // This would come from the API in a real implementation
        quietHoursStart: '22:00', // These would come from the API
        quietHoursEnd: '08:00',   // These would come from the API
        showOnLeaderboard: true   // This would come from the API
      };
      
      setSettings(extendedSettings);
    } catch (error) {
      console.error('Error loading user settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadUserSettings();
    }, [loadUserSettings])
  );
  
  // Update a notification setting
  const updateNotificationSetting = async (key: string, value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Update local state first for immediate feedback
      const updatedSettings: ExtendedUserSettings = {
        ...settings,
        notificationsEnabled: key === 'notificationsEnabled' 
          ? value 
          : settings.notificationsEnabled,
        channelNotifications: {
          ...settings.channelNotifications,
          ...(key === 'announcements' && { announcements: { enabled: value, priority: settings.channelNotifications.announcements?.priority || 'medium' } }),
          ...(key === 'events' && { events: { enabled: value, priority: settings.channelNotifications.events?.priority || 'medium' } }),
          ...(key === 'achievements' && { achievements: { enabled: value, priority: settings.channelNotifications.achievements?.priority || 'medium' } }),
          ...(key === 'leaderboard' && { leaderboard: { enabled: value, priority: settings.channelNotifications.leaderboard?.priority || 'low' } }),
        },
        dailyReminderEnabled: key === 'dailyReminderEnabled' ? value : settings.dailyReminderEnabled
      };
      
      setSettings(updatedSettings);
      
      // Extract only the API-compatible properties for the update
      const apiSettings: Partial<UserSettingsType> = {
        notificationsEnabled: updatedSettings.notificationsEnabled,
        channelNotifications: updatedSettings.channelNotifications,
        dailyReminderEnabled: updatedSettings.dailyReminderEnabled,
        dailyReminderTime: updatedSettings.dailyReminderTime,
        shareAttendanceByDefault: updatedSettings.shareAttendanceByDefault,
        theme: updatedSettings.theme
      };
      
      // Send update to the server
      await userService.updateSettings(apiSettings);
      
      // If enabling notifications, request permission in a real app
      // This would use the device's notification system
      if (key === 'notificationsEnabled' && value) {
        Alert.alert(
          'Notifications',
          'You have enabled notifications for this app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
      // Revert changes on error
      await loadUserSettings();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle quiet hours
  const toggleQuietHours = async (value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Update local state
      const updatedSettings: ExtendedUserSettings = {
        ...settings,
        quietHoursEnabled: value,
      };
      
      setSettings(updatedSettings);
      
      // In a real implementation, we would send this to the API
      // await userService.updateSettings({...});
      // For now, we'll just simulate the API call with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error updating quiet hours settings:', error);
      Alert.alert('Error', 'Failed to update quiet hours settings. Please try again.');
      // Revert changes on error
      await loadUserSettings();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle privacy settings
  const togglePrivacySetting = async (key: string, value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Update local state
      const updatedSettings: ExtendedUserSettings = {
        ...settings,
        ...(key === 'showOnLeaderboard' && { showOnLeaderboard: value }),
        ...(key === 'shareAttendanceByDefault' && { shareAttendanceByDefault: value }),
      };
      
      setSettings(updatedSettings);
      
      // For shareAttendanceByDefault, update the API
      if (key === 'shareAttendanceByDefault') {
        await userService.updateSettings({
          shareAttendanceByDefault: value
        });
      }
      
      // For showOnLeaderboard, we would update the API if it had this field
      // Currently simulating the API call with a delay
      if (key === 'showOnLeaderboard') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
      // Revert changes on error
      await loadUserSettings();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle dark mode
  const toggleDarkMode = async (value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Update local state
      const updatedSettings: ExtendedUserSettings = {
        ...settings,
        theme: value ? 'dark' : 'light',
      };
      
      setSettings(updatedSettings);
      
      // Send update to the server
      await userService.updateSettings({
        theme: value ? 'dark' : 'light'
      });
      
      // Notify user about app restart
      Alert.alert(
        'Theme Updated',
        `Theme changed to ${value ? 'dark' : 'light'} mode. Some changes may require restarting the app.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating theme settings:', error);
      Alert.alert('Error', 'Failed to update theme settings. Please try again.');
      // Revert changes on error
      await loadUserSettings();
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle edit profile
  const handleEditProfile = () => {
    // Navigate to edit profile screen
    Alert.alert('Edit Profile', 'This would open the profile edit screen.');
    // In a real app, navigate to the profile edit screen
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // In a real implementation, we would call signOut method
              // This is a placeholder until the API method is implemented
              // await userService.signOut();
              
              // Clear local storage
              await AsyncStorage.clear();
              
              // Notify the user
              Alert.alert('Signed Out', 'You have been signed out successfully');
              
              // In a real app, this would navigate to the authentication screen
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };
  
  // Handle reset data
  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all your app data including attendance history and preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              
              // Clear local storage
              await AsyncStorage.clear();
              
              // In a real implementation, we would call resetUserData method
              // This is a placeholder until the API method is implemented
              // await userService.resetUserData();
              
              // Reload settings
              await loadUserSettings();
              
              // Notify the user
              Alert.alert('Data Reset', 'All data has been reset successfully');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.darkContainer]}>
        <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
        <Text style={[styles.loadingText, isDark && styles.darkText]}>Loading settings...</Text>
      </View>
    );
  }
  
  if (!settings) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.darkContainer]}>
        <Text style={[styles.errorText, isDark && styles.darkText]}>
          Failed to load settings. Please try again later.
        </Text>
        <RoundedButton
          variant="primary"
          size="medium"
          title="Retry"
          onPress={loadUserSettings}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
          <Text style={[styles.savingText, isDark && styles.darkText]}>Saving changes...</Text>
        </View>
      )}
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isDark && styles.darkText]}>
          Settings
        </Text>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Profile</Text>
          <RoundedCard style={[styles.profileCard, isDark && styles.darkCard]}>
            <View style={styles.avatarContainer}>
              {settings.avatarUrl ? (
                <Image 
                  source={{ uri: settings.avatarUrl }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={[styles.avatar, isDark && styles.darkAvatar]}>
                  <Text style={styles.avatarInitial}>
                    {settings.nickname?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.nicknameLarge, isDark && styles.darkText]}>
                {settings.nickname || 'User'}
              </Text>
              <RoundedButton
                variant="outline"
                size="small"
                title="Edit Profile"
                onPress={handleEditProfile}
              />
            </View>
          </RoundedCard>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Notifications</Text>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Enable Notifications
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Receive updates from subscribed channels
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateNotificationSetting('notificationsEnabled', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Announcement Notifications
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Receive updates for new announcements
              </Text>
            </View>
            <Switch
              value={settings.channelNotifications?.announcements?.enabled ?? false}
              onValueChange={(value) => updateNotificationSetting('announcements', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
              disabled={!settings.notificationsEnabled}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Event Reminders
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Get reminders for upcoming protests
              </Text>
            </View>
            <Switch
              value={settings.channelNotifications?.events?.enabled ?? false}
              onValueChange={(value) => updateNotificationSetting('events', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
              disabled={!settings.notificationsEnabled}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Achievement Notifications
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Be notified when you earn badges
              </Text>
            </View>
            <Switch
              value={settings.channelNotifications?.achievements?.enabled ?? false}
              onValueChange={(value) => updateNotificationSetting('achievements', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
              disabled={!settings.notificationsEnabled}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Daily Reminders
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Daily check-in reminders
              </Text>
            </View>
            <Switch
              value={settings.dailyReminderEnabled}
              onValueChange={(value) => updateNotificationSetting('dailyReminderEnabled', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
              disabled={!settings.notificationsEnabled}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Quiet Hours
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                {settings.quietHoursEnabled 
                  ? `No notifications between ${settings.quietHoursStart || '22:00'} and ${settings.quietHoursEnd || '08:00'}`
                  : 'Notifications will be delivered at any time'}
              </Text>
            </View>
            <Switch
              value={settings.quietHoursEnabled}
              onValueChange={toggleQuietHours}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
              disabled={!settings.notificationsEnabled}
            />
          </RoundedCard>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Privacy</Text>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Show on Leaderboard
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Your nickname will be visible to others
              </Text>
            </View>
            <Switch
              value={settings.showOnLeaderboard}
              onValueChange={(value) => togglePrivacySetting('showOnLeaderboard', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
            />
          </RoundedCard>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Share Attendance by Default
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Automatically share attendance on social media
              </Text>
            </View>
            <Switch
              value={settings.shareAttendanceByDefault}
              onValueChange={(value) => togglePrivacySetting('shareAttendanceByDefault', value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
            />
          </RoundedCard>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Appearance</Text>
          
          <RoundedCard style={[styles.settingItem, isDark && styles.darkCard]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, isDark && styles.darkText]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                Use dark mode for better visibility
              </Text>
            </View>
            <Switch
              value={settings.theme === 'dark'}
              onValueChange={toggleDarkMode}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
            />
          </RoundedCard>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>More</Text>
          
          <RoundedCard style={[styles.actionItemCard, isDark && styles.darkCard]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Request Channel', 'This would open the channel request form.')}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={24} 
                color={isDark ? Colors.dark.tint : Colors.light.tint} 
                style={styles.actionIcon}
              />
              <Text style={[styles.actionButtonText, isDark && styles.darkText]}>
                Request New Channel
              </Text>
            </TouchableOpacity>
          </RoundedCard>
          
          <RoundedCard style={[styles.actionItemCard, isDark && styles.darkCard]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Help & Support', 'This would open the help center.')}
            >
              <MaterialIcons 
                name="help-outline" 
                size={24} 
                color={isDark ? Colors.dark.tint : Colors.light.tint}
                style={styles.actionIcon} 
              />
              <Text style={[styles.actionButtonText, isDark && styles.darkText]}>
                Help & Support
              </Text>
            </TouchableOpacity>
          </RoundedCard>
          
          <RoundedCard style={[styles.actionItemCard, isDark && styles.darkCard]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Terms of Service', 'This would show the terms of service.')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={24} 
                color={isDark ? Colors.dark.tint : Colors.light.tint}
                style={styles.actionIcon} 
              />
              <Text style={[styles.actionButtonText, isDark && styles.darkText]}>
                Terms of Service
              </Text>
            </TouchableOpacity>
          </RoundedCard>
          
          <RoundedCard style={[styles.actionItemCard, isDark && styles.darkCard]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert('Privacy Policy', 'This would show the privacy policy.')}
            >
              <Ionicons 
                name="shield-outline" 
                size={24} 
                color={isDark ? Colors.dark.tint : Colors.light.tint}
                style={styles.actionIcon} 
              />
              <Text style={[styles.actionButtonText, isDark && styles.darkText]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
          </RoundedCard>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Account</Text>
          
          <View style={styles.accountActions}>
            <RoundedButton
              variant="outline"
              title="Sign Out"
              onPress={handleSignOut}
              style={styles.accountButton}
              icon={<Ionicons name="log-out-outline" size={18} color={isDark ? "#fff" : "#333"} style={{ marginRight: 5 }} />}
            />
            
            <RoundedButton
              variant="danger"
              title="Reset Data"
              onPress={handleResetData}
              style={styles.accountButton}
              icon={<MaterialIcons name="delete-outline" size={18} color="#fff" style={{ marginRight: 5 }} />}
            />
          </View>
        </View>
        
        {/* Version info */}
        <Text style={[styles.versionInfo, isDark && styles.darkSubText]}>
          Version 1.0.0 (Build 100)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  retryButton: {
    marginTop: 10,
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  savingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#aaa',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#424242',
  },
  darkSectionTitle: {
    color: '#e0e0e0',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkAvatar: {
    backgroundColor: Colors.dark.tint,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  nicknameLarge: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  actionItemCard: {
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  versionInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
  },
}); 