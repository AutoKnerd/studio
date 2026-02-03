
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/firebase/admin';
import { UserRole } from '@/lib/definitions';

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

    const allowedRoles = ['Admin', 'Developer', 'Owner', 'Trainer', 'General Manager', 'manager', 'Service Manager', 'Parts Manager', 'Finance Manager'];
    if (!allowedRoles.includes(userRole)) {
        return NextResponse.json({ message: 'Forbidden: Insufficient permissions to send invitations.' }, { status: 403 });
    }

    const { dealershipId, dealershipName, email, role } = await req.json();

    if (!dealershipId || !dealershipName || !email || !role) {
        return NextResponse.json({ message: 'Bad Request: Missing required invitation details.' }, { status: 400 });
    }

    const invitationRef = adminDb.collection('emailInvitations').doc();
    const invitationToken = invitationRef.id;
    
    const newInvitationData = {
        token: invitationToken,
        dealershipId: dealershipId,
        dealershipName: dealershipName,
        role: role as UserRole,
        email: email.toLowerCase(),
        claimed: false,
        inviterId: userId,
    };

    await invitationRef.set(newInvitationData);
    
    const origin = req.headers.get('origin') || 'http://localhost:9002';
    const inviteUrl = `${origin}/register?token=${invitationToken}`;

    return NextResponse.json({ token: invitationToken, inviteUrl }, { status: 201 });

  } catch (error: any) {
    console.error('[API CreateEmailInvitation] Error:', error);
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
