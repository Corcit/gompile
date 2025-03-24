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
      const channelsResponse = await announcementService.getSubscribedChannels();
      
      // Get available channels for discovery
      const availableChannelsResponse = await announcementService.searchChannels({
        sortBy: 'subscriberCount',
        sortOrder: 'desc',
        limit: 20
      });
      
      // Combine and mark subscribed channels
      const subscriptionsMap = new Map(
        channelsResponse.channels.map(channel => [channel.id, true])
      );
      
      const allChannels = [
        ...channelsResponse.channels,
        ...availableChannelsResponse.channels.filter(channel => !subscriptionsMap.has(channel.id))
      ].map(channel => ({
        ...channel,
        isSubscribed: subscriptionsMap.has(channel.id)
      }));
      
      setChannels(allChannels);
      
      // Get announcements
      const announcementsResponse = await announcementService.getAnnouncements(50);
      
      // Create a channels map for quick lookup
      const channelsMap = new Map(
        allChannels.map(channel => [channel.id, channel])
      );
      
      // Add channel name and read status to announcements
      const enhancedAnnouncements = announcementsResponse.announcements.map(announcement => ({
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
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.channelDescription, isDark && styles.darkSubText]}>
          {item.description}
        </Text>
        <Text style={[styles.subscriberCount, isDark && styles.darkSubText]}>
          {item.subscriberCount.toLocaleString()} subscribers
        </Text>
      </View>
      <Switch
        value={item.isSubscribed}
        onValueChange={() => toggleSubscription(item.id)}
        trackColor={{ false: isDark ? '#444' : '#767577', true: Colors[colorScheme || 'light'].tint }}
        thumbColor={isDark ? '#f4f3f4' : '#f4f3f4'}
      />
    </RoundedCard>
  );

  // Render announcement item
  const renderAnnouncementItem = ({ item }: { item: UIAnnouncement }) => {
    const urgencyLevel = getUrgencyLevel(item);
    const isExpanded = expandedAnnouncement === item.id;
    
    return (
      <RoundedCard 
        style={[
          styles.announcementItem,
          isDark && styles.darkAnnouncementItem,
          !item.isRead && styles.unreadAnnouncement,
          !item.isRead && isDark && styles.darkUnreadAnnouncement,
          urgencyLevel === 3 && styles.urgentAnnouncement,
          urgencyLevel === 3 && isDark && styles.darkUrgentAnnouncement,
        ]}
      >
        <TouchableOpacity 
          style={styles.announcementContent}
          onPress={() => markAsRead(item.id)}
        >
          {!item.isRead && <View style={[styles.unreadDot, isDark && styles.darkUnreadDot]} />}
          
          <Text style={[styles.announcementMeta, isDark && styles.darkSubText]}>
            <Text style={[styles.channelLabel, isDark && styles.darkChannelLabel]}>
              {item.channelName}
            </Text> • {formatDate(item.createdAt)}
          </Text>
          
          <Text style={[styles.announcementTitle, isDark && styles.darkText]}>
            {urgencyLevel === 3 && (
              <Ionicons 
                name="warning" 
                size={16} 
                color={isDark ? "#ff6b6b" : "#ff3b30"} 
                style={styles.warningIcon} 
              />
            )} 
            {item.title}
          </Text>
          
          <Text 
            style={[styles.announcementText, isDark && styles.darkSubText]} 
            numberOfLines={isExpanded ? undefined : 3}
          >
            {item.content}
          </Text>
          
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachments}>
              {item.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachment}>
                  <MaterialIcons 
                    name={
                      attachment.type === 'image' ? 'image' : 
                      attachment.type === 'video' ? 'videocam' : 
                      attachment.type === 'document' ? 'description' : 'link'
                    } 
                    size={16} 
                    color={isDark ? "#aaa" : "#757575"} 
                  />
                  <Text style={[styles.attachmentText, isDark && styles.darkSubText]}>
                    {attachment.title || attachment.url.split('/').pop()}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {isExpanded && (
            <View style={styles.announcementActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => likeAnnouncement(item.id)}
              >
                <Ionicons name="heart-outline" size={18} color={isDark ? "#aaa" : "#757575"} />
                <Text style={[styles.actionText, isDark && styles.darkSubText]}>
                  Like ({item.stats.likes})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => shareAnnouncement(item.id)}
              >
                <Ionicons name="share-outline" size={18} color={isDark ? "#aaa" : "#757575"} />
                <Text style={[styles.actionText, isDark && styles.darkSubText]}>
                  Share ({item.stats.shares})
                </Text>
              </TouchableOpacity>
              
              {item.allowComments && (
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color={isDark ? "#aaa" : "#757575"} />
                  <Text style={[styles.actionText, isDark && styles.darkSubText]}>
                    Comment ({item.stats.comments})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <Text style={[styles.readMoreText, isDark && styles.darkReadMoreText]}>
            {isExpanded ? 'Show less' : 'Read more...'}
          </Text>
        </TouchableOpacity>
      </RoundedCard>
    );
  };

  // Render empty state for announcements
  const renderEmptyAnnouncements = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={isDark ? "#555" : "#ddd"} />
      <Text style={[styles.emptyTitle, isDark && styles.darkText]}>No announcements</Text>
      <Text style={[styles.emptySubtitle, isDark && styles.darkSubText]}>
        {channels.filter(c => c.isSubscribed).length === 0 
          ? 'Subscribe to channels to get announcements' 
          : 'Check back later for new announcements'}
      </Text>
      {channels.filter(c => c.isSubscribed).length === 0 && (
        <RoundedButton
          variant="primary"
          size="medium"
          title="Browse Channels"
          onPress={() => setActiveTab('channels')}
          style={styles.browseButton}
        />
      )}
    </View>
  );

  // Render empty state for channels
  const renderEmptyChannels = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="megaphone-outline" size={64} color={isDark ? "#555" : "#ddd"} />
      <Text style={[styles.emptyTitle, isDark && styles.darkText]}>No channels available</Text>
      <Text style={[styles.emptySubtitle, isDark && styles.darkSubText]}>
        Check back later for new channels
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
  subscriberCount: {
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
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a7ea4',
  },
  darkUnreadDot: {
    backgroundColor: Colors.dark.tint,
  },
  announcementContent: {
    flex: 1,
  },
  announcementMeta: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 5,
  },
  channelLabel: {
    fontWeight: '600',
    color: '#757575',
  },
  darkChannelLabel: {
    color: '#bbb',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  warningIcon: {
    marginRight: 5,
  },
  announcementText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  attachments: {
    marginTop: 10,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  attachmentText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#757575',
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
  readMoreText: {
    fontSize: 12,
    color: '#0a7ea4',
    marginTop: 8,
    fontWeight: '500',
  },
  darkReadMoreText: {
    color: Colors.dark.tint,
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
  browseButton: {
    marginTop: 10,
  },
});