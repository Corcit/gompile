# Gompile

A mobile application built with React Native and Expo for tracking and managing protest attendance and activist engagement.

## Features

- Home screen with attendance tracking and statistics
- Leaderboard system for activist engagement
- News and announcements
- Achievement system
- User profiles and settings
- Dark mode support
- "Boykot" (Boycott List) - Search and filter companies to boycott during protests
- Safety tips and activist guidance throughout the app
- Fully translated interface in Turkish

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
