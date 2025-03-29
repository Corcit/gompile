# TestFlight Deployment Guide

This document provides detailed instructions for deploying the Gompile app to TestFlight with working Firebase integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Apple Developer Account Setup](#apple-developer-account-setup)
3. [App Store Connect Configuration](#app-store-connect-configuration)
4. [Firebase Testing Before Deployment](#firebase-testing-before-deployment)
5. [EAS Configuration](#eas-configuration)
6. [Building and Submitting](#building-and-submitting)
7. [TestFlight Testing](#testflight-testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the deployment process, ensure you have:

- Node.js v14 or newer
- npm or yarn
- Xcode (latest version)
- A paid Apple Developer account ($99/year)
- Firebase project properly set up
- Access to the App Store Connect portal

## Apple Developer Account Setup

1. **Enroll in the Apple Developer Program**
   - Go to [developer.apple.com](https://developer.apple.com)
   - Click "Account" and sign in with your Apple ID
   - If you're not enrolled, follow the enrollment process
   - Pay the annual fee ($99 for individuals, $299 for organizations)

2. **Create Certificates**
   - In your Developer account, go to "Certificates, IDs & Profiles"
   - Create an App Store Distribution certificate if you don't have one
   - Download and install the certificate on your Mac

3. **Register App ID**
   - In the same section, go to "Identifiers" and register a new App ID
   - Use the bundle identifier from your app.json (com.coruh.gompile)
   - Enable necessary capabilities (Push Notifications, Associated Domains)

4. **Create Provisioning Profile**
   - Go to "Profiles" and create a new App Store Distribution Provisioning Profile
   - Select the App ID you just created
   - Select your Distribution Certificate
   - Download and install the provisioning profile

## App Store Connect Configuration

1. **Create New App**
   - Log in to [App Store Connect](https://appstoreconnect.apple.com)
   - Go to "My Apps" and click the "+" button to create a new app
   - Fill in required details:
     - Platform: iOS
     - Name: Gompile
     - Primary language: English
     - Bundle ID: com.coruh.gompile (select from dropdown)
     - SKU: gompile-2023 (or any unique identifier)
     - User Access: Full Access

2. **App Information**
   - Fill in the app's metadata:
     - Privacy Policy URL
     - Support URL
     - Marketing URL (optional)
     - App Store screenshots (can be added later)
     - App Store icon (1024x1024 px)
     - Description, keywords, etc.

3. **Age Rating**
   - Complete the age rating questionnaire

4. **App Store API Key (for EAS)**
   - Go to Users and Access > Keys
   - Create a new App Store Connect API Key
   - Note the Key ID, Issuer ID, and download the .p8 file (keep it secure)

## Firebase Testing Before Deployment

Test your Firebase integration to ensure it works correctly before deploying:

1. **Auth Testing**
   ```javascript
   // In your app, run this code to test Firebase Auth
   import { auth } from './services/firebase';
   import { signInAnonymously } from 'firebase/auth';
   
   signInAnonymously(auth)
     .then(() => {
       console.log('Auth works!');
     })
     .catch(error => {
       console.error('Auth error:', error);
     });
   ```

2. **Firestore Testing**
   ```javascript
   // Test Firestore connection
   import { firestore } from './services/firebase';
   import { collection, addDoc, getDocs } from 'firebase/firestore';
   
   // Write test
   async function testFirestore() {
     try {
       const docRef = await addDoc(collection(firestore, "test_collection"), {
         message: "Test message",
         timestamp: new Date()
       });
       console.log("Firestore write successful with ID:", docRef.id);
       
       // Read test
       const querySnapshot = await getDocs(collection(firestore, "test_collection"));
       console.log("Firestore read successful, documents:");
       querySnapshot.forEach(doc => console.log(doc.id, " => ", doc.data()));
       
       return true;
     } catch (e) {
       console.error("Firestore error:", e);
       return false;
     }
   }
   
   testFirestore();
   ```

3. **Firebase Storage Testing**
   ```javascript
   // Test Firebase Storage
   import { storage } from './services/firebase';
   import { ref, uploadString, getDownloadURL } from 'firebase/storage';
   
   async function testStorage() {
     const testRef = ref(storage, 'test/test-file.txt');
     try {
       // Upload test
       await uploadString(testRef, 'Hello, Firebase Storage!');
       console.log('Storage upload successful');
       
       // Download test
       const url = await getDownloadURL(testRef);
       console.log('Storage download URL:', url);
       
       return true;
     } catch (e) {
       console.error('Storage error:', e);
       return false;
     }
   }
   
   testStorage();
   ```

## EAS Configuration

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to EAS**
   ```bash
   eas login
   ```

3. **Update eas.json**
   - Edit the `eas.json` file with your Apple credentials:

   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "1234567890", // From App Store Connect
         "appleTeamId": "ABCDEF1234" // From Developer Account
       }
     },
     "test": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "1234567890", 
         "appleTeamId": "ABCDEF1234"
       }
     }
   }
   ```

## Building and Submitting

1. **Use the Automated Script**
   ```bash
   npm run deploy:testflight
   ```

   This script will:
   - Check that EAS CLI is installed
   - Verify you're logged in
   - Update dependencies
   - Check configuration
   - Build the app for TestFlight
   - Optionally submit to TestFlight

2. **Manual Process**
   If you prefer to do it manually:

   ```bash
   # Build for TestFlight
   eas build --platform ios --profile test

   # After build completes, submit to TestFlight
   eas submit -p ios --profile test
   ```

3. **Build Process**
   - EAS will start a build on Expo's servers
   - You'll see a URL to monitor the build progress
   - This typically takes 10-15 minutes
   - When complete, you'll get a build ID

## TestFlight Testing

1. **App Review Processing**
   - After submission, Apple will process your build (15-30 minutes)
   - You'll need to provide test information in App Store Connect
   - Answer the export compliance questions

2. **TestFlight Internal Testing**
   - In App Store Connect, go to your app > TestFlight
   - Your build should appear under "iOS Builds"
   - Enable it for internal testing (available to your team)

3. **External Testing (Optional)**
   - Create a group for external testers
   - Add email addresses for testers
   - Select the build to test
   - Submit for review (can take 1-2 days)

4. **Testing Firebase Integration**
   - Once testers have the app, use the test functions from step 4
   - Verify all Firebase services work correctly in the TestFlight build
   - Check console logs for any Firebase-related errors

## Troubleshooting

### Common Issues

1. **Build Fails**
   - **Problem**: EAS build fails with errors
   - **Solution**: 
     - Check error logs carefully
     - Ensure all native dependencies are compatible
     - Update Expo SDK if necessary
     - Try `eas build:clean` to clear cache

2. **Firebase Connection Issues**
   - **Problem**: App can't connect to Firebase
   - **Solution**:
     - Check Firebase console for correct configuration
     - Verify bundle ID matches in Firebase and app config
     - Ensure network permissions are properly set
     - Check for firewall or network restrictions

3. **Rejected by Apple**
   - **Problem**: Apple rejects your TestFlight build
   - **Solution**:
     - Address specific issues mentioned in rejection
     - Common reasons: metadata issues, privacy concerns, crashes
     - Fix and resubmit

4. **Certificate/Provisioning Issues**
   - **Problem**: Certificate or provisioning profile errors
   - **Solution**:
     - Regenerate certificates in Apple Developer Portal
     - Update provisioning profiles
     - Let EAS handle it automatically by setting "credentialsSource": "remote" in your profile

### Getting Help

If you encounter issues not covered here:

1. Check Expo and EAS documentation:
   - [Expo Docs](https://docs.expo.dev/)
   - [EAS Build Docs](https://docs.expo.dev/build/introduction/)

2. Firebase documentation:
   - [Firebase Docs](https://firebase.google.com/docs)
   - [React Native Firebase](https://rnfirebase.io/)

3. Apple Developer Forums:
   - [Developer Forums](https://developer.apple.com/forums/) 