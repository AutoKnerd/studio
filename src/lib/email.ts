
'use server';

import { Resend } from 'resend';
import { User, Dealership } from './definitions';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.EMAIL_FROM || 'onboarding@autodrive.app';

export async function sendInvitationEmail({
  toEmail,
  inviteUrl,
  inviter,
  dealership,
}: {
  toEmail: string;
  inviteUrl: string;
  inviter: User;
  dealership: Dealership;
}) {
  if (!resend) {
    console.log(`Email sending is disabled. Invite URL for ${toEmail}: ${inviteUrl}`);
    return { success: false, error: 'Email service is not configured. Set RESEND_API_KEY to enable.' };
  }

  const subject = `You're invited to join ${dealership.name} on AutoDrive`;
  const body = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #111;">You're Invited!</h2>
      <p><strong>${inviter.name}</strong> has invited you to join the <strong>${dealership.name}</strong> team on AutoDrive, the AI-powered training platform for automotive professionals.</p>
      <p>Click the link below to create your account and get started:</p>
      <p style="margin: 2rem 0;">
        <a 
          href="${inviteUrl}" 
          style="background-color: #0ea5e9; color: white; padding: 1rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold;"
        >
          Accept Invitation & Join Team
        </a>
      </p>
      <p>If you have any questions, please contact your manager.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
      <p style="font-size: 0.8rem; color: #6b7280;">AutoDrive powered by AutoKnerd</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `AutoDrive <${fromEmail}>`,
      to: [toEmail],
      subject: subject,
      html: body,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: (error as Error).message };
  }
}
