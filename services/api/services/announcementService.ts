import { 
  Announcement, 
  Channel, 
  ChannelType, 
  ChannelCategory, 
  AnnouncementComment, 
  ChannelSubscription,
  ChannelSearchFilter
} from '../models/Announcement';

/**
 * Service for handling announcement-related operations
 */
export default class AnnouncementService {
  private apiClient: any;
  
  constructor(apiClient: any) {
    this.apiClient = apiClient;
  }

  /**
   * Gets all announcements from subscribed channels
   * @param limit Number of announcements to return
   * @param offset Offset for pagination
   * @returns List of announcements
   */
  async getAnnouncements(limit = 10, offset = 0): Promise<{announcements: Announcement[]; total: number}> {
    return this.apiClient.get('/announcements', { 
      params: { limit, offset }
    });
  }

  /**
   * Gets announcements from a specific channel
   * @param channelId Channel ID
   * @param limit Number of announcements to return
   * @param offset Offset for pagination
   * @returns List of channel announcements
   */
  async getChannelAnnouncements(channelId: string, limit = 10, offset = 0): Promise<{announcements: Announcement[]; total: number}> {
    return this.apiClient.get(`/channels/${channelId}/announcements`, {
      params: { limit, offset }
    });
  }

  /**
   * Gets a specific announcement by ID
   * @param announcementId Announcement ID
   * @returns Announcement details
   */
  async getAnnouncement(announcementId: string): Promise<Announcement> {
    return this.apiClient.get(`/announcements/${announcementId}`);
  }

  /**
   * Likes an announcement
   * @param announcementId Announcement ID
   * @returns Updated like count
   */
  async likeAnnouncement(announcementId: string): Promise<{likes: number}> {
    return this.apiClient.post(`/announcements/${announcementId}/like`, {});
  }

  /**
   * Shares an announcement
   * @param announcementId Announcement ID
   * @param platform Platform to share to ('twitter', 'facebook', etc.)
   * @returns Updated share count and share URL
   */
  async shareAnnouncement(announcementId: string, platform: string): Promise<{shares: number; url?: string}> {
    return this.apiClient.post(`/announcements/${announcementId}/share`, { platform });
  }

  /**
   * Gets comments for an announcement
   * @param announcementId Announcement ID
   * @param limit Number of comments to return
   * @param offset Offset for pagination
   * @returns List of comments
   */
  async getComments(announcementId: string, limit = 10, offset = 0): Promise<{comments: AnnouncementComment[]; total: number}> {
    return this.apiClient.get(`/announcements/${announcementId}/comments`, {
      params: { limit, offset }
    });
  }

  /**
   * Adds a comment to an announcement
   * @param announcementId Announcement ID
   * @param content Comment content
   * @param parentId Optional parent comment ID for replies
   * @returns Created comment
   */
  async addComment(announcementId: string, content: string, parentId?: string): Promise<AnnouncementComment> {
    return this.apiClient.post(`/announcements/${announcementId}/comments`, {
      content,
      parentId
    });
  }

  /**
   * Gets all available channels
   * @param limit Number of channels to return
   * @param offset Offset for pagination
   * @returns List of channels
   */
  async getChannels(limit = 20, offset = 0): Promise<{channels: Channel[]; total: number}> {
    return this.apiClient.get('/channels', {
      params: { limit, offset }
    });
  }

  /**
   * Gets a specific channel by ID
   * @param channelId Channel ID
   * @returns Channel details
   */
  async getChannel(channelId: string): Promise<Channel> {
    return this.apiClient.get(`/channels/${channelId}`);
  }

  /**
   * Gets a specific channel by slug
   * @param slug Channel slug
   * @returns Channel details
   */
  async getChannelBySlug(slug: string): Promise<Channel> {
    return this.apiClient.get(`/channels/slug/${slug}`);
  }

  /**
   * Gets channels near a location
   * @param latitude Latitude
   * @param longitude Longitude
   * @param radius Radius in kilometers
   * @param limit Number of channels to return
   * @returns List of nearby channels
   */
  async getNearbyChannels(latitude: number, longitude: number, radius = 10, limit = 10): Promise<Channel[]> {
    return this.apiClient.get('/channels/nearby', {
      params: { latitude, longitude, radius, limit }
    });
  }

  /**
   * Gets default suggested channels for new users
   * @returns List of default channels
   */
  async getDefaultChannels(): Promise<Channel[]> {
    return this.apiClient.get('/channels/default');
  }

  /**
   * Searches for channels
   * @param filter Search filter options
   * @returns Search results
   */
  async searchChannels(filter: ChannelSearchFilter): Promise<{channels: Channel[]; total: number}> {
    return this.apiClient.get('/channels/search', {
      params: filter
    });
  }

  /**
   * Gets all channels the user is subscribed to
   * @returns List of subscribed channels
   */
  async getSubscribedChannels(): Promise<Channel[]> {
    return this.apiClient.get('/channels/subscribed');
  }

  /**
   * Subscribes to a channel
   * @param channelId Channel ID
   * @param settings Optional notification settings
   * @returns Subscription details
   */
  async subscribeToChannel(
    channelId: string, 
    settings?: {
      enabled: boolean;
      alertLevel: 'all' | 'highlights' | 'none';
    }
  ): Promise<ChannelSubscription> {
    return this.apiClient.post(`/channels/${channelId}/subscribe`, { settings });
  }

  /**
   * Unsubscribes from a channel
   * @param channelId Channel ID
   * @returns Success status
   */
  async unsubscribeFromChannel(channelId: string): Promise<{success: boolean}> {
    return this.apiClient.post(`/channels/${channelId}/unsubscribe`, {});
  }

  /**
   * Updates subscription notification settings
   * @param channelId Channel ID
   * @param settings New notification settings
   * @returns Updated subscription
   */
  async updateSubscriptionSettings(
    channelId: string,
    settings: {
      enabled: boolean;
      alertLevel: 'all' | 'highlights' | 'none';
      muteUntil?: Date;
    }
  ): Promise<ChannelSubscription> {
    return this.apiClient.put(`/channels/${channelId}/subscription/settings`, settings);
  }

  /**
   * Gets all highlighted announcements
   * @param limit Number of announcements to return
   * @returns List of highlighted announcements
   */
  async getHighlightedAnnouncements(limit = 5): Promise<Announcement[]> {
    return this.apiClient.get('/announcements/highlighted', {
      params: { limit }
    });
  }

  /**
   * Searches for announcements
   * @param query Search query
   * @param filters Additional filters
   * @returns Search results
   */
  async searchAnnouncements(query: string, filters?: {
    channelIds?: string[];
    startDate?: Date;
    endDate?: Date;
    categories?: string[];
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{announcements: Announcement[]; total: number}> {
    return this.apiClient.get('/announcements/search', {
      params: {
        query,
        ...filters
      }
    });
  }
} 