
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/firebase/admin';
import { Dealership, Address } from '@/lib/definitions';

export async function POST(req: Request) {
  const authorization = req.headers.get('authorization') ?? req.headers.get('Authorization');
  
  if (!authorization) {
    return NextResponse.json({ message: 'Unauthorized: Missing token.' }, { status: 401 });
  }

  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match || !match[1]) {
      return NextResponse.json({ message: 'Unauthorized: Invalid token format.' }, { status: 401 });
  }
  const token = match[1].trim();

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
    if (error.code && error.code.startsWith('auth/')) {
        return NextResponse.json({
            code: error.code,
            message: `Unauthorized: ${error.message}`
        }, { status: 401 });
    }
    
    const errorResponse: { message: string, code?: string, stack?: string } = {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_SERVER_ERROR',
    };

    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
