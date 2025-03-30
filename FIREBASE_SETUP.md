# Firebase Collection Initialization

This guide provides instructions for initializing required Firestore collections for the application. The script creates all necessary collections with sample documents, ensuring full functionality across the app.

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Firebase project with Firestore database enabled

## Setup Instructions

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Generate a Firebase Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Save the JSON file as `firebase-service-account.json` in the root directory of this project

### 3. Verify Existing Collections (Optional)

You can check which collections already exist in your database:

```bash
node verify-collections.js
```

This will show which required collections exist, which are empty, and which are missing.

### 4. Run the Initialization Script

```bash
node init-firestore-collections.js
```

### 5. Verify Collections After Initialization

Run the verification script again to confirm all collections were created successfully:

```bash
node verify-collections.js
```

## What Collections Are Created

The script creates the following collections with sample documents:

1. `boycottCompanies` - Companies being boycotted
2. `achievements` - User achievements
3. `announcements` - System and channel announcements
4. `channels` - Communication channels
5. `channelSubscriptions` - User subscriptions to channels
6. `attendanceRecords` - User attendance records
7. `users` - User profiles and settings

## Verification

After running the script, you can verify the collections were created by:

1. Checking the [Firebase Console](https://console.firebase.google.com/) > Firestore Database
2. Checking for sample documents in each collection
3. Running the verification script to check all collections

## Troubleshooting

### Error: Service Account Key Not Found

If you see an error about loading the service account key:

```
Error initializing Firebase Admin SDK: Error: Cannot find module './firebase-service-account.json'
```

Make sure you've:
1. Generated the service account key from Firebase Console
2. Saved it as `firebase-service-account.json` in the project root directory
3. Verified the file has correct read permissions

### Permission Denied Errors

If you see permission errors, make sure:
1. The service account has the appropriate permissions (Admin role)
2. Your Firebase project has Firestore enabled
3. Your rules allow read/write access for the service account

For additional issues, check the [Firebase Admin SDK documentation](https://firebase.google.com/docs/admin/setup).
