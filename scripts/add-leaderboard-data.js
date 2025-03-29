const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSAefwMfVDnLPwa4xP2WjCPFg4BOfCbSA",
  authDomain: "gompile-455b5.firebaseapp.com",
  projectId: "gompile-455b5",
  storageBucket: "gompile-455b5.firebasestorage.app",
  messagingSenderId: "80116351767",
  appId: "1:80116351767:ios:f5bf982667a3aa28b32d52"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Sample leaderboard data
const leaderboardEntries = [
  {
    userId: 'user1',
    nickname: 'Activist123',
    avatarId: 'avatar1',
    score: 950,
    rank: 1,
    achievements: [
      { id: 'achievement1', name: 'First Attendance', unlockedAt: new Date().toISOString() }
    ],
    weeklyScore: 120,
    monthlyScore: 450,
    allTimeScore: 950
  },
  {
    userId: 'user2',
    nickname: 'BoycottHero',
    avatarId: 'avatar2',
    score: 820,
    rank: 2,
    achievements: [
      { id: 'achievement1', name: 'First Attendance', unlockedAt: new Date().toISOString() },
      { id: 'achievement4', name: 'Week Streak', unlockedAt: new Date().toISOString() }
    ],
    weeklyScore: 95,
    monthlyScore: 380,
    allTimeScore: 820
  },
  {
    userId: 'user3',
    nickname: 'GompileUser',
    avatarId: 'avatar3',
    score: 730,
    rank: 3,
    achievements: [
      { id: 'achievement1', name: 'First Attendance', unlockedAt: new Date().toISOString() }
    ],
    weeklyScore: 85,
    monthlyScore: 290,
    allTimeScore: 730
  },
  {
    userId: 'user4',
    nickname: 'ProBoycotter',
    avatarId: 'avatar4',
    score: 650,
    rank: 4,
    achievements: [
      { id: 'achievement1', name: 'First Attendance', unlockedAt: new Date().toISOString() },
      { id: 'achievement2', name: 'Regular Activist', unlockedAt: new Date().toISOString() }
    ],
    weeklyScore: 70,
    monthlyScore: 250,
    allTimeScore: 650
  },
  {
    userId: 'user5',
    nickname: 'AwareConsumer',
    avatarId: 'avatar5',
    score: 580,
    rank: 5,
    achievements: [
      { id: 'achievement1', name: 'First Attendance', unlockedAt: new Date().toISOString() }
    ],
    weeklyScore: 60,
    monthlyScore: 220,
    allTimeScore: 580
  }
];

// Function to add leaderboard data
const addLeaderboardData = async () => {
  try {
    console.log('Adding leaderboard data to Firestore...');
    
    // Add each leaderboard entry
    for (const entry of leaderboardEntries) {
      await setDoc(doc(firestore, 'leaderboard', entry.userId), {
        ...entry,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added leaderboard entry for user: ${entry.nickname}`);
    }
    
    console.log('Successfully added all leaderboard data to Firestore');
  } catch (error) {
    console.error('Error adding leaderboard data:', error);
  }
};

// Execute the function
addLeaderboardData(); 