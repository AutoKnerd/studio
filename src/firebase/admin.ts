import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized only once.
if (!getApps().length) {
  admin.initializeApp({
    // When deployed to Google Cloud environments (like Cloud Run, where App Hosting runs),
    // the SDK will automatically discover service account credentials.
    // No need to manually configure `credential`.
  });
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
