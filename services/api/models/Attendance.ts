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