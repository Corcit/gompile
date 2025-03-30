/**
 * Initialize Firestore Collections
 * 
 * This script creates all necessary collections with sample documents for the application.
 * It requires a firebase-service-account.json file in the root directory.
 * 
 * Usage: node init-firestore-collections.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = admin.firestore();
const timestamp = admin.firestore.FieldValue.serverTimestamp();

/**
 * Creates a collection with sample data if it doesn't already exist.
 * @param {string} collectionName - The name of the collection to create
 * @param {Array} sampleDocuments - Array of sample documents to add
 */
async function createCollectionWithSamples(collectionName, sampleDocuments) {
  try {
    // Check if collection has documents
    const snapshot = await db.collection(collectionName).limit(1).get();
    
    if (!snapshot.empty) {
      console.log(`Collection '${collectionName}' already exists with data. Skipping.`);
      return;
    }
    
    // Add sample documents
    console.log(`Creating sample documents for collection '${collectionName}'...`);
    const batch = db.batch();
    
    for (const document of sampleDocuments) {
      const docRef = db.collection(collectionName).doc(document.id);
      batch.set(docRef, {
        ...document,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    await batch.commit();
    console.log(`✅ Successfully created collection '${collectionName}' with ${sampleDocuments.length} sample document(s)`);
  } catch (error) {
    console.error(`❌ Error creating collection '${collectionName}':`, error);
  }
}

/**
 * Initialize all required collections with sample data
 */
async function initializeCollections() {
  console.log('Starting Firestore collections initialization...\n');
  
  // 1. Boycott Companies
  const boycottCompanies = [
    {
      id: 'boycott-1',
      name: 'Example Company 1',
      logo: 'https://example.com/logo1.png',
      category: 'Food & Beverages',
      reason: 'Environmental concerns',
      startDate: admin.firestore.Timestamp.fromDate(new Date('2023-01-01')),
      description: 'This company has been involved in environmentally harmful practices.',
      alternativeCompanies: ['Ethical Foods Co', 'Green Solutions Inc'],
      link: 'https://example.com/more-info'
    },
    {
      id: 'boycott-2',
      name: 'Example Company 2',
      logo: 'https://example.com/logo2.png',
      category: 'Clothing',
      reason: 'Labor rights violations',
      startDate: admin.firestore.Timestamp.fromDate(new Date('2023-03-15')),
      description: 'This company has been linked to poor working conditions in its factories.',
      alternativeCompanies: ['Fair Trade Clothing', 'Ethical Apparel'],
      link: 'https://example.com/more-info-2'
    }
  ];
  
  // 2. Achievements
  const achievements = [
    {
      id: 'achievement-1',
      title: 'First Boycott',
      description: 'Participated in your first boycott campaign',
      iconUrl: 'https://example.com/icons/first_boycott.png',
      requirements: {
        boycottsJoined: 1
      },
      pointsAwarded: 100
    },
    {
      id: 'achievement-2',
      title: 'Consistent Activist',
      description: 'Logged in for 7 consecutive days',
      iconUrl: 'https://example.com/icons/consistent_activist.png',
      requirements: {
        consecutiveLogins: 7
      },
      pointsAwarded: 200
    }
  ];
  
  // 3. Announcements
  const announcements = [
    {
      id: 'announcement-1',
      title: 'New Boycott Campaign Started',
      content: 'We have launched a new boycott campaign against Example Company 3.',
      publishDate: admin.firestore.Timestamp.fromDate(new Date('2023-05-10')),
      author: 'Admin',
      category: 'campaign',
      important: true
    },
    {
      id: 'announcement-2',
      title: 'App Update Released',
      content: 'We have released version 2.0 of our app with new features.',
      publishDate: admin.firestore.Timestamp.fromDate(new Date('2023-04-20')),
      author: 'System',
      category: 'system',
      important: false
    }
  ];
  
  // 4. Channels
  const channels = [
    {
      id: 'channel-1',
      name: 'Environmental Activism',
      description: 'Discussion about environmental boycotts and activism',
      createdBy: 'admin-user',
      memberCount: 120,
      isPublic: true,
      tags: ['environment', 'climate', 'sustainability']
    },
    {
      id: 'channel-2',
      name: 'Labor Rights',
      description: 'Discussions focused on companies with labor violations',
      createdBy: 'admin-user',
      memberCount: 85,
      isPublic: true,
      tags: ['labor', 'workers', 'rights']
    }
  ];
  
  // 5. Channel Subscriptions
  const channelSubscriptions = [
    {
      id: 'subscription-1',
      userId: 'user-1',
      channelId: 'channel-1',
      subscriptionDate: admin.firestore.Timestamp.fromDate(new Date('2023-02-15')),
      notificationsEnabled: true
    },
    {
      id: 'subscription-2',
      userId: 'user-2',
      channelId: 'channel-1',
      subscriptionDate: admin.firestore.Timestamp.fromDate(new Date('2023-03-10')),
      notificationsEnabled: false
    }
  ];
  
  // 7. Attendance Records
  const attendanceRecords = [
    {
      id: 'attendance-1',
      userId: 'user-1',
      eventId: 'event-1',
      timestamp: admin.firestore.Timestamp.fromDate(new Date('2023-06-15')),
      status: 'confirmed'
    },
    {
      id: 'attendance-2',
      userId: 'user-2',
      eventId: 'event-1',
      timestamp: admin.firestore.Timestamp.fromDate(new Date('2023-06-14')),
      status: 'pending'
    }
  ];
  
  // 8. Users (basic template, real user data would be created during sign-up)
  const users = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      displayName: 'Demo User 1',
      photoURL: 'https://example.com/user1.jpg',
      userSettings: {
        language: 'en',
        notifications: {
          newBoycotts: true,
          newAnnouncements: true,
          eventReminders: true
        },
        privacy: {
          shareActivity: false,
          publicProfile: true
        }
      }
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      displayName: 'Demo User 2',
      photoURL: 'https://example.com/user2.jpg',
      userSettings: {
        language: 'en',
        notifications: {
          newBoycotts: false,
          newAnnouncements: true,
          eventReminders: false
        },
        privacy: {
          shareActivity: true,
          publicProfile: true
        }
      }
    }
  ];
  
  // Initialize each collection
  await createCollectionWithSamples('boycottCompanies', boycottCompanies);
  await createCollectionWithSamples('achievements', achievements);
  await createCollectionWithSamples('announcements', announcements);
  await createCollectionWithSamples('channels', channels);
  await createCollectionWithSamples('channelSubscriptions', channelSubscriptions);
  await createCollectionWithSamples('attendanceRecords', attendanceRecords);
  await createCollectionWithSamples('users', users);
  
  console.log('\nFirestore collections initialization completed.');
  console.log('Run "node verify-collections.js" to verify all collections were created successfully.');
}

// Run the initialization
initializeCollections()
  .catch(error => {
    console.error('Error initializing Firestore collections:', error);
  });
