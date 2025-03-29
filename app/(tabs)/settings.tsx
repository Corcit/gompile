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
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoundedCard from '../../components/ui/RoundedCard';
import RoundedButton from '../../components/ui/RoundedButton';
import { useUserService } from '../../services/api/hooks/useUserService';
import { UserSettings } from '../../services/api/models/UserProfile';
import EditProfileModal from '../../components/settings/EditProfileModal';
import PrivacyPolicyModal from '../../components/settings/PrivacyPolicyModal';
import { useAuth } from '../../services/api/AuthContext';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { logout } = useAuth();
  
  const userService = useUserService();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  const [isPrivacyPolicyVisible, setIsPrivacyPolicyVisible] = useState(false);
  
  useEffect(() => {
    loadUserSettings();
  }, []);
  
  const loadUserSettings = async () => {
    try {
      console.log('Attempting to load user settings...');
      const userSettings = await userService.getUserSettings();
      console.log('User settings loaded successfully:', userSettings);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load user settings:', error);
      Alert.alert(
        'Error Loading Settings',
        'Could not load your settings. Please check your internet connection and try again.',
        [
          {
            text: 'Try Again',
            onPress: () => loadUserSettings()
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
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
      Alert.alert('Hata', 'Bildirim ayarları güncellenirken bir hata oluştu');
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
              await logout();
              router.replace('/login');
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
      'Tüm Verileri Sıfırla',
      'Bu işlem, katılım geçmişi ve tercihler dahil tüm uygulama verilerinizi silecektir. Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await AsyncStorage.clear();
              await loadUserSettings();
              Alert.alert('Veriler Sıfırlandı', 'Tüm veriler başarıyla sıfırlandı');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Hata', 'Veriler sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.');
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Ayarlar</Text>
        </View>

        {/* Profil Bölümü */}
        <RoundedCard style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Profil</Text>
          <View style={styles.profileInfo}>
            <Image
              source={settings?.avatar?.url ? { uri: settings.avatar.url } : require('../../assets/images/avatar1.png')}
              style={styles.avatar}
              defaultSource={require('../../assets/images/avatar1.png')}
            />
            <View style={styles.profileText}>
              <Text style={[styles.nickname, isDark && styles.darkText]}>
                {settings?.nickname || 'İsimsiz Kullanıcı'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: isDark ? Colors.dark.card : Colors.light.card }]}
            onPress={handleEditProfile}
          >
            <Text style={[styles.editButtonText, isDark && styles.darkText]}>Profili Düzenle</Text>
          </TouchableOpacity>
        </RoundedCard>

        {/* Bildirimler Bölümü */}
        <RoundedCard style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Bildirimler</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="notifications"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>
                  Bildirimleri Etkinleştir
                </Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                  Tamirat ve etkinlik bildirimlerini al
                </Text>
              </View>
            </View>
            <Switch
              value={settings?.notifications?.enabled}
              onValueChange={handleUpdateNotifications}
              trackColor={{ false: Colors.dark.border, true: Colors.light.tint }}
              thumbColor={settings?.notifications?.enabled ? Colors.light.background : Colors.dark.text}
            />
          </View>
        </RoundedCard>

        {/* Gizlilik Bölümü */}
        <RoundedCard style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Gizlilik</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="leaderboard"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
                style={styles.settingIcon}
              />
              <View>
                <Text style={[styles.settingText, isDark && styles.darkText]}>
                  Sıralamada Göster
                </Text>
                <Text style={[styles.settingDescription, isDark && styles.darkSubText]}>
                  Profilinizi sıralama listesinde göster
                </Text>
              </View>
            </View>
            <Switch
              value={settings?.showOnLeaderboard}
              onValueChange={(value) => togglePrivacySetting('showOnLeaderboard', value)}
              trackColor={{ false: Colors.dark.border, true: Colors.light.tint }}
              thumbColor={settings?.showOnLeaderboard ? Colors.light.background : Colors.dark.text}
            />
          </View>
        </RoundedCard>

        {/* Hesap Bölümü */}
        <RoundedCard style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Hesap</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setIsPrivacyPolicyVisible(true)}
          >
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="privacy-tip"
                size={24}
                color={isDark ? Colors.dark.text : Colors.light.text}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, isDark && styles.darkText]}>
                Gizlilik Politikası
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={isDark ? Colors.dark.text : Colors.light.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.signOutButton]}
            onPress={handleSignOut}
          >
            <MaterialIcons
              name="logout"
              size={24}
              color={Colors.light.error}
            />
            <Text style={styles.actionButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleResetData}
          >
            <MaterialIcons
              name="delete-forever"
              size={24}
              color={Colors.light.error}
            />
            <Text style={styles.actionButtonText}>Tüm Verileri Sıfırla</Text>
          </TouchableOpacity>
        </RoundedCard>
      </ScrollView>

      <EditProfileModal
        visible={isEditProfileModalVisible}
        onClose={() => setIsEditProfileModalVisible(false)}
        onSave={handleSaveProfile}
        initialNickname={settings?.nickname}
        initialAvatarId={settings?.avatar?.id}
        isLoading={isLoading}
      />

      <PrivacyPolicyModal
        visible={isPrivacyPolicyVisible}
        onClose={() => setIsPrivacyPolicyVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  darkText: {
    color: Colors.dark.text,
  },
  darkSubText: {
    color: Colors.dark.text + '80',
  },
  section: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: Colors.dark.card,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: Colors.dark.text,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  resetButton: {
    backgroundColor: Colors.light.error + '20',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
    marginLeft: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: Colors.dark.background,
  },
  profileText: {
    flex: 1,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  editButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: Colors.dark.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.dark.text + '80',
    marginTop: 2,
  },
}); 