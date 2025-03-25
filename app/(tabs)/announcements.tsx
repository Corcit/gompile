import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Switch, 
  ActivityIndicator,
  RefreshControl,
  Image,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import RoundedCard from '../../components/ui/RoundedCard';
import RoundedButton from '../../components/ui/RoundedButton';
import { announcementService } from '../../services/api';
import { 
  Announcement, 
  Channel, 
  ChannelType, 
  ChannelCategory
} from '../../services/api/models/Announcement';

// Extended interfaces for UI state
interface UIChannel extends Channel {
  isSubscribed: boolean;
}

interface UIAnnouncement extends Announcement {
  isRead: boolean;
  channelName?: string;
}

export default function AnnouncementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'feed' | 'channels'>('feed');
  const [channels, setChannels] = useState<UIChannel[]>([]);
  const [announcements, setAnnouncements] = useState<UIAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);

  // Load channels and announcements
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get user's subscribed channels
      const subscribedChannels = await announcementService.getSubscribedChannels();
      
      // Get available channels for discovery
      const { channels: availableChannels } = await announcementService.searchChannels({
        sortBy: 'subscriberCount',
        sortOrder: 'desc',
        limit: 20
      });
      
      // Combine and mark subscribed channels
      const subscriptionsMap = new Map(
        subscribedChannels.map((channel: Channel) => [channel.id, true])
      );
      
      const allChannels = [
        ...subscribedChannels,
        ...availableChannels.filter((channel: Channel) => !subscriptionsMap.has(channel.id))
      ].map((channel: Channel) => ({
        ...channel,
        isSubscribed: subscriptionsMap.has(channel.id)
      }));
      
      setChannels(allChannels);
      
      // Get announcements
      const { announcements } = await announcementService.getAnnouncements(50);
      
      // Create a channels map for quick lookup
      const channelsMap = new Map(
        allChannels.map(channel => [channel.id, channel])
      );
      
      // Add channel name and read status to announcements
      const enhancedAnnouncements = announcements.map((announcement: Announcement) => ({
        ...announcement,
        channelName: channelsMap.get(announcement.channelId)?.name || 'Unknown Channel',
        isRead: false, // We'll track read status locally for now
      }));
      
      setAnnouncements(enhancedAnnouncements);
      
    } catch (error) {
      console.error('Error loading announcements data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
  }, [loadData]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Toggle channel subscription
  const toggleSubscription = async (channelId: string) => {
    try {
      const channel = channels.find(c => c.id === channelId);
      if (!channel) return;
      
      setChannels(prevChannels =>
        prevChannels.map(ch =>
          ch.id === channelId
            ? { ...ch, isSubscribed: !ch.isSubscribed }
            : ch
        )
      );
      
      if (channel.isSubscribed) {
        // Unsubscribe
        await announcementService.unsubscribeFromChannel(channelId);
      } else {
        // Subscribe
        await announcementService.subscribeToChannel(channelId);
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      // Revert UI change if API call fails
      setChannels(prevChannels =>
        prevChannels.map(ch =>
          ch.id === channelId
            ? { ...ch, isSubscribed: !ch.isSubscribed }
            : ch
        )
      );
    }
  };

  // Mark announcement as read
  const markAsRead = (announcementId: string) => {
    setAnnouncements(prevAnnouncements =>
      prevAnnouncements.map(announcement =>
        announcement.id === announcementId
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
    
    // Toggle expanded state
    setExpandedAnnouncement(
      expandedAnnouncement === announcementId ? null : announcementId
    );
  };

  // Share announcement
  const shareAnnouncement = async (announcementId: string) => {
    try {
      await announcementService.shareAnnouncement(announcementId, 'general');
      // Update share count in UI
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement.id === announcementId
            ? { 
                ...announcement, 
                stats: { 
                  ...announcement.stats, 
                  shares: announcement.stats.shares + 1 
                } 
              }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error sharing announcement:', error);
    }
  };

  // Like announcement
  const likeAnnouncement = async (announcementId: string) => {
    try {
      const response = await announcementService.likeAnnouncement(announcementId);
      // Update like count in UI
      setAnnouncements(prevAnnouncements =>
        prevAnnouncements.map(announcement =>
          announcement.id === announcementId
            ? { 
                ...announcement, 
                stats: { 
                  ...announcement.stats, 
                  likes: response.likes 
                } 
              }
            : announcement
        )
      );
    } catch (error) {
      console.error('Error liking announcement:', error);
    }
  };

  // Get urgency level from metadata
  const getUrgencyLevel = (announcement: UIAnnouncement): number => {
    const urgencyMap = {
      'high': 3,
      'medium': 2,
      'low': 1
    };
    return urgencyMap[announcement.metadata?.urgencyLevel as keyof typeof urgencyMap] || 0;
  };

  // Format date for display
  const formatDate = (dateString: Date): string => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Render channel item
  const renderChannelItem = ({ item }: { item: UIChannel }) => (
    <RoundedCard 
      style={[
        styles.channelItem, 
        isDark && styles.darkChannelItem,
        item.isVerified && styles.verifiedChannel,
        item.isVerified && isDark && styles.darkVerifiedChannel,
      ]}
    >
      <View style={styles.channelInfo}>
        <View style={styles.channelHeader}>
          <Text style={[styles.channelName, isDark && styles.darkText]}>
            {item.name}
            {item.isVerified && (
              <MaterialIcons name="verified" size={16} color={isDark ? Colors.dark.tint : Colors.light.tint} style={styles.verifiedIcon} />
            )}
          </Text>
          <View style={[
            styles.channelTypeTag, 
            isDark && styles.darkChannelTypeTag
          ]}>
            <Text style={[styles.channelTypeText, isDark && styles.darkChannelTypeText]}>
              {item.type === 'official' ? 'Resmi' : 
               item.type === 'community' ? 'Topluluk' : 
               item.type === 'news' ? 'Haber' : 'Diğer'}
            </Text>
          </View>
        </View>
        <Text style={[styles.channelDescription, isDark && styles.darkSubText]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.channelStats}>
          <Text style={[styles.channelStat, isDark && styles.darkSubText]}>
            {item.subscriberCount} Takipçi
          </Text>
          <Text style={[styles.channelStat, isDark && styles.darkSubText]}>
            {item.announcementCount} Duyuru
          </Text>
        </View>
      </View>
      <Switch
        value={item.isSubscribed}
        onValueChange={() => toggleSubscription(item.id)}
        trackColor={{ false: '#767577', true: Colors.dark.tint }}
        thumbColor={item.isSubscribed ? Colors.dark.accent : '#f4f3f4'}
      />
    </RoundedCard>
  );

  // Render announcement item
  const renderAnnouncementItem = ({ item }: { item: UIAnnouncement }) => {
    const isExpanded = expandedAnnouncement === item.id;
    const urgencyLevel = getUrgencyLevel(item);
    
    return (
      <RoundedCard 
        style={[
          styles.announcementItem,
          isDark && styles.darkAnnouncementItem,
          !item.isRead && styles.unreadAnnouncement,
          !item.isRead && isDark && styles.darkUnreadAnnouncement,
          urgencyLevel > 0 && styles.urgentAnnouncement,
          urgencyLevel > 0 && isDark && styles.darkUrgentAnnouncement,
        ]}
      >
        <TouchableOpacity 
          style={styles.announcementContent}
          onPress={() => markAsRead(item.id)}
        >
          <View style={styles.announcementHeader}>
            <View style={styles.announcementMeta}>
              <Text style={[styles.channelName, isDark && styles.darkText]}>
                {item.channelName}
              </Text>
              <Text style={[styles.timestamp, isDark && styles.darkSubText]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            {urgencyLevel > 0 && (
              <View style={[
                styles.urgencyTag,
                isDark && styles.darkUrgencyTag,
                { backgroundColor: urgencyLevel === 3 ? '#dc3545' : urgencyLevel === 2 ? '#ffc107' : '#28a745' }
              ]}>
                <Text style={styles.urgencyText}>
                  {urgencyLevel === 3 ? 'Acil' : urgencyLevel === 2 ? 'Önemli' : 'Bilgi'}
                </Text>
              </View>
            )}
          </View>
          
          <Text 
            style={[
              styles.announcementTitle,
              isDark && styles.darkText,
              !item.isRead && styles.unreadText
            ]}
            numberOfLines={isExpanded ? undefined : 2}
          >
            {item.title}
          </Text>
          
          {isExpanded && (
            <Text style={[styles.announcementBody, isDark && styles.darkText]}>
              {item.content}
            </Text>
          )}
          
          <View style={styles.announcementActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => likeAnnouncement(item.id)}
            >
              <Ionicons 
                name={item.stats.isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={item.stats.isLiked ? Colors.dark.tint : (isDark ? Colors.dark.text : Colors.light.text)} 
              />
              <Text style={[styles.actionText, isDark && styles.darkSubText]}>
                {item.stats.likes}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => shareAnnouncement(item.id)}
            >
              <Ionicons 
                name="share-social-outline" 
                size={20} 
                color={isDark ? Colors.dark.text : Colors.light.text} 
              />
              <Text style={[styles.actionText, isDark && styles.darkSubText]}>
                {item.stats.shares}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </RoundedCard>
    );
  };

  // Render empty state for announcements
  const renderEmptyAnnouncements = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="notifications-none" size={48} color={isDark ? Colors.dark.text : Colors.light.text} />
      <Text style={[styles.emptyTitle, isDark && styles.darkText]}>
        Henüz Duyuru Yok
      </Text>
      <Text style={[styles.emptySubtitle, isDark && styles.darkText]}>
        Takip ettiğiniz kanallardan duyurular burada görünecek
      </Text>
    </View>
  );

  // Render empty state for channels
  const renderEmptyChannels = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="campaign" size={48} color={isDark ? Colors.dark.text : Colors.light.text} />
      <Text style={[styles.emptyTitle, isDark && styles.darkText]}>
        Kanal Bulunamadı
      </Text>
      <Text style={[styles.emptySubtitle, isDark && styles.darkText]}>
        Şu anda takip edilebilecek kanal bulunmuyor
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme || 'light'].tint} />
          <Text style={[styles.loadingText, isDark && styles.darkText]}>
            Loading announcements...
          </Text>
        </View>
      ) : (
        <>
          <View style={[styles.header, isDark && styles.darkHeader]}>
            <Text style={[styles.title, isDark && styles.darkText]}>
              Announcements
            </Text>
            
            <View style={[styles.tabsContainer, isDark && styles.darkTabsContainer]}>
              <TouchableOpacity
                style={[
                  styles.tab, 
                  activeTab === 'feed' && styles.activeTab,
                  isDark && styles.darkTab,
                  activeTab === 'feed' && isDark && styles.darkActiveTab
                ]}
                onPress={() => setActiveTab('feed')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'feed' && styles.activeTabText,
                  isDark && styles.darkTabText,
                  activeTab === 'feed' && isDark && styles.darkActiveTabText
                ]}>
                  Feed
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tab, 
                  activeTab === 'channels' && styles.activeTab,
                  isDark && styles.darkTab,
                  activeTab === 'channels' && isDark && styles.darkActiveTab
                ]}
                onPress={() => setActiveTab('channels')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'channels' && styles.activeTabText,
                  isDark && styles.darkTabText,
                  activeTab === 'channels' && isDark && styles.darkActiveTabText
                ]}>
                  Channels
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {activeTab === 'feed' ? (
            <FlatList
              data={announcements}
              renderItem={renderAnnouncementItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors[colorScheme || 'light'].tint]}
                  tintColor={Colors[colorScheme || 'light'].tint}
                />
              }
              ListEmptyComponent={renderEmptyAnnouncements}
            />
          ) : (
            <FlatList
              data={channels}
              renderItem={renderChannelItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors[colorScheme || 'light'].tint]}
                  tintColor={Colors[colorScheme || 'light'].tint}
                />
              }
              ListEmptyComponent={renderEmptyChannels}
            />
          )}
        </>
      )}
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
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  header: {
    padding: 20,
  },
  darkHeader: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSubText: {
    color: '#aaa',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
  },
  darkTabsContainer: {
    backgroundColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  darkTab: {
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  darkActiveTab: {
    backgroundColor: '#1e1e1e',
  },
  tabText: {
    fontWeight: '500',
    color: '#757575',
  },
  darkTabText: {
    color: '#aaa',
  },
  activeTabText: {
    color: '#0a7ea4',
  },
  darkActiveTabText: {
    color: Colors.dark.tint,
  },
  listContent: {
    padding: 12,
    paddingBottom: 30,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
  },
  darkChannelItem: {
    backgroundColor: '#1e1e1e',
  },
  verifiedChannel: {
    borderColor: Colors.light.tint,
    borderWidth: 1,
  },
  darkVerifiedChannel: {
    borderColor: Colors.dark.tint,
    borderWidth: 1,
  },
  channelInfo: {
    flex: 1,
    marginRight: 10,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  channelTypeTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  darkChannelTypeTag: {
    backgroundColor: '#333',
  },
  channelTypeText: {
    fontSize: 10,
    color: '#757575',
    fontWeight: '500',
  },
  darkChannelTypeText: {
    color: '#aaa',
  },
  channelDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  channelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelStat: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  announcementItem: {
    padding: 15,
    marginBottom: 10,
  },
  darkAnnouncementItem: {
    backgroundColor: '#1e1e1e',
  },
  unreadAnnouncement: {
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  darkUnreadAnnouncement: {
    borderLeftColor: Colors.dark.tint,
  },
  urgentAnnouncement: {
    backgroundColor: '#FFF3F2',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  darkUrgentAnnouncement: {
    backgroundColor: '#301A19',
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  announcementContent: {
    flex: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  urgencyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  darkUrgencyTag: {
    backgroundColor: '#333',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  announcementBody: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  announcementActions: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  readMoreText: {
    fontSize: 12,
    color: '#0a7ea4',
    marginTop: 8,
    fontWeight: '500',
  },
  darkReadMoreText: {
    color: Colors.dark.tint,
  },
  unreadText: {
    fontWeight: '600',
  },
});