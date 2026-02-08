import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const authorization = req.headers.get('authorization') ?? req.headers.get('Authorization');

  if (!authorization) {
    return NextResponse.json({ message: 'Unauthorized: Missing token.' }, { status: 401 });
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match?.[1]) {
    return NextResponse.json({ message: 'Unauthorized: Invalid token format.' }, { status: 401 });
  }

  const token = match[1].trim();

  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ message: 'Forbidden: User profile not found.' }, { status: 403 });
    }

    const userRole = userDoc.data()?.role;
    if (!['Admin', 'Developer'].includes(userRole)) {
      return NextResponse.json({ message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const { name, email, phone, role } = await req.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Bad Request: name, email, and role are required.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await adminDb
      .collection('users')
      .where('email', '==', email)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { message: 'Bad Request: A user with this email already exists.' },
        { status: 400 }
      );
    }

    // Create a custom claim for this user so they can be identified as having been invited
    const newUserRef = adminDb.collection('users').doc();
    const newUserId = newUserRef.id;

    const newUserData = {
      userId: newUserId,
      name,
      email,
      role,
      dealershipIds: [],
      avatarUrl: 'https://images.unsplash.com/photo-1515086828834-023d61380316?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxzdGVlcmluZyUyMHdoZWVsfGVufDB8fHx8MTc2ODkxMTAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      xp: 0,
      isPrivate: false,
      isPrivateFromOwner: false,
      memberSince: new Date().toISOString(),
      subscriptionStatus: 'active',
      phone: phone || undefined,
    };

    // Set custom claims so the user can access their role
    await adminAuth.setCustomUserClaims(newUserId, { 
      role,
      initialized: false,
    });

    // Save the user document
    await newUserRef.set(newUserData);

    return NextResponse.json(newUserData, { status: 201 });
  } catch (error: any) {
    console.error('[API CreateUser] Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    if (error && error.code === 'admin/not-initialized') {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    const errorResponse: { message: string; code?: string } = {
      message: error.message || 'Internal Server Error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
    };

    if (error.code && error.code.startsWith('auth/')) {
      errorResponse.message = `Unauthorized: ${error.message}`;
      return NextResponse.json(errorResponse, { status: 401 });
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
