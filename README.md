# Gompile

A mobile application built with React Native and Expo for tracking and managing protest attendance and activist engagement.

## Features

- Home screen with attendance tracking and statistics
- Leaderboard system for activist engagement
- News and announcements
- Achievement system
- User profiles and settings
- Dark mode support

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
│   └── onboarding/        # Onboarding screens
├── assets/                 # Static assets
├── components/            # Reusable components
├── constants/             # App constants
└── services/              # API and service integrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
