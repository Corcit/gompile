import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from GoogleService-Info.plist
const firebaseConfig = {
  apiKey: "AIzaSyDSAefwMfVDnLPwa4xP2WjCPFg4BOfCbSA",
  authDomain: "gompile-455b5.firebaseapp.com",
  projectId: "gompile-455b5",
  storageBucket: "gompile-455b5.firebasestorage.app",
  messagingSenderId: "80116351767",
  appId: "1:80116351767:ios:f5bf982667a3aa28b32d52"
};

console.log('Initializing Firebase app...');
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');

  // Initialize Firebase services with proper typing
  console.log('Initializing Firebase services...');
  auth = getAuth(app);
  console.log('Auth service initialized');
  
  firestore = getFirestore(app);
  console.log('Firestore service initialized');
  
  storage = getStorage(app);
  console.log('Storage service initialized');

  // Verify initialization
  if (!auth || !firestore || !storage) {
    throw new Error('Firebase services not properly initialized');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Export the Firebase services
export { auth, firestore, storage };
export default app; 