import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChg5MSS5LWMCDPUpyauAccxCVoUn4ulyE",
  authDomain: "thinking-anagram-3wrl4.firebaseapp.com",
  projectId: "thinking-anagram-3wrl4",
  storageBucket: "thinking-anagram-3wrl4.firebasestorage.app",
  messagingSenderId: "599038770771",
  appId: "1:599038770771:web:9cde00b9a4fcfb977010a6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore with the custom database ID provided in config
const customDatabaseId = "ai-studio-outfitoracle-189ae071-9b6c-41df-9203-5154cc6b9102";
export const db = getFirestore(app, customDatabaseId);

export default app;
