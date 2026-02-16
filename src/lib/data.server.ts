
'use server';

import type { User } from './definitions';

// Helper function to dynamically import and check the Admin SDK.
async function checkAdminSdk() {
  // Use dynamic import to prevent this from being in the client bundle.
  const { isAdminInitialized, AdminNotInitializedError } = await import('@/firebase/admin');
  if (!isAdminInitialized) {
    throw new AdminNotInitializedError(
      'The Firebase Admin SDK is not available on the server. This function cannot be executed.'
    );
  }
}

// NOTE: This internal function is not exported.
const getDataById = async <T>(
  collectionName: string,
  id: string
): Promise<T | null> => {
  await checkAdminSdk();
  const { getAdminDb } = await import('@/firebase/admin');
  const adminDb = getAdminDb();

  try {
    const docRef = adminDb.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    if (!data) {
      return null;
    }

    if (collectionName === 'users') {
      return { ...data, userId: docSnap.id } as T;
    }
    return { ...data, id: docSnap.id } as T;
  } catch (error) {
    console.error(`[data.server] Error fetching document from ${collectionName}/${id}:`, error);
    return null;
  }
};

export async function getCombinedTeamData(): Promise<User[]> {
  await checkAdminSdk();
  const { getAdminDb } = await import('@/firebase/admin');
  const adminDb = getAdminDb();
  let teamMembers: User[] = [];
  try {
    const snapshot = await adminDb.collection('users').get();
    teamMembers = snapshot.docs.map(
      (d) => ({ ...(d.data() as any), userId: d.id } as User)
    );
  } catch (error) {
    console.error('[data.server] Error fetching team data:', error);
  }
  return teamMembers;
}

export async function getManageableUsers(): Promise<User[]> {
  await checkAdminSdk();
  const { getAdminDb } = await import('@/firebase/admin');
  const adminDb = getAdminDb();
  let allUsers: User[] = [];
  try {
    const snapshot = await adminDb.collection('users').get();
    allUsers = snapshot.docs.map(
      (d) => ({ ...(d.data() as any), userId: d.id } as User)
    );
  } catch (error) {
    console.error('[data.server] Error fetching manageable users:', error);
  }
  return allUsers;
}


export async function logLessonCompletion(data: {
  userId: string;
  lessonId: string;
  timestamp: number;
}): Promise<User | null> {
    await checkAdminSdk();
    const { getAdminDb } = await import('@/firebase/admin');
    const adminDb = getAdminDb();
    try {
        const userDocRef = adminDb.collection('users').doc(data.userId);
        
        const updatedUserDoc = await userDocRef.get();
        if (!updatedUserDoc.exists) return null;

        const updatedUser = { ...(updatedUserDoc.data() as any), userId: updatedUserDoc.id } as User;
        return updatedUser;

    } catch (error) {
        console.error('[data.server] Error logging lesson completion:', error);
        return null;
    }
}
