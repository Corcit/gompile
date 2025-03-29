const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

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
const auth = getAuth(app);

// Sample users data with settings
const usersData = [
  {
    id: 'user1',
    nickname: 'Activist123',
    email: 'activist123@example.com',
    password: 'Test123!',
    settings: {
      notifications: {
        enabled: true
      },
      showOnLeaderboard: true,
      avatar: {
        id: 'avatar1',
        url: 'https://via.placeholder.com/150'
      }
    },
    profile: {
      experienceLevel: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'user2',
    nickname: 'BoycottHero',
    email: 'boycott.hero@example.com',
    password: 'Test123!',
    settings: {
      notifications: {
        enabled: false
      },
      showOnLeaderboard: true,
      avatar: {
        id: 'avatar2',
        url: 'https://via.placeholder.com/150'
      }
    },
    profile: {
      experienceLevel: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
];

// Function to add users and their settings
const addUsersData = async () => {
  try {
    console.log('Adding users data to Firestore...');
    
    // Add each user
    for (const userData of usersData) {
      // Create user in Firebase Auth (optional)
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const authUserId = userCredential.user.uid;
        console.log(`Created auth user with ID: ${authUserId}`);
        
        // If you want to use Firebase Auth UID instead of custom ID
        userData.id = authUserId;
      } catch (authError) {
        // User might already exist, continue anyway
        console.warn(`Auth user creation failed (might already exist): ${authError.message}`);
      }
      
      // Add user settings
      await setDoc(doc(firestore, 'userSettings', userData.id), {
        ...userData.settings,
        nickname: userData.nickname,
        email: userData.email,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added settings for user: ${userData.nickname}`);
      
      // Add user profile
      await setDoc(doc(firestore, 'userProfiles', userData.id), {
        nickname: userData.nickname,
        avatarId: userData.settings.avatar.id,
        ...userData.profile
      });
      console.log(`Added profile for user: ${userData.nickname}`);
    }
    
    console.log('Successfully added all users data to Firestore');
  } catch (error) {
    console.error('Error adding users data:', error);
  }
};

// Execute the function
addUsersData(); 