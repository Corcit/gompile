# Gompile

A comprehensive mobile application built with React Native and Expo for tracking and managing protest attendance and activist engagement. Gompile provides a secure platform for activists to coordinate, share information, and maintain safety during protests.

## 🌟 Core Features

### 📱 Main Features
- **Home Screen** (`app/(tabs)/index.tsx`)
  - Interactive location tracking
  - Real-time attendance statistics
  - Calendar view for participation tracking
  - Quick access to "Gözaltı Kremi" and "Tamirat" locations

- **Leaderboard System** (`app/(tabs)/leaderboard.tsx`)
  - Comprehensive engagement tracking
  - Achievement system
  - Privacy-focused visibility controls
  - Real-time updates

- **Announcements** (`app/(tabs)/announcements.tsx`)
  - Important updates and news
  - Channel-based communication
  - Push notification support
  - Rich media content support

### 🛡️ Safety Features
- **Boycott List** (`app/(tabs)/boycott.tsx`)
  - Searchable company database
  - Category-based filtering
  - Detailed company information
  - Alternative recommendations

- **Safety Tips Integration**
  - Interactive guidance system
  - Location-based safety information
  - Emergency contact features
  - Real-time updates

### 👤 User Experience
- **Comprehensive Onboarding** (`app/onboarding/`)
  - Welcome introduction (`welcome.tsx`)
  - Avatar customization (`avatar.tsx`)
  - Nickname selection (`nickname.tsx`)
  - Notification preferences (`notifications.tsx`)
  - Experience level setup (`experience.tsx`)

- **Settings Management** (`app/(tabs)/settings.tsx`)
  - Profile customization
  - Privacy controls
  - Notification management
  - Theme preferences

## 🛠️ Technical Stack

### Core Technologies
- React Native
- Expo SDK
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- Expo Router

### Key Dependencies
- Native Base UI Components
- React Navigation
- Firebase SDK
- Expo modules (Status Bar, WebBrowser, Constants)

## 📁 Project Structure

```
gompile/
├── app/                    # Application screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen (469 lines)
│   │   ├── boycott.tsx    # Boycott list (362 lines)
│   │   ├── announcements.tsx # Announcements (751 lines)
│   │   ├── leaderboard.tsx  # Leaderboard (1034 lines)
│   │   └── settings.tsx     # Settings (483 lines)
│   ├── onboarding/        # User onboarding flow
│   │   ├── welcome.tsx    # Welcome screen
│   │   ├── avatar.tsx     # Avatar selection
│   │   ├── nickname.tsx   # Nickname setup
│   │   ├── notifications.tsx # Notification preferences
│   │   └── experience.tsx   # Experience level
│   └── _layout.tsx        # Root layout configuration
│
├── components/            # Reusable components
│   ├── attendance/       # Attendance tracking
│   ├── mascot/          # Mascot-related components
│   ├── settings/        # Settings components
│   ├── ui/              # Generic UI components
│   └── __tests__/       # Component tests
│
├── services/             # Backend services
│   ├── api/             # API integration
│   │   ├── services/    # Service implementations
│   │   ├── models/      # Data models
│   │   ├── hooks/       # API-related hooks
│   │   ├── apiClient.ts # Main API client (994 lines)
│   │   └── AuthContext.tsx # Auth context (649 lines)
│   └── firebase.ts      # Firebase configuration
│
├── hooks/               # Custom React hooks
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
│
└── constants/          # Application constants
    └── Colors.ts      # Theme definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (optional)
- Firebase account and project

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

3. Configure Firebase
- Follow instructions in `FIREBASE_SETUP.md`
- Initialize Firestore collections using provided scripts

4. Start development server
```bash
npx expo start
```

## 🔧 Development

### Key Files
- `app.config.js`: Expo configuration
- `firebase.json`: Firebase settings
- `eas.json`: EAS Build configuration
- `tsconfig.json`: TypeScript configuration

### Architecture
- **API Client**: Centralized API handling (`apiClient.ts`)
- **Authentication**: Context-based auth management (`AuthContext.tsx`)
- **Navigation**: Expo Router with tab-based structure
- **Theming**: Custom hooks and themed components

### Testing
- Component tests in `components/__tests__/`
- Jest configuration in `package.json`

## 📱 Building and Deployment

### Development Builds
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Builds
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to the branch
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🔐 Security

- Authentication handled through Firebase
- Data encryption in transit and at rest
- Regular security audits
- Privacy-focused data handling

## 🌐 Localization

- Full Turkish language support
- Extensible localization system
- Cultural considerations in UI/UX

## 📚 Additional Resources

- `FIREBASE_SETUP.md`: Detailed Firebase configuration
- `firestoreSchema.md`: Database schema documentation
- `docs/`: Additional documentation

## 🐛 Troubleshooting

Common issues and solutions are documented in the [Wiki](https://github.com/Corcit/gompile/wiki).

For support, please open an issue or contact the maintainers.
