/**
 * Verify Firestore Collections
 * 
 * This script verifies that all required collections exist in the Firestore database.
 * It requires a firebase-service-account.json file in the root directory.
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

// List of required collections
const requiredCollections = [
  'boycottCompanies',
  'achievements',
  'announcements',
  'channels',
  'channelSubscriptions',
  'protestEvents',
  'attendanceRecords',
  'users'
];

// Function to verify collections
async function verifyCollections() {
  console.log('Verifying collections...\n');
  
  const results = {
    existing: [],
    missing: [],
    empty: []
  };
  
  for (const collectionName of requiredCollections) {
    try {
      const snapshot = await db.collection(collectionName).limit(1).get();
      
      if (snapshot.empty) {
        console.log(`❌ Collection '${collectionName}' exists but has no documents.`);
        results.empty.push(collectionName);
      } else {
        console.log(`✅ Collection '${collectionName}' exists with at least ${snapshot.size} document(s).`);
        results.existing.push(collectionName);
      }
    } catch (error) {
      console.log(`❓ Collection '${collectionName}' could not be verified: ${error.message}`);
      results.missing.push(collectionName);
    }
  }
  
  console.log('\nVerification Summary:');
  console.log(`✅ Existing Collections (with data): ${results.existing.length}/${requiredCollections.length}`);
  console.log(`❌ Empty Collections: ${results.empty.length}/${requiredCollections.length}`);
  console.log(`❓ Missing or Unverified Collections: ${results.missing.length}/${requiredCollections.length}`);
  
  if (results.empty.length > 0 || results.missing.length > 0) {
    console.log('\nRecommendation:');
    console.log('Run the init-firestore-collections.js script to create missing collections and add sample data.');
  } else {
    console.log('\nAll collections exist and contain data. Your Firestore database is ready to use.');
  }
}

// Run the verification
verifyCollections()
  .catch(error => {
    console.error('Error verifying collections:', error);
  })
  .finally(() => {
    console.log('\nVerification process completed.');
  });
