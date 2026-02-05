
// This file is for server-side data fetching and mutations.
// It uses the Firebase Admin SDK, which has privileged access.
import { adminDb } from '@/firebase/admin';
import type { User } from './definitions';

/**
 * Fetches a user document by ID from the server.
 * Uses the Admin SDK.
 */
export async function getUserById(userId: string): Promise<User | null> {
  const docRef = adminDb.collection('users').doc(userId);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return null;
  }
  // The 'User' type expects 'userId', not 'id'. This maps the document ID to the correct property.
  return { ...docSnap.data(), userId: docSnap.id } as User;
}

/**
 * Updates a user document from the server.
 * Uses the Admin SDK.
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.update(data);
  const updatedUser = await getUserById(userId);
  if (!updatedUser) {
    throw new Error('User not found after update');
  }
  return updatedUser;
}

/**
 * Updates a user's subscription status based on a Stripe customer ID.
 * Intended for use in server-side webhooks.
 * Uses the Admin SDK.
 */
export async function updateUserSubscriptionStatus(stripeCustomerId: string, newStatus: 'active' | 'inactive'): Promise<User | null> {
    const usersCollection = adminDb.collection('users');
    const q = usersCollection.where("stripeCustomerId", "==", stripeCustomerId);
    const snapshot = await q.get();

    if (snapshot.empty) {
        console.warn(`Webhook Error: No user found with Stripe Customer ID: ${stripeCustomerId}`);
        return null;
    }

    const userDoc = snapshot.docs[0];
    const userDocRef = userDoc.ref;
    
    await userDocRef.update({ subscriptionStatus: newStatus });
    
    const updatedUserSnap = await userDocRef.get();
    // The 'User' type expects 'userId', not 'id'. This maps the document ID to the correct property.
    return { ...updatedUserSnap.data(), userId: updatedUserSnap.id } as User;
}
