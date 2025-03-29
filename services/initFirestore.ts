import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { firestore } from './firebase';

/**
 * Helper functions to initialize Firestore with sample data
 */

// Sample user profiles
const sampleUserProfiles = [
  {
    id: 'user1',
    nickname: 'Activist123',
    avatarId: '1',
    experienceLevel: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user2',
    nickname: 'BoycottHero',
    avatarId: '2',
    experienceLevel: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user3',
    nickname: 'GompileUser',
    avatarId: '3',
    experienceLevel: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user4',
    nickname: 'ProBoycotter',
    avatarId: '4',
    experienceLevel: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user5',
    nickname: 'AwareConsumer',
    avatarId: '5',
    experienceLevel: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample user settings
const sampleUserSettings = [
  {
    id: 'user1',
    notifications: {
      enabled: true
    },
    showOnLeaderboard: true,
    nickname: 'Activist123',
    email: 'activist123@example.com',
    avatar: {
      id: '1',
      url: 'https://via.placeholder.com/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user2',
    notifications: {
      enabled: false
    },
    showOnLeaderboard: true,
    nickname: 'BoycottHero',
    email: 'boycott.hero@example.com',
    avatar: {
      id: '2',
      url: 'https://via.placeholder.com/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user3',
    notifications: {
      enabled: true
    },
    showOnLeaderboard: true,
    nickname: 'GompileUser',
    email: 'gompile.user@example.com',
    avatar: {
      id: '3',
      url: 'https://via.placeholder.com/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user4',
    notifications: {
      enabled: true
    },
    showOnLeaderboard: false,
    nickname: 'ProBoycotter',
    email: 'pro.boycotter@example.com',
    avatar: {
      id: '4',
      url: 'https://via.placeholder.com/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user5',
    notifications: {
      enabled: true
    },
    showOnLeaderboard: true,
    nickname: 'AwareConsumer',
    email: 'aware.consumer@example.com',
    avatar: {
      id: '5',
      url: 'https://via.placeholder.com/150'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample leaderboard entries
const sampleLeaderboardEntries = [
  {
    userId: 'user1',
    rank: 1,
    nickname: 'Activist123',
    avatarId: '1',
    score: 950,
    achievements: [
      {
        id: 'achievement1',
        name: 'First Attendance',
        description: 'Attended your first protest',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 1,
          current: 1
        },
        progress: 1
      }
    ],
    weeklyScore: 120,
    monthlyScore: 450,
    allTimeScore: 950,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user2',
    rank: 2,
    nickname: 'BoycottHero',
    avatarId: '2',
    score: 820,
    achievements: [
      {
        id: 'achievement1',
        name: 'First Attendance',
        description: 'Attended your first protest',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 1,
          current: 1
        },
        progress: 1
      },
      {
        id: 'achievement4',
        name: 'Week Streak',
        description: 'Maintained a 7-day attendance streak',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'streak',
          target: 7,
          current: 7
        },
        progress: 7
      }
    ],
    weeklyScore: 95,
    monthlyScore: 380,
    allTimeScore: 820,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user3',
    rank: 3,
    nickname: 'GompileUser',
    avatarId: '3',
    score: 730,
    achievements: [
      {
        id: 'achievement1',
        name: 'First Attendance',
        description: 'Attended your first protest',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 1,
          current: 1
        },
        progress: 1
      }
    ],
    weeklyScore: 85,
    monthlyScore: 290,
    allTimeScore: 730,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user4',
    rank: 4,
    nickname: 'ProBoycotter',
    avatarId: '4',
    score: 650,
    achievements: [
      {
        id: 'achievement1',
        name: 'First Attendance',
        description: 'Attended your first protest',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 1,
          current: 1
        },
        progress: 1
      },
      {
        id: 'achievement2',
        name: 'Regular Activist',
        description: 'Attended 10 protests',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 10,
          current: 10
        },
        progress: 10
      }
    ],
    weeklyScore: 70,
    monthlyScore: 250,
    allTimeScore: 650,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: 'user5',
    rank: 5,
    nickname: 'AwareConsumer',
    avatarId: '5',
    score: 580,
    achievements: [
      {
        id: 'achievement1',
        name: 'First Attendance',
        description: 'Attended your first protest',
        imageUrl: null,
        unlockedAt: new Date().toISOString(),
        requirement: {
          type: 'attendance',
          target: 1,
          current: 1
        },
        progress: 1
      }
    ],
    weeklyScore: 60,
    monthlyScore: 220,
    allTimeScore: 580,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample boycott companies data
const sampleBoycottCompanies = [
  {
    id: 'coffeemax',
    name: 'CoffeeMax',
    logo: 'https://via.placeholder.com/150',
    category: 'gıda',
    reason: 'Labor abuses and unfair working conditions',
    startDate: '2023-05-15',
    description: 'CoffeeMax has been documented to use exploitative labor practices in their supply chain, with workers being paid below living wage and forced to work excessive hours in poor conditions.',
    alternativeCompanies: ['Fair Trade Coffee', 'Local Brew'],
    link: 'https://example.com/coffeemax-issues'
  },
  {
    id: 'techgiant',
    name: 'TechGiant',
    logo: 'https://via.placeholder.com/150',
    category: 'teknoloji',
    reason: 'Privacy violations and data exploitation',
    startDate: '2023-02-10',
    description: 'TechGiant has repeatedly violated user privacy, selling personal data without consent and implementing invasive tracking mechanisms across their platforms.',
    alternativeCompanies: ['PrivacyTech', 'OpenSource Solutions'],
    link: 'https://example.com/techgiant-privacy'
  },
  {
    id: 'fastfashion',
    name: 'FastFashion Co',
    logo: 'https://via.placeholder.com/150',
    category: 'giyim',
    reason: 'Environmental damage and sweatshop conditions',
    startDate: '2022-11-22',
    description: 'FastFashion Co has been linked to severe environmental pollution in manufacturing countries and employs workers in dangerous sweatshop conditions with minimal pay.',
    alternativeCompanies: ['EthicalWear', 'Sustainable Clothing'],
    link: 'https://example.com/fastfashion-report'
  },
  {
    id: 'oilcorp',
    name: 'OilCorp',
    logo: 'https://via.placeholder.com/150',
    category: 'enerji',
    reason: 'Climate change denial and environmental destruction',
    startDate: '2021-08-30',
    description: 'OilCorp has funded climate change denial groups while continuing to expand fossil fuel extraction, leading to documented environmental disasters in protected areas.',
    alternativeCompanies: ['GreenEnergy', 'SustainablePower'],
    link: 'https://example.com/oilcorp-climate'
  },
  {
    id: 'agriglobal',
    name: 'AgriGlobal',
    logo: 'https://via.placeholder.com/150',
    category: 'tarım',
    reason: 'GMO controversies and farmer exploitation',
    startDate: '2022-03-14',
    description: 'AgriGlobal has been accused of forcing harmful contracts on small farmers, monopolizing seed markets, and causing ecological damage through aggressive pesticide use.',
    alternativeCompanies: ['OrganicFarms', 'LocalGrow'],
    link: 'https://example.com/agriglobal-practices'
  }
];

// Sample achievements
const sampleAchievements = [
  {
    id: 'achievement1',
    name: 'First Attendance',
    description: 'Attended your first protest',
    iconUrl: null,
    criteria: {
      type: 'attendance',
      threshold: 1,
      conditions: []
    },
    points: 10
  },
  {
    id: 'achievement2',
    name: 'Regular Activist',
    description: 'Attended 10 protests',
    iconUrl: null,
    criteria: {
      type: 'attendance',
      threshold: 10,
      conditions: []
    },
    points: 50
  },
  {
    id: 'achievement3',
    name: 'Dedicated Activist',
    description: 'Attended 20 protests',
    iconUrl: null,
    criteria: {
      type: 'attendance',
      threshold: 20,
      conditions: []
    },
    points: 100
  },
  {
    id: 'achievement4',
    name: 'Week Streak',
    description: 'Maintained a 7-day attendance streak',
    iconUrl: null,
    criteria: {
      type: 'streak',
      threshold: 7,
      conditions: []
    },
    points: 70
  }
];

// Sample announcements
const sampleAnnouncements = [
  {
    id: 'announcement1',
    title: 'New Protest Location',
    content: 'The next protest will be held at City Square instead of the originally planned Park Avenue location.',
    publishDate: new Date().toISOString(),
    author: 'Protest Organizer',
    category: 'update',
    tags: ['location', 'change'],
    imageUrl: 'https://via.placeholder.com/300',
    linkUrl: '',
    pinned: true,
    priority: 1
  },
  {
    id: 'announcement2',
    title: 'Safety Tips for Tomorrow',
    content: 'Please remember to bring water, wear comfortable shoes, and follow the safety guidelines provided in the app.',
    publishDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Safety Team',
    category: 'safety',
    tags: ['tips', 'safety'],
    imageUrl: 'https://via.placeholder.com/300',
    linkUrl: '',
    pinned: false,
    priority: 2
  }
];

/**
 * Initialize boycott companies in Firestore
 */
export const initBoycottCompanies = async (): Promise<void> => {
  try {
    const boycottCollection = collection(firestore, 'boycottCompanies');
    
    // Check if data already exists
    const existingData = await getDocs(boycottCollection);
    if (!existingData.empty) {
      console.log('Boycott companies data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample boycott companies
    for (const company of sampleBoycottCompanies) {
      await setDoc(doc(firestore, 'boycottCompanies', company.id), {
        ...company,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Successfully initialized boycott companies data');
  } catch (error) {
    console.error('Error initializing boycott companies:', error);
  }
};

/**
 * Initialize achievements in Firestore
 */
export const initAchievements = async (): Promise<void> => {
  try {
    const achievementsCollection = collection(firestore, 'achievements');
    
    // Check if data already exists
    const existingData = await getDocs(achievementsCollection);
    if (!existingData.empty) {
      console.log('Achievements data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample achievements
    for (const achievement of sampleAchievements) {
      await setDoc(doc(firestore, 'achievements', achievement.id), {
        ...achievement,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Successfully initialized achievements data');
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
};

/**
 * Initialize announcements in Firestore
 */
export const initAnnouncements = async (): Promise<void> => {
  try {
    const announcementsCollection = collection(firestore, 'announcements');
    
    // Check if data already exists
    const existingData = await getDocs(announcementsCollection);
    if (!existingData.empty) {
      console.log('Announcements data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample announcements
    for (const announcement of sampleAnnouncements) {
      await setDoc(doc(firestore, 'announcements', announcement.id), {
        ...announcement,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('Successfully initialized announcements data');
  } catch (error) {
    console.error('Error initializing announcements:', error);
  }
};

/**
 * Initialize user profiles in Firestore
 */
export const initUserProfiles = async (): Promise<void> => {
  try {
    const userProfilesCollection = collection(firestore, 'userProfiles');
    
    // Check if data already exists
    const existingData = await getDocs(userProfilesCollection);
    if (!existingData.empty) {
      console.log('User profiles data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample user profiles
    for (const profile of sampleUserProfiles) {
      await setDoc(doc(firestore, 'userProfiles', profile.id), profile);
    }
    
    console.log('Successfully initialized user profiles data');
  } catch (error) {
    console.error('Error initializing user profiles:', error);
  }
};

/**
 * Initialize user settings in Firestore
 */
export const initUserSettings = async (): Promise<void> => {
  try {
    const userSettingsCollection = collection(firestore, 'userSettings');
    
    // Check if data already exists
    const existingData = await getDocs(userSettingsCollection);
    if (!existingData.empty) {
      console.log('User settings data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample user settings
    for (const settings of sampleUserSettings) {
      await setDoc(doc(firestore, 'userSettings', settings.id), settings);
    }
    
    console.log('Successfully initialized user settings data');
  } catch (error) {
    console.error('Error initializing user settings:', error);
  }
};

/**
 * Initialize leaderboard data in Firestore
 */
export const initLeaderboardData = async (): Promise<void> => {
  try {
    const leaderboardCollection = collection(firestore, 'leaderboard');
    
    // Check if data already exists
    const existingData = await getDocs(leaderboardCollection);
    if (!existingData.empty) {
      console.log('Leaderboard data already exists. Skipping initialization.');
      return;
    }
    
    // Add sample leaderboard entries
    for (const entry of sampleLeaderboardEntries) {
      await setDoc(doc(firestore, 'leaderboard', entry.userId), entry);
    }
    
    console.log('Successfully initialized leaderboard data');
  } catch (error) {
    console.error('Error initializing leaderboard data:', error);
  }
};

/**
 * Initialize all Firestore data
 */
export const initializeFirestoreData = async (): Promise<void> => {
  await initBoycottCompanies();
  await initAchievements();
  await initAnnouncements();
  await initUserProfiles();
  await initUserSettings();
  await initLeaderboardData();
  console.log('Firestore initialization complete');
};

/**
 * Call this function from your app initialization to populate Firestore with sample data
 */
export default initializeFirestoreData; 