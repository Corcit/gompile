# Firestore Database Schema

This document outlines the database schema for the Gompile app.

## Collections

### users
- Document ID: `{userId}` (matches Firebase Auth UID)
  ```
  {
    userId: string,
    nickname: string,
    avatarUrl: string,
    experienceLevel: number,
    createdAt: timestamp,
    lastActive: timestamp,
    protestCount: number,
    profileSettings: {
      notificationsEnabled: boolean,
      darkModeEnabled: boolean,
      language: string
    }
  }
  ```

### attendanceRecords
- Document ID: `{auto-generated}`
  ```
  {
    recordId: string,
    userId: string,
    timestamp: timestamp,
    eventDetails: {
      location: string,
      eventType: string,
      protestId: string
    },
    sharedToSocial: boolean,
    verified: boolean,
    verificationMethod: string  // 'location', 'code', 'admin', 'other'
  }
  ```

### boycottCompanies
- Document ID: `{companyId}`
  ```
  {
    id: string,
    name: string,
    logo: string,
    category: string,
    reason: string,
    startDate: timestamp,
    description: string,
    alternativeCompanies: array,
    link: string
  }
  ```

### announcements
- Document ID: `{announcementId}`
  ```
  {
    id: string,
    title: string,
    content: string,
    publishDate: timestamp,
    author: string,
    category: string,
    tags: array,
    imageUrl: string,
    linkUrl: string,
    pinned: boolean,
    priority: number
  }
  ```

### achievements
- Document ID: `{achievementId}`
  ```
  {
    id: string,
    name: string,
    description: string,
    iconUrl: string,
    criteria: {
      type: string,  // 'attendance', 'streak', 'sharing', etc.
      threshold: number,
      conditions: array
    },
    points: number
  }
  ```

### userAchievements
- Document ID: `{userId}_{achievementId}`
  ```
  {
    userId: string,
    achievementId: string,
    isUnlocked: boolean,
    unlockedAt: timestamp,
    progress: number,
    requirement: {
      type: string,
      count: number
    }
  }
  ```

## Indexes

- attendanceRecords: userId (for querying user attendance history)
- attendanceRecords: userId + timestamp (for sorting user attendance by date)
- announcements: publishDate (for sorting by date)
- boycottCompanies: category (for filtering by category)

## Security Rules

Basic security rules should ensure:
- Users can only read/write their own profile data
- Attendance records can only be created/modified by the user or admins
- Boycott companies and announcements are readable by all but writable only by admins
- Achievement unlocking is controlled by the server 