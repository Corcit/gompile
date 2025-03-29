import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from GoogleService-Info.plist
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

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

// Export the Firebase services
export { auth, firestore, storage };
export default app; 