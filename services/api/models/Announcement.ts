/**
 * Channel model
 * Represents an announcement channel that users can subscribe to
 */
export interface Channel {
  id: string;                    // Unique identifier for the channel
  slug: string;                  // URL-friendly unique identifier
  name: string;                  // Display name of the channel
  description: string;           // Description of the channel
  type: ChannelType;             // Type of channel
  category: ChannelCategory;     // Category of channel
  createdAt: Date;               // Date of creation
  updatedAt: Date;               // Date of last update
  createdBy: string;             // ID of the user who created the channel
  imageUrl?: string;             // URL to an image representing the channel
  subscriberCount: number;       // Number of subscribers
  location?: {                   // Only for location-based channels
    name: string;                // Name of the location
    latitude: number;            // Latitude coordinates
    longitude: number;           // Longitude coordinates
    radius: number;              // Radius in kilometers
  };
  customColor?: string;          // Custom color for the channel
  isVerified: boolean;           // Whether channel is verified (official)
  isDefault: boolean;            // Whether channel is suggested to new users
  isFeatured: boolean;           // Whether channel is featured
  admins: string[];              // User IDs of admins
  moderators: string[];          // User IDs of moderators
  settings: {                    // Channel settings
    allowComments: boolean;      // Whether comments are allowed
    requireApproval: boolean;    // Whether posts require approval
    isPublic: boolean;           // Whether channel is visible in directory
  };
}

/**
 * Channel types
 */
export enum ChannelType {
  PUBLIC = 'public',             // Public channel anyone can access
  OFFICIAL = 'official',         // Official channel from authorities
  PRIVATE = 'private',           // Private/invite-only channel
  LOCATION_BASED = 'location-based' // Geo-fenced channel
}

/**
 * Channel categories
 */
export enum ChannelCategory {
  NEWS = 'news',                 // News channel
  EVENTS = 'events',             // Events channel
  ALERTS = 'alerts',             // Alerts channel
  COMMUNITY = 'community',       // Community channel
  EDUCATIONAL = 'educational',   // Educational channel
  OTHER = 'other'                // Other channel
}

/**
 * Announcement model
 * Represents an announcement posted to a channel
 */
export interface Announcement {
  id: string;                    // Unique identifier
  channelId: string;             // ID of the channel it belongs to
  title: string;                 // Title of the announcement
  content: string;               // Content (text) of the announcement
  createdAt: Date;               // Date of creation
  updatedAt: Date;               // Date of last update
  createdBy: string;             // ID of the user who created the announcement
  isPinned: boolean;             // Whether the announcement is pinned
  isHighlighted: boolean;        // Whether the announcement is highlighted
  expiryDate?: Date;             // Date when the announcement expires
  attachments?: {                // Attachments to the announcement
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
    size?: number;
  }[];
  metadata?: {                   // Additional metadata for the announcement
    urgencyLevel?: 'low' | 'medium' | 'high';
    eventDate?: Date;
    eventLocation?: string;
    targetGroups?: string[];
    categories?: string[];
    tags?: string[];
  };
  stats: {                       // Statistics
    views: number;               // View count
    likes: number;               // Like count
    shares: number;              // Share count
    comments: number;            // Comment count
  };
  allowComments: boolean;        // Whether comments are enabled
}

/**
 * Announcement Comment model
 * Represents a comment on an announcement
 */
export interface AnnouncementComment {
  id: string;                    // Unique identifier
  announcementId: string;        // ID of the announcement
  userId: string;                // ID of the user who created the comment
  content: string;               // Content of the comment
  createdAt: Date;               // Date of creation
  updatedAt: Date;               // Date of last update
  parentId?: string;             // ID of the parent comment (for replies)
  isEdited: boolean;             // Whether the comment has been edited
  isDeleted: boolean;            // Whether the comment has been deleted
  likes: number;                 // Number of likes
  attachments?: {                // Attachments to the comment
    type: 'image' | 'link';
    url: string;
  }[];
}

/**
 * Channel Subscription model
 * Represents a user's subscription to a channel
 */
export interface ChannelSubscription {
  id: string;                    // Unique identifier
  userId: string;                // ID of the subscribed user
  channelId: string;             // ID of the subscribed channel
  subscribedAt: Date;            // Date of subscription
  notificationSettings: {        // Notification settings
    enabled: boolean;            // Whether notifications are enabled
    alertLevel: 'all' | 'highlights' | 'none'; // Level of notifications
    muteUntil?: Date;            // Date until notifications are muted
  };
  isDefault: boolean;            // Whether this was a default subscription
  lastReadTimestamp?: Date;      // Last time user read this channel
}

/**
 * Channel Search Filter
 * Used for filtering channels in search
 */
export interface ChannelSearchFilter {
  type?: ChannelType | ChannelType[];   // Filter by type
  category?: ChannelCategory | ChannelCategory[]; // Filter by category
  query?: string;                       // Search term
  location?: {                          // Location for proximity search
    latitude: number;                   // Latitude
    longitude: number;                  // Longitude
    maxDistance?: number;               // Maximum distance in km
  };
  excludeIds?: string[];                // Channel IDs to exclude
  includeIds?: string[];                // Channel IDs to include
  subscribedOnly?: boolean;             // Only subscribed channels
  managedOnly?: boolean;                // Only managed channels
  isVerified?: boolean;                 // Only verified channels
  isDefault?: boolean;                  // Only default channels
  isFeatured?: boolean;                 // Only featured channels
  sortBy?: 'createdAt' | 'updatedAt' | 'subscriberCount' | 'name' | 'proximity'; // Sort field
  sortOrder?: 'asc' | 'desc';           // Sort order
  limit?: number;                       // Maximum number of results
  offset?: number;                      // Offset for pagination
} 