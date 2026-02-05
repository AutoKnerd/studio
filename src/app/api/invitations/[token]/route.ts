
import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { EmailInvitation } from '@/lib/definitions';

export async function GET(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  if (!token) {
    return NextResponse.json({ message: 'Invitation token is missing.' }, { status: 400 });
  }

  try {
    const invitationRef = adminDb.collection('emailInvitations').doc(token);
    const docSnap = await invitationRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ message: 'This invitation is invalid or has expired.' }, { status: 404 });
    }

    const invitationData = docSnap.data() as EmailInvitation & { createdAt: Timestamp; expiresAt: Timestamp; };

    if (invitationData.claimed) {
      return NextResponse.json({ message: 'This invitation has already been claimed.' }, { status: 410 });
    }

    if (invitationData.expiresAt && invitationData.expiresAt.toDate() < new Date()) {
        return NextResponse.json({ message: 'This invitation has expired.' }, { status: 410 });
    }

    // Return only the necessary data to the client
    const clientSafeInvitation = {
      token: invitationData.token,
      email: invitationData.email,
      role: invitationData.role,
      dealershipId: invitationData.dealershipId,
      dealershipName: invitationData.dealershipName,
    };

    return NextResponse.json(clientSafeInvitation, { status: 200 });

  } catch (error: any) {
    console.error(`[API GetInvitation] Error for token ${token}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
