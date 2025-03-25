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
import { useUserService } from '../../services/api/hooks/useUserService';
import { UserSettings } from '../../services/api/models/UserProfile';
import EditProfileModal from '../../components/settings/EditProfileModal';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const userService = useUserService();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  
  useEffect(() => {
    loadUserSettings();
  }, []);
  
  const loadUserSettings = async () => {
    try {
      const userSettings = await userService.getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditProfile = () => {
    setIsEditProfileModalVisible(true);
  };
  
  const handleSaveProfile = async (nickname: string, avatarId: string) => {
    if (!settings) return;
    
    setIsLoading(true);
    try {
      await userService.updateProfile({ nickname, avatarId });
      Alert.alert('Success', 'Profile updated successfully');
      loadUserSettings(); // Reload settings to get updated profile
      setIsEditProfileModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateNotifications = async (enabled: boolean) => {
    if (!settings) return;
    
    try {
      const updatedSettings = {
        ...settings,
        notifications: {
          enabled
        }
      };
      
      await userService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };
  
  const handleToggleQuietHours = async (enabled: boolean) => {
    if (!settings) return;
    
    try {
      const updatedSettings = {
        ...settings,
        quietHours: {
          ...settings?.quietHours,
          enabled
        }
      };
      
      await userService.updateSettings(updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update quiet hours settings');
    }
  };
  
  // Toggle privacy settings
  const togglePrivacySetting = async (key: string, value: boolean) => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      // Update local state
      const updatedSettings: UserSettings = {
        ...settings,
        ...(key === 'showOnLeaderboard' && { showOnLeaderboard: value }),
      };
      
      setSettings(updatedSettings);
      
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
  
  // Handle sign out
  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.signOut();
              // Handle successful sign out
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
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

  if (isLoading || !settings) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
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
              {settings?.profile?.avatarUrl ? (
                <Image 
                  source={{ uri: settings?.profile?.avatarUrl }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={[styles.avatar, isDark && styles.darkAvatar]}>
                  <Text style={styles.avatarInitial}>
                    {settings?.profile?.nickname?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.nicknameLarge, isDark && styles.darkText]}>
                {settings?.profile?.nickname || 'User'}
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
              value={settings?.notifications?.enabled}
              onValueChange={(value) => handleUpdateNotifications(value)}
              trackColor={{ 
                false: isDark ? '#444' : '#767577', 
                true: Colors[colorScheme || 'light'].tint 
              }}
              thumbColor={'#f4f3f4'}
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
              value={settings?.showOnLeaderboard}
              onValueChange={(value) => togglePrivacySetting('showOnLeaderboard', value)}
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
      
      <EditProfileModal
        visible={isEditProfileModalVisible}
        onClose={() => setIsEditProfileModalVisible(false)}
        onSave={handleSaveProfile}
        currentNickname={settings?.profile?.nickname || ''}
        currentAvatarId={settings?.profile?.avatarUrl?.split('/').pop()?.split('.')[0] || ''}
        isLoading={isLoading}
      />
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