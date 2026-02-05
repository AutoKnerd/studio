
import { getApps, initializeApp, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app: App;

if (getApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    // In production, we require service account credentials to be set.
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Normalize the private key, removing quotes and replacing escaped newlines.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing required Firebase Admin SDK environment variables for production (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).'
      );
    }
    
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId: projectId,
    });
  } else {
    // In development, allow fallback to application default credentials,
    // which is useful for local testing with `gcloud auth application-default login`.
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
    if (!projectId) {
         console.warn(
           'FIREBASE_PROJECT_ID or GCLOUD_PROJECT env var not set. Firebase Admin SDK may not connect to the correct project.'
         );
    }
    app = initializeApp({
      credential: applicationDefault(),
      projectId: projectId,
    });
  }
} else {
  app = getApps()[0];
}

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

export { adminDb, adminAuth };
