
import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/firebase/admin';
import { EmailInvitation } from '@/lib/definitions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token?: string }> }
) {
  const authorization = req.headers.get('authorization');
  
  if (!authorization) {
    return NextResponse.json({ message: 'Unauthorized: Missing token.' }, { status: 401 });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const adminDb = getAdminDb();
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userEmail = decodedToken.email;

    if (!userEmail) {
        return NextResponse.json({ message: 'Forbidden: Auth token is missing email claim.' }, { status: 403 });
    }

    // Use Admin SDK to query for an unclaimed invitation for this email
    const invitationsRef = adminDb.collection('emailInvitations');
    const q = invitationsRef.where('email', '==', userEmail.toLowerCase()).where('claimed', '==', false).limit(1);
    
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return NextResponse.json({ message: 'No pending invitation found for this user.' }, { status: 404 });
    }
    
    const invitationDoc = querySnapshot.docs[0];
    const invitationData = invitationDoc.data() as EmailInvitation;

    // Return the full invitation object, including its ID (the token)
    return NextResponse.json({ ...invitationData, token: invitationDoc.id });

  } catch (error: any) {
    console.error('[API ResolveInvitation] Error:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });

    if (error && error.code === 'admin/not-initialized') {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    if (error.message && error.message.includes('Firebase Admin not initialized')) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    if (error.code && error.code.startsWith('auth/')) {
        return NextResponse.json({
            code: error.code,
            message: `Unauthorized: ${error.message}`
        }, { status: 401 });
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
