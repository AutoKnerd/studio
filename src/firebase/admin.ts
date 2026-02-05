import { getApps, initializeApp, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || // ok fallback if you already have it
  'studio-8028797920-12261'; // last resort

if (getApps().length === 0) {
  app = initializeApp({
    credential: applicationDefault(),
    projectId,
  });

  console.log(`[Firebase Admin] projectId = ${app.options.projectId}`);
} else {
  app = getApps()[0];
}

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);