module.exports = {
  name: 'Gompile',
  slug: 'gompile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'gompile',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.coruh.gompile'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.coruh.gompile'
  },
  extra: {
    eas: {
      projectId: '0ed2b734-777c-4b3a-93f2-195213e654e9'
    }
  },
  plugins: [
    'expo-router'
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  developmentClient: {
    silentLaunch: true
  },
  packagerOpts: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'],
    config: 'metro.config.js'
  }
}; 