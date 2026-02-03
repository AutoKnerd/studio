
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized only once.
if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // The persistent ID token audience mismatch indicates that the runtime environment's
    // ambient credentials (e.g., from a GCLOUD_PROJECT env var) point to the wrong project.
    // To fix this, we MUST use explicit service account credentials via `admin.credential.cert()`
    // to override the environment and force the Admin SDK to use the correct project.
    if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
            projectId: projectId,
        });
    } else {
        // This case should not happen in a correctly configured Studio/App Hosting environment.
        // We log a clear warning because without these env vars, authentication will fail.
        console.warn(
          'One or more Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. ' +
          'Admin SDK initialization will likely fail.'
        );
        // Fallback to the previous attempt which was being overridden.
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'studio-8028797920-12261', // Hardcoded as last resort
        });
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
