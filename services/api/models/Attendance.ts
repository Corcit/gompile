/**
 * Attendance Record model
 * Represents a record of a user attending a protest
 */
export interface AttendanceRecord {
  recordId: string;         // Unique identifier for the record
  userId: string;           // ID of the user who attended
  timestamp: Date;          // Date and time of attendance
  eventDetails: {
    location?: string;      // Location of the protest (optional)
    eventType?: string;     // Type of event (optional)
    protestId?: string;     // ID of the protest event if applicable
  };
  sharedToSocial: boolean;  // Whether it was shared to social media
  verified: boolean;        // Whether attendance has been verified
  verificationMethod?: 'location' | 'code' | 'admin' | 'other'; // Method used to verify
}

/**
 * Protest Event model
 * Represents a protest event that users can attend
 */
export interface ProtestEvent {
  id: string;                // Unique identifier for the protest
  title: string;             // Title of the protest
  description: string;       // Description of the protest
  date: Date;                // Date of the protest
  startTime?: string;        // Start time (HH:MM)
  endTime?: string;          // End time (HH:MM)
  location: {
    name: string;            // Name of the location
    address?: string;        // Address
    latitude?: number;       // Latitude for mapping
    longitude?: number;      // Longitude for mapping
  };
  organizer: {
    name: string;            // Name of the organizer
    channelId?: string;      // ID of the announcement channel
  };
  category: string;          // Category of the protest
  tags: string[];            // Tags related to the protest
  attendees: number;         // Count of attendees
  isRegistered?: boolean;    // Whether the current user is registered
  verified?: boolean;        // Whether the current user's attendance is verified
  registrationRequired: boolean; // Whether registration is required
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'; // Status of the protest
  imageUrl?: string;         // URL to an image representing the protest
}

/**
 * ProtestRegistration model
 * Represents a user's registration for a protest
 */
export interface ProtestRegistration {
  id: string;                // Unique identifier for the registration
  userId: string;            // ID of the user registering
  protestId: string;         // ID of the protest event
  registrationDate: Date;    // Date of registration
  status: 'registered' | 'attended' | 'cancelled' | 'no-show'; // Status of registration
  notificationsSent: {       // Track notifications sent to the user
    reminder24h: boolean;    // 24 hour reminder sent
    reminder2h: boolean;     // 2 hour reminder sent
    locationPrompt: boolean; // Location verification prompt sent
  };
}

/**
 * Attendance Verification options
 * Represents options for verifying attendance
 */
export enum VerificationMethod {
  LOCATION = 'location',     // GPS location verification
  CODE = 'code',             // Verification code
  ADMIN = 'admin',           // Admin verification
  OTHER = 'other'            // Other verification methods
}

/**
 * Attendance Verification Request
 * Represents a request to verify attendance
 */
export interface VerificationRequest {
  protestId: string;               // ID of the protest
  userId: string;                  // ID of the user
  method: VerificationMethod;      // Method of verification
  data?: {                         // Additional verification data
    location?: {                   // Location data if method is LOCATION
      latitude: number;
      longitude: number;
      accuracy: number;
    };
    code?: string;                 // Verification code if method is CODE
  };
}

/**
 * Attendance Stats
 * Represents statistics about a user's attendance
 */
export interface AttendanceStats {
  totalAttended: number;            // Total protests attended
  verified: number;                 // Number of verified attendances
  unverified: number;               // Number of unverified attendances
  streakCurrent: number;            // Current attendance streak
  streakLongest: number;            // Longest attendance streak
  lastAttendance?: Date;            // Date of last attendance
  thisWeek: number;                 // Attendances this week
  thisMonth: number;                // Attendances this month
  thisYear: number;                 // Attendances this year
  byCategory: {                     // Attendances by category
    [category: string]: number;
  };
} 