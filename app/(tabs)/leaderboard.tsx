import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  useColorScheme,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Share,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RoundedCard from '../../components/ui/RoundedCard';
import RoundedButton from '../../components/ui/RoundedButton';
import Badge from '../../components/ui/Badge';
import { userService } from '../../services/api';
import { Achievement } from '../../services/api/models/UserProfile';

// Leaderboard user interface
interface LeaderboardUser {
  userId: string;
  rank: number;
  nickname: string;
  avatarId: string;
  avatar?: any; // For backward compatibility with local images
  score: number;
  name?: string; // For backward compatibility
  protestsAttended?: number; // For backward compatibility
  badges?: number; // For backward compatibility
  achievements: Achievement[];
}

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [leaderboardType, setLeaderboardType] = useState<'allTime' | 'weekly' | 'monthly'>('allTime');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<{[key: string]: LeaderboardUser[]}>({
    allTime: [],
    weekly: [],
    monthly: []
  });
  const [userData, setUserData] = useState<LeaderboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Animation values for top performers
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulsating animation for top performers
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load leaderboard data
  const loadLeaderboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get leaderboard data for different timeframes
      let allTimeData, weeklyData, monthlyData, userRank, userProfile, userAchievements;

      try {
        allTimeData = await userService.getLeaderboard('allTime', 50);
        weeklyData = await userService.getLeaderboard('weekly', 50);
        monthlyData = await userService.getLeaderboard('monthly', 50);
      } catch (error) {
        console.error('Error fetching leaderboard data, using mock data:', error);
        
        // Mock data for leaderboards
        const mockEntries = [
          {
            userId: 'user1',
            rank: 1,
            nickname: 'Activist123',
            avatarId: '1',
            score: 950,
            achievements: [{ id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() }]
          },
          {
            userId: 'user2',
            rank: 2,
            nickname: 'BoycottHero',
            avatarId: '2',
            score: 820,
            achievements: [
              { id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() },
              { id: 'achievement4', name: 'Haftalık Seri', description: '7 günlük katılım serisi', unlockedAt: new Date().toISOString() }
            ]
          },
          {
            userId: 'user3',
            rank: 3,
            nickname: 'GompileUser',
            avatarId: '3',
            score: 730,
            achievements: [{ id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() }]
          },
          {
            userId: 'user4',
            rank: 4,
            nickname: 'ProBoycotter',
            avatarId: '4',
            score: 650,
            achievements: [
              { id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() },
              { id: 'achievement2', name: 'Düzenli Aktivist', description: '10 protestoya katıldın', unlockedAt: new Date().toISOString() }
            ]
          },
          {
            userId: 'user5',
            rank: 5,
            nickname: 'AwareConsumer',
            avatarId: '5',
            score: 580,
            achievements: [{ id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() }]
          }
        ];

        allTimeData = { entries: mockEntries, total: mockEntries.length };
        
        // Adjust scores for weekly/monthly
        const weeklyEntries = [...mockEntries].map(entry => ({
          ...entry,
          score: Math.floor(entry.score * 0.3)
        }));
        
        const monthlyEntries = [...mockEntries].map(entry => ({
          ...entry,
          score: Math.floor(entry.score * 0.6)
        }));
        
        weeklyData = { entries: weeklyEntries, total: weeklyEntries.length };
        monthlyData = { entries: monthlyEntries, total: monthlyEntries.length };
      }
      
      // Format the data
      const formatData = (data: any): LeaderboardUser[] => {
        return data.entries.map((entry: any) => ({
          userId: entry.userId,
          rank: entry.rank,
          nickname: entry.nickname,
          avatarId: entry.avatarId,
          score: entry.score,
          achievements: entry.achievements || [],
        }));
      };
      
      setLeaderboardData({
        allTime: formatData(allTimeData),
        weekly: formatData(weeklyData),
        monthly: formatData(monthlyData)
      });
      
      // Get user's own rank data
      try {
        userRank = await userService.getLeaderboardRank('allTime');
        userProfile = await userService.getCurrentUser();
        userAchievements = await userService.getAchievements();
      } catch (error) {
        console.error('Error fetching user data, using mock data:', error);
        
        // Mock data for user
        userRank = { rank: 42, score: 350, totalParticipants: 100 };
        userProfile = { id: 'currentuser', nickname: 'CurrentUser', avatarId: '1', experienceLevel: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        userAchievements = [
          { id: 'achievement1', name: 'İlk Katılım', description: 'İlk protestona katıldın', unlockedAt: new Date().toISOString() }
        ];
      }
      
      setUserData({
        userId: userProfile.id,
        rank: userRank.rank,
        nickname: userProfile.nickname,
        avatarId: userProfile.avatarId,
        score: userRank.score,
        achievements: userAchievements,
      });
      
    } catch (error) {
      console.error('Fatal error loading leaderboard data:', error);
      
      // Set fallback data even in case of complete failure
      const fallbackUsers = [
        { userId: 'user1', rank: 1, nickname: 'Kullanıcı 1', avatarId: '1', score: 1000, achievements: [] },
        { userId: 'user2', rank: 2, nickname: 'Kullanıcı 2', avatarId: '2', score: 900, achievements: [] },
        { userId: 'user3', rank: 3, nickname: 'Kullanıcı 3', avatarId: '3', score: 800, achievements: [] },
        { userId: 'user4', rank: 4, nickname: 'Kullanıcı 4', avatarId: '4', score: 700, achievements: [] },
        { userId: 'user5', rank: 5, nickname: 'Kullanıcı 5', avatarId: '5', score: 600, achievements: [] }
      ];
      
      setLeaderboardData({
        allTime: fallbackUsers,
        weekly: fallbackUsers.map(user => ({...user, score: Math.floor(user.score * 0.3)})),
        monthly: fallbackUsers.map(user => ({...user, score: Math.floor(user.score * 0.6)}))
      });
      
      setUserData({
        userId: 'currentuser',
        rank: 42,
        nickname: 'Sen',
        avatarId: '1',
        score: 350,
        achievements: [],
      });
      
      Alert.alert(
        'Bağlantı Hatası',
        'Sıralama verileri yüklenirken bir hata oluştu. İnternet bağlantınızı kontrol edip tekrar deneyin.',
        [{ text: 'Tamam', onPress: () => console.log('OK Pressed') }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboardData();
  }, [loadLeaderboardData]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadLeaderboardData();
    }, [loadLeaderboardData])
  );

  // Share leaderboard rank
  const shareLeaderboardRank = async () => {
    if (!userData) return;

    try {
      const timeframeText = leaderboardType === 'allTime' ? 'tüm zamanlar' : 
                           leaderboardType === 'weekly' ? 'bu hafta' : 'bu ay';
      
      const shareMessage = `Gompile uygulamasında ${timeframeText} sıralamasında #${userData.rank}. sıradayım ve ${userData.score} eyleme katıldım! Harekete katıl ve fark yarat! #Gompile`;
      
      const result = await Share.share({
        message: shareMessage,
        url: Platform.OS === 'ios' ? 'https://gompile.app' : undefined,
        title: 'Gompile Sıralamam'
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Get avatar image based on avatarId
  const getAvatarImage = useCallback((avatarId: string) => {
    // This is a temporary solution until we have proper avatar images from the backend
    const avatarMapping: {[key: string]: any} = {
      '1': require('../../assets/images/avatar1.png'),
      '2': require('../../assets/images/avatar2.png'),
      '3': require('../../assets/images/avatar3.png'),
      '4': require('../../assets/images/avatar4.png'),
      '5': require('../../assets/images/avatar5.png'),
      '6': require('../../assets/images/avatar6.png'),
      '7': require('../../assets/images/avatar7.png'),
      '8': require('../../assets/images/avatar8.png'),
      '9': require('../../assets/images/avatar9.png'),
      '10': require('../../assets/images/avatar10.png'),
      'user': require('../../assets/images/avatar_user.png'),
    };
    
    return avatarMapping[avatarId] || require('../../assets/images/avatar_user.png');
  }, []);

  // Filter the data based on search query
  const filteredData = (leaderboardData[leaderboardType] || [])
    .filter(user => 
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get achievement icon based on type
  const getAchievementIcon = (achievement: Achievement) => {
    if (achievement.iconUrl) {
      return { uri: achievement.iconUrl };
    }
    
    // Handle case where achievement doesn't have requirement field (mock data)
    if (!achievement.requirement || !achievement.requirement.type) {
      // Return default badge based on achievement name as fallback
      if (achievement.name.toLowerCase().includes('streak')) {
        return require('../../assets/images/streak_badge.png');
      } else if (achievement.name.toLowerCase().includes('attendance') || achievement.name.toLowerCase().includes('protest')) {
        return require('../../assets/images/attendance_badge.png');
      } else if (achievement.name.toLowerCase().includes('participation')) {
        return require('../../assets/images/participation_badge.png');
      } else {
        return require('../../assets/images/default_badge.png');
      }
    }
    
    // Default icons based on achievement type
    switch (achievement.requirement.type) {
      case 'attendance':
        return require('../../assets/images/attendance_badge.png'); 
      case 'streak':
        return require('../../assets/images/streak_badge.png');
      case 'participation':
        return require('../../assets/images/participation_badge.png'); 
      case 'special':
        return require('../../assets/images/special_badge.png');
      default:
        return require('../../assets/images/default_badge.png');
    }
  };

  // Open achievement detail modal
  const openAchievementDetail = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalVisible(true);
  };

  // Render achievement detail modal
  const renderAchievementModal = () => {
    if (!selectedAchievement) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, isDark && styles.darkModalContainer]}>
          <View style={[styles.modalContent, isDark && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                {selectedAchievement.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? Colors.dark.text : Colors.light.text} />
              </TouchableOpacity>
            </View>
            <Image
              source={getAchievementIcon(selectedAchievement)}
              style={styles.modalAchievementIcon}
            />
            <Text style={[styles.modalDescription, isDark && styles.darkText]}>
              {selectedAchievement.description}
            </Text>
            
            {/* Only show progress if it exists in the achievement */}
            {selectedAchievement.progress !== undefined && 
             selectedAchievement.requirement?.target !== undefined && (
              <Text style={[styles.modalProgress, isDark && styles.darkText]}>
                İlerleme: {selectedAchievement.progress}/{selectedAchievement.requirement.target}
              </Text>
             )
            }
            
            {/* Show when achievement was unlocked if that info exists */}
            {selectedAchievement.unlockedAt && (
              <Text style={[styles.unlockedAt, isDark && styles.darkText]}>
                Kazanıldı: {new Date(selectedAchievement.unlockedAt).toLocaleDateString('tr-TR')}
              </Text>
            )}
            
            <RoundedButton
              title="Kapat"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    );
  };

  // Render achievement badges
  const renderAchievementBadges = (achievements: Achievement[], limit = 3) => {
    if (!achievements || achievements.length === 0) return null;
    
    const displayAchievements = achievements.slice(0, limit);
    
    return (
      <View style={styles.badgesContainer}>
        {displayAchievements.map((achievement, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => openAchievementDetail(achievement)}
            style={[styles.badgeIcon, { backgroundColor: isDark ? '#2c2c2c' : '#f0f0f0' }]}
          >
            {achievement.iconUrl ? (
              <Image 
                source={{ uri: achievement.iconUrl }} 
                style={{ width: 14, height: 14 }} 
                resizeMode="contain"
              />
            ) : (
              // Use name as fallback if requirement type doesn't exist (mock data)
              <MaterialIcons 
                name={
                  achievement.requirement?.type === 'streak' || 
                  (achievement.name && achievement.name.toLowerCase().includes('streak')) 
                    ? "local-fire-department" 
                  : achievement.requirement?.type === 'attendance' || 
                    (achievement.name && achievement.name.toLowerCase().includes('attendance'))
                    ? "event-available" 
                  : achievement.requirement?.type === 'participation' || 
                    (achievement.name && achievement.name.toLowerCase().includes('participation'))
                    ? "people" 
                  : "emoji-events"
                }
                size={14} 
                color={isDark ? Colors.dark.tint : Colors.light.tint} 
              />
            )}
          </TouchableOpacity>
        ))}
        {achievements.length > limit && (
          <TouchableOpacity 
            style={styles.moreBadges}
            onPress={() => {
              if (achievements.length > limit) {
                openAchievementDetail(achievements[limit]);
              }
            }}
          >
            <Text style={[styles.moreBadgesText, isDark && styles.darkText]}>
              +{achievements.length - limit}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    const isTopThree = index < 3 && leaderboardType === 'allTime';
    const avatarImage = item.avatar || getAvatarImage(item.avatarId);
    const scoreType = leaderboardType === 'allTime' ? 'Toplam' : leaderboardType === 'weekly' ? 'Haftalık' : 'Aylık';
    
    // Wrap in Animated.View for top 3 performers
    const ItemWrapper = isTopThree ? Animated.View : View;
    const animatedStyle = isTopThree ? { transform: [{ scale: scaleAnim }] } : {};
    
    return (
      <ItemWrapper style={animatedStyle}>
        <RoundedCard 
          style={[
            styles.userItem,
            isTopThree && styles.topThreeItem,
            isDark && styles.darkUserItem,
            isTopThree && isDark && styles.darkTopThreeItem,
          ]}
        >
          <View style={styles.rankContainer}>
            {isTopThree ? (
              <MaterialIcons 
                name="emoji-events" 
                size={24} 
                color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
              />
            ) : (
              <Text style={[styles.rankText, isDark && styles.darkText]}>{item.rank}</Text>
            )}
          </View>
          
          <Image source={avatarImage} style={styles.avatar} />
          
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isDark && styles.darkText]}>
              {item.name || item.nickname}
            </Text>
            <View style={styles.statsRow}>
              <MaterialIcons 
                name="event-available" 
                size={14} 
                color={isDark ? "#aaa" : "#666"} 
              />
              <Text style={[styles.statText, isDark && styles.darkSubText]}>
                {item.protestsAttended || item.score} {scoreType} eylem
              </Text>
            </View>
            {renderAchievementBadges(item.achievements)}
          </View>

          {isTopThree && (
            <View style={[
              styles.medal, 
              { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
            ]} />
          )}
        </RoundedCard>
      </ItemWrapper>
    );
  };

  const renderUserSection = () => {
    if (!userData) return null;
    
    const avatarImage = getAvatarImage(userData.avatarId || 'user');
    
    return (
      <View style={styles.userSection}>
        <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Sıralamanız</Text>
        <RoundedCard style={[styles.userItem, isDark && styles.darkUserItem]}>
          <View style={styles.rankContainer}>
            <Text style={[styles.rankText, isDark && styles.darkText]}>{userData.rank}</Text>
          </View>
          <Image source={avatarImage} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, isDark && styles.darkText]}>{userData.nickname}</Text>
            <View style={styles.statsRow}>
              <MaterialIcons 
                name="event-available" 
                size={14} 
                color={isDark ? "#aaa" : "#666"} 
              />
              <Text style={[styles.statText, isDark && styles.darkSubText]}>
                {userData.score} eylem
              </Text>
            </View>
            {renderAchievementBadges(userData.achievements)}
          </View>
          <View style={styles.userButtons}>
            <TouchableOpacity
              onPress={shareLeaderboardRank}
              style={[styles.shareButton, isDark && styles.darkShareButton]}
            >
              <MaterialIcons name="share" size={18} color={isDark ? Colors.dark.tint : Colors.light.tint} />
            </TouchableOpacity>
            <RoundedButton
              variant="primary"
              size="small"
              title="Geliştir"
              onPress={() => Alert.alert('Özellik kaldırıldı', 'Bu özellik artık mevcut değil.')}
              icon={<MaterialIcons name="trending-up" size={16} color="#fff" style={{ marginRight: 5 }} />}
            />
          </View>
        </RoundedCard>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
          <Text style={[styles.loadingText, isDark && styles.darkText]}>Sıralama yükleniyor...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.header, isDark && styles.darkHeader]}>
            <Text style={[styles.headerTitle, isDark && styles.darkText]}>Tesisatçı Sıralaması</Text>
            <Text style={[styles.headerSubtitle, isDark && styles.darkSubText]}>
              Fark yaratan tesisatçılar
            </Text>
          </View>

          <View style={[styles.searchBar, isDark && styles.darkSearchBar]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={isDark ? "#aaa" : "#999"} 
              style={styles.searchIcon} 
            />
            <TextInput
              style={[styles.searchInput, isDark && styles.darkSearchInput]}
              placeholder="Tesisatçı ara..."
              placeholderTextColor={isDark ? "#aaa" : "#999"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={18} color={isDark ? "#aaa" : "#999"} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.tabContainer, isDark && styles.darkTabContainer]}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                leaderboardType === 'allTime' && styles.activeTab,
                isDark && styles.darkTabButton,
                leaderboardType === 'allTime' && isDark && styles.darkActiveTab
              ]}
              onPress={() => setLeaderboardType('allTime')}
            >
              <Text
                style={[
                  styles.tabText,
                  leaderboardType === 'allTime' && styles.activeTabText,
                  isDark && styles.darkTabText,
                  leaderboardType === 'allTime' && isDark && styles.darkActiveTabText
                ]}
              >
                Tüm Zamanlar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                leaderboardType === 'weekly' && styles.activeTab,
                isDark && styles.darkTabButton,
                leaderboardType === 'weekly' && isDark && styles.darkActiveTab
              ]}
              onPress={() => setLeaderboardType('weekly')}
            >
              <Text
                style={[
                  styles.tabText,
                  leaderboardType === 'weekly' && styles.activeTabText,
                  isDark && styles.darkTabText,
                  leaderboardType === 'weekly' && isDark && styles.darkActiveTabText
                ]}
              >
                Bu Hafta
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                leaderboardType === 'monthly' && styles.activeTab,
                isDark && styles.darkTabButton,
                leaderboardType === 'monthly' && isDark && styles.darkActiveTab
              ]}
              onPress={() => setLeaderboardType('monthly')}
            >
              <Text
                style={[
                  styles.tabText,
                  leaderboardType === 'monthly' && styles.activeTabText,
                  isDark && styles.darkTabText,
                  leaderboardType === 'monthly' && isDark && styles.darkActiveTabText
                ]}
              >
                Aylık
              </Text>
            </TouchableOpacity>
          </View>

          {filteredData.length > 0 ? (
            <FlatList
              data={filteredData}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.userId}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors[colorScheme || 'light'].tint]}
                  tintColor={Colors[colorScheme || 'light'].tint}
                />
              }
              ListHeaderComponent={
                <Text style={[styles.sectionTitle, isDark && styles.darkText]}>
                  {leaderboardType === 'allTime' ? 'Tüm Zamanlar Sıralaması' : 
                   leaderboardType === 'weekly' ? 'Bu Hafta Sıralaması' : 
                   'Aylık Sıralama'}
                </Text>
              }
              ListFooterComponent={renderUserSection}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons
                name="search-off"
                size={50}
                color={isDark ? "#555" : "#ddd"}
              />
              <Text style={[styles.emptyText, isDark && styles.darkText]}>
                Aktivist bulunamadı
              </Text>
              <Text style={[styles.emptySubtext, isDark && styles.darkSubText]}>
                Arama terimlerinizi değiştirmeyi deneyin
              </Text>
            </View>
          )}
        </>
      )}
      
      {renderAchievementModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  header: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  darkSearchBar: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  darkSearchInput: {
    color: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ececec',
    overflow: 'hidden',
  },
  darkTabContainer: {
    backgroundColor: '#2c2c2c',
    borderColor: '#444',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  darkTabButton: {
    backgroundColor: '#2c2c2c',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  darkTabText: {
    color: '#aaa',
  },
  activeTab: {
    backgroundColor: '#f0f7fd',
  },
  darkActiveTab: {
    backgroundColor: Colors.dark.tint + '33', // Adding transparency
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  darkActiveTabText: {
    color: Colors.dark.tint,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  darkUserItem: {
    backgroundColor: '#1e1e1e',
  },
  topThreeItem: {
    borderColor: '#FFD700',
    borderWidth: 1,
    backgroundColor: '#fffdf5',
  },
  darkTopThreeItem: {
    borderColor: '#FFD700',
    backgroundColor: '#302c18',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  badgesContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  badgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  moreBadges: {
    paddingHorizontal: 5,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreBadgesText: {
    fontSize: 10,
    color: '#666',
  },
  medal: {
    width: 8,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  userSection: {
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#aaa',
  },
  darkSuccessText: {
    color: Colors.dark.success,
  },
  shareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  darkShareButton: {
    backgroundColor: '#333',
  },
  userButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  darkModalContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalAchievementIcon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
  },
  modalProgress: {
    fontSize: 14,
    color: '#666',
  },
  modalButton: {
    marginTop: 10,
    width: '50%',
  },
  unlockedAt: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
}); 