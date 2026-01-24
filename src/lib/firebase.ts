
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: FirebaseApp;
if (!getApps().length) {
    try {
        app = initializeApp();
    } catch (e) {
        app = initializeApp(firebaseConfig);
    }
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

// In a real app, you would use a condition like `process.env.NODE_ENV === 'development'`
// to connect to emulators only in dev mode.
// For this demo, we connect if the hostname is localhost.
if (typeof window !== 'undefined' && window.location.hostname === "localhost") {
  console.log("Connecting to Firebase Emulators");
  // It's important to check if emulators are already running to avoid errors.
  // The `_isInitialized` property is an internal flag we can check.
  // @ts-ignore
  if (!auth.emulatorConfig) {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  }
  // @ts-ignore
  if (!db._settings.host) {
    connectFirestoreEmulator(db, "localhost", 8080);
  }
}


export { app, auth, db };
