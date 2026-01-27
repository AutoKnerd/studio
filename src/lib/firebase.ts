
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

let app: FirebaseApp;

// This check ensures we initialize on the server, but re-use the existing
// instance on the client, which is set up by FirebaseClientProvider.
if (typeof window === 'undefined') {
  // Server-side initialization
  if (getApps().length === 0) {
    try {
      // App Hosting-aware initialization
      app = initializeApp();
    } catch (e) {
      app = initializeApp(firebaseConfig);
    }
  } else {
    app = getApp();
  }
} else {
  // Client-side: get the app that's already been initialized.
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
