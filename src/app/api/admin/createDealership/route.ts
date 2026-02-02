import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminDb, adminAuth } from '@/firebase/admin';
import { Dealership, Address } from '@/lib/definitions';

export async function POST(req: Request) {
  const authorization = headers().get('Authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Unauthorized: Missing token.' }, { status: 401 });
  }

  const token = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const userDoc = await adminDb.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return NextResponse.json({ message: 'Forbidden: User profile not found.' }, { status: 403 });
    }
    
    const user = userDoc.data();
    const userRole = user?.role;

    // Only allow Admins or Developers to create dealerships
    if (!['Admin', 'Developer'].includes(userRole)) {
        return NextResponse.json({ message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const { dealershipName, address, trainerId } = await req.json();

    if (!dealershipName) {
        return NextResponse.json({ message: 'Bad Request: Dealership name is required.' }, { status: 400 });
    }

    const dealershipRef = adminDb.collection('dealerships').doc();
    const newDealership: Dealership = {
        id: dealershipRef.id,
        name: dealershipName,
        status: 'active',
        address: address as Address | undefined, // Can be optional
        trainerId: trainerId, // Can be optional
    };

    await dealershipRef.set(newDealership);

    return NextResponse.json(newDealership, { status: 201 });

  } catch (error: any) {
    console.error('[API CreateDealership] Error:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error' || error.code === 'auth/id-token-revoked') {
        return NextResponse.json({ message: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
