# Gompile

A mobile application built with React Native and Expo for tracking and managing protest attendance and activist engagement.

## Features

- Home screen with attendance tracking and statistics
  - Interactive location buttons for accessing "Gözaltı Kremi" and "Tamirat" locations
  - Real-time attendance statistics
  - Calendar view for tracking participation
- Leaderboard system for activist engagement
- News and announcements
- Achievement system
- User profiles and settings
  - Customizable profile with avatar and nickname
  - Privacy controls for leaderboard visibility
  - Notification preferences
  - Dark mode support
- "Boykot" (Boycott List) - Search and filter companies to boycott during protests
- Safety tips and activist guidance throughout the app
- Fully translated interface in Turkish

## Recent Updates

### Complete Turkish Translation
- Translated all app content into Turkish for better accessibility
- Localized user interface elements, button labels, and system messages
- Complete onboarding process now available in Turkish
- Adapted all error messages and notifications for Turkish language

### Enhanced Onboarding Flow
- Improved 5-step onboarding process with visual progress indicators
- Redesigned avatar selection screen with smoother navigation
- Enhanced user experience for first-time users
- Improved password creation and confirmation fields

### iOS Usability Improvements
- Fixed iOS password autofill functionality for better visibility and security
- Enhanced color contrast during password creation with iOS autofill suggestions
- Improved input field behaviors for better iOS compatibility
- Consistent navigation controls across all screens

### Location Services Integration
- Added quick access buttons to important locations:
  - "Gözaltı Kremi Lokasyonları" (halkharita.com)
  - "Tamirat Lokasyonları" (ozgurlukharitasi.com)
- Integrated web browser support for seamless location access

### Enhanced Settings Screen
- Improved dark mode compatibility
- New privacy policy modal with better visibility
- Redesigned action buttons for better accessibility
- Enhanced profile management interface
- Streamlined notification controls
- Added leaderboard visibility toggle

### UI/UX Improvements
- Consistent dark theme implementation across all screens
- Enhanced button and text visibility
- Improved contrast for better readability
- Modernized modal interfaces
- Streamlined navigation experience

### Privacy and Security
- Added comprehensive privacy policy
- Enhanced user data protection
- Improved account management options
- Added data reset functionality

## Tech Stack

- React Native
- Expo
- TypeScript
- Firebase (Authentication, Database, Storage)
- Native Base UI Components
- Expo Router for Navigation

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Corcit/gompile.git
cd gompile
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npx expo start
```

### Running the App

- Press `i` to run on iOS simulator
- Press `a` to run on Android emulator
- Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on your device

## Project Structure

```
gompile/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based screens
│   │   ├── index.tsx      # Home screen
│   │   └── boycott.tsx    # Boycott list screen
│   ├── boycott/           # Boycott-related screens
│   │   ├── [id].tsx       # Boycott company detail screen
│   │   └── _layout.tsx    # Layout for boycott screens
│   └── onboarding/        # Onboarding screens
├── assets/                 # Static assets
├── components/             # Reusable components
│   ├── attendance/         # Attendance-related components
│   │   ├── TamiratStats.tsx # Statistics with safety tips
│   │   └── CheckInModal.tsx # Attendance check-in
│   ├── settings/          # Settings components
│   │   ├── EditProfileModal.tsx # Profile editor
│   │   └── PrivacyPolicyModal.tsx # Privacy policy
│   └── ui/                 # UI components
├── constants/              # App constants
│   └── Colors.ts           # Color themes
├── services/               # API and service integrations
│   └── api/                # API services
│       ├── models/         # Data models
│       │   └── BoycottCompany.ts # Boycott data model
│       └── services/       # API service implementations
│           └── boycottService.ts # Boycott data service
```

## Recent Changes

### Boykot (Boycott List) Feature

A new feature allowing users to browse and search for companies being boycotted during protests:

- **Main List View**: Search, filter, and browse boycotted companies
- **Category Filtering**: Filter companies by categories including Gıda (Food), Teknoloji (Tech), Giyim (Clothing), Enerji (Energy), and Tarım (Agriculture)
- **Company Details**: View detailed information about why a company is being boycotted, when the boycott started, and alternative companies to support
- **Sharing**: Share boycott information with others

### Safety Tips Integration

- Added protest safety tips to the TamiratStats component
- Interactive tips system with rotating advice for protesters
- Content includes practical guidance for safety during demonstrations

### UI/UX Improvements

- Consistent dark theme implementation across all screens
- Enhanced visibility of UI elements including category filters
- Improved text contrast for better readability
- Complete Turkish translation of the interface

### Technical Updates

- Added new data models for boycott information
- Created services for managing boycott data
- Implemented new screens and navigation for the boycott feature

### API Error Fix in Boycott Details

Fixed an issue where boycott company details would fail to load with error:
```
Error getting boycott company details for ID boycott-2: TypeError: this.apiClient.getDocument is not a function (it is undefined)
```

This was resolved by:
- Correctly initializing the boycottService through the API context instead of directly instantiating it
- Using the useApi() hook to access properly initialized services
- This fix ensures proper API client injection in service classes

### Firestore Collection Initialization Scripts

Added tools to simplify Firestore database setup for new developers:
- `verify-collections.js`: Checks which collections exist and have data
- `init-firestore-collections.js`: Creates sample documents in all required collections
- `FIREBASE_SETUP.md`: Comprehensive documentation for Firebase setup

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Firestore Collections Initialization

Setting up the Firestore database for local development is now streamlined with dedicated scripts.

### Collection Structure

The app uses the following collections in Firestore:

| Collection | Purpose |
|------------|---------|
| `boycottCompanies` | Companies being boycotted |
| `achievements` | Available user achievements |
| `announcements` | System and channel announcements |
| `channels` | Communication channels |
| `channelSubscriptions` | User subscriptions to channels |
| `protestEvents` | Protest event details |
| `attendanceRecords` | User attendance records |
| `users` | User profiles and settings |

### Initialization Steps

1. Install the Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Generate a Firebase service account key (see FIREBASE_SETUP.md for details)

3. Run the verification script to check your database:
```bash
node verify-collections.js
```

4. Run the initialization script to create collections and sample data:
```bash
node init-firestore-collections.js
```

For detailed instructions, refer to [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## API Architecture

The app uses a structured API architecture to interact with Firebase services:

### API Client & Services Pattern

- `apiClient.ts`: Central client handling Firebase operations and authentication 
- Service Classes: Domain-specific services that use the apiClient (e.g., boycottService, userService)
- API Context: React context providing services to components

### Service Initialization

Services are properly initialized through the ApiProvider:

```jsx
// In ApiContext.tsx
export const ApiProvider = ({ children }) => {
  const apiClient = getApiClient(); // Singleton instance
  
  // Initialize services with the API client
  const userService = new UserService(apiClient);
  const boycottService = new BoycottService(apiClient);
  // ... other services
  
  return (
    <ApiContext.Provider value={{ userService, boycottService, ... }}>
      {children}
    </ApiContext.Provider>
  );
};

// In components - CORRECT usage
function MyComponent() {
  const { boycottService } = useApi();
  // boycottService is properly initialized
}

// INCORRECT usage (will cause errors)
const boycottService = new BoycottService({});
// apiClient is an empty object, methods will be undefined
```

### Common API Errors

1. **undefined method errors**: Usually caused by improper service initialization. Always use the `useApi()` hook to get services.

2. **Permission errors**: Check Firebase security rules and ensure the user is authenticated.

3. **Missing or insufficient permissions**: Verify security rules for the collection you're accessing.

4. **Network errors**: Often occur when Firestore handlers aren't implemented for specific endpoints.

## Firebase Security Rules

The app uses custom Firestore security rules to control data access:

### Security Model Overview

- **Public Reading**: Some collections allow unauthenticated reads (boycottCompanies, channels, announcements)
- **Authenticated Reads**: Most data requires authentication to read
- **Owner-Based Write Permissions**: Users can only modify their own data
- **Collection-Specific Rules**: Each collection has tailored security rules

### Key Rules Implementation

```javascript
// Example security rule pattern
match /userSettings/{userId} {
  // Allow authenticated users to read
  allow read: if request.auth != null;
  // Only allow document owner to write
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

### Deploying Rules

```bash
firebase deploy --only firestore:rules
```

For a complete reference of rules, see `firestore.rules` in the project.

## Troubleshooting Common Issues

### API Client Errors

1. **"getDocument is not a function"**
   - **Cause**: Service initialized with empty object instead of apiClient
   - **Solution**: Use the useApi() hook to get properly initialized services
   - **Example**: `const { boycottService } = useApi();`

2. **"Missing or insufficient permissions"**
   - **Cause**: Firebase security rules blocking access
   - **Solution**: Check security rules for the collection and ensure user is authenticated
   - **Debug**: Enable Firebase debug mode to see detailed permission errors

3. **"Network error. Please check your connection."**
   - **Cause**: Often happens when a handler for an API endpoint is missing
   - **Solution**: Implement proper API handlers in apiClient.ts
   - **Example**: Add a case for your endpoint in the get/post methods

### Firebase Setup Issues

1. **"Service account key not found"**
   - **Solution**: Generate a key from Firebase Console and save as `firebase-service-account.json`

2. **"Auth token refresh failed"**
   - **Solution**: Sign out and sign in again to refresh authentication

For more troubleshooting tips, see the [Firebase documentation](https://firebase.google.com/docs/firestore/troubleshooting).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Setup

1. **Prerequisites**
   - Node.js (v14 or newer)
   - npm or yarn
   - iOS: Xcode (latest version)
   - Android: Android Studio and SDK

2. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd gompile

   # Install dependencies
   npm install
   ```

3. **Running the app**
   ```bash
   # Start the development server
   npm start

   # Run on iOS
   npm run ios

   # Run on Android
   npm run android
   ```

## Firebase Configuration

The app uses Firebase for backend services. The configuration is already set up in the codebase:

- Firebase Auth for authentication
- Firestore for database operations
- Firebase Storage for file uploads

The Firebase project configuration is stored in:
- `services/firebase.ts` - Main Firebase configuration
- `ios/Gompile/GoogleService-Info.plist` - iOS Firebase configuration
- `android/app/google-services.json` - Android Firebase configuration (if applicable)

## Authentication Flow

The app uses a two-tier authentication system:

### Production Mode (Firebase Authentication)
- The app uses Firebase Anonymous Authentication to authenticate users
- User credentials (username/password) are stored in Firestore's `userCredentials` collection
- User profiles are stored in `userProfiles` collection
- The authentication flow works as follows:
  1. User enters username and password
  2. System signs in anonymously with Firebase Auth
  3. System queries Firestore to validate username and password
  4. On successful validation, the app stores the actual user ID from credentials
  5. All subsequent data operations use this stored ID to access the correct user data
  6. This approach ensures consistent data access across sessions without requiring email/password

### Development Mode
- For development and testing, the app can use a local authentication system
- Set `USE_DEV_MODE = true` in `AuthContext.tsx` to enable this mode
- In development mode:
  - User credentials are stored in AsyncStorage
  - No Firebase authentication is required
  - All data is stored and retrieved locally

### Security Rules
- Firestore security rules are set up to:
  - Allow anonymous users to query `userCredentials` for login purposes
  - Restrict write access to authenticated users only
  - Ensure users can only modify their own data

## TestFlight Deployment

### Prerequisites

1. **Apple Developer Account**
   - You need an active Apple Developer account ($99/year)
   - Enroll at [developer.apple.com](https://developer.apple.com)

2. **App Store Connect Setup**
   - Create a new app in App Store Connect
   - Note the App ID and SKU
   - Set up your app's metadata and information

3. **Certificates and Provisioning Profiles**
   - Create an App Store distribution certificate
   - Create a provisioning profile for your app

### Configuration

1. **Update `eas.json`**
   - Replace the placeholder values with your actual Apple credentials:
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

2. **Verify App Metadata**
   - Make sure `app.json` contains the correct version, bundle ID, and other metadata

### Deployment

You can deploy to TestFlight using the provided script:

```bash
npm run deploy:testflight
```

Or manually with EAS CLI:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to EAS
eas login

# Build for TestFlight
eas build --platform ios --profile test

# Submit to TestFlight
eas submit -p ios --profile test
```

### After Submission

1. Wait for Apple to process your build (typically 15-30 minutes)
2. Address any issues if Apple rejects your build
3. Add TestFlight testers in App Store Connect
4. Send invitations to testers

## Troubleshooting

### Common TestFlight Issues

1. **Build Processing Failed**
   - Check the issue details in App Store Connect
   - Most common reasons: missing privacy declarations or entitlements

2. **Firebase Connectivity Issues**
   - Verify your Firebase Project settings allow access from your app
   - Check for proper initialization in the app code

3. **Certificate Issues**
   - Ensure your certificates are valid and not expired
   - Regenerate provisioning profiles if needed

## Privacy-Focused Authentication

Gompile is committed to user privacy. We have specifically designed our authentication system to NOT collect any personal information:

- We use username-based authentication instead of email/phone
- No personal identifiable information is collected or stored
- User data is stored locally and only shared with our servers when necessary for core functionality
- All stored preferences are kept anonymous and not tied to real identities
- Development mode with local authentication for testing without Firebase setup

This approach helps protect user privacy while still providing necessary account functionality for accessing the app's features. Users can create an account with just a username and password, with no email verification or phone number required.

## License

[License information here]
