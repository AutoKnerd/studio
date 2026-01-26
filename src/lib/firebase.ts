
import { initializeFirebase } from '@/firebase/init';

const { firebaseApp: app, auth, firestore: db } = initializeFirebase();

export { app, auth, db };
