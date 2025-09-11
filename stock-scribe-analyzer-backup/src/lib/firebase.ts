import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig, productionFirebaseConfig } from './firebase-config';

// ใช้ production config สำหรับ production environment
const config = process.env.NODE_ENV === 'production' ? productionFirebaseConfig : firebaseConfig;

// Initialize Firebase
const app = initializeApp(config);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Connect to emulators in development (disabled for now)
// if (process.env.NODE_ENV === 'development') {
//   try {
//     // Connect to Auth emulator
//     if (!auth.emulatorConfig) {
//       connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     }
//     
//     // Connect to Firestore emulator
//     if (!db._delegate._databaseId.projectId.includes('demo-')) {
//       connectFirestoreEmulator(db, 'localhost', 8081);
//     }
//   } catch (error) {
//     console.log('Firebase emulators not available, using production services');
//   }
// }

export default app;
