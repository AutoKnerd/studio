'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { getUserById, updateUser } from '@/lib/data.server';
import { getAdminAuth } from '@/firebase/admin';

async function getOrigin(): Promise<string> {
  return (await headers()).get('origin') || 'http://localhost:9002';
}

async function getOrCreateStripeCustomerForUser(userId: string) {
  const stripe = getStripe();
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found.');

  let stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.userId },
    });
    stripeCustomerId = customer.id;
    await updateUser(userId, { stripeCustomerId });
  }

  return { user, stripeCustomerId };
}

export async function createCheckoutSession(userId: string, billingCycle: 'monthly' | 'annual' = 'monthly') {
  const stripe = getStripe();
  if (!userId) {
    throw new Error('User ID is required to create a checkout session.');
  }

  const priceId =
    billingCycle === 'annual'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    throw new Error(
      billingCycle === 'annual'
        ? 'The Stripe annual Price ID is not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL in your .env file.'
        : 'The Stripe monthly Price ID is not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY in your .env file.'
    );
  }

  const origin = await getOrigin();
  const { stripeCustomerId } = await getOrCreateStripeCustomerForUser(userId);

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: { userId },
    });

    if (checkoutSession.url) {
      redirect(checkoutSession.url);
    }

    throw new Error('Could not create Stripe checkout session.');
  } catch (error) {
    console.error('Stripe Error:', error);
    if ((error as any).code === 'resource_missing' && (error as any).param === 'price') {
      throw new Error(
        `The Price ID "${priceId}" set in ${billingCycle === 'annual' ? 'NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL' : 'NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY'} does not exist in your Stripe account. Please create a new recurring Product in your Stripe Dashboard, add a Price to it, and set its ID in the .env file.`
      );
    }
    throw new Error('An unexpected error occurred with Stripe.');
  }
}

export async function createCustomerPortalSession(stripeCustomerId: string) {
    const stripe = getStripe();
    if (!stripeCustomerId) {
        throw new Error("Stripe customer ID is required.");
    }
    const origin = await getOrigin();

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${origin}/profile`,
    });

    if (portalSession.url) {
        redirect(portalSession.url);
    } else {
        throw new Error('Could not create customer portal session.');
    }
}

export async function createIndividualCheckoutSession(idToken: string, billingCycle: 'monthly' | 'annual' = 'monthly') {
  if (!idToken) {
    throw new Error('Authentication required.');
  }

  const stripe = getStripe();
  const priceId =
    billingCycle === 'annual'
      ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    throw new Error(
      billingCycle === 'annual'
        ? 'The Stripe annual Price ID is not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL in your .env file.'
        : 'The Stripe monthly Price ID is not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY in your .env file.'
    );
  }

  const adminAuth = getAdminAuth();
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  const firebaseUid = decodedToken.uid;
  if (!firebaseUid) {
    throw new Error('Authentication required.');
  }

  const origin = await getOrigin();

  // Ensure we have a Stripe customer tied to the user so the billing portal works.
  const { stripeCustomerId } = await getOrCreateStripeCustomerForUser(firebaseUid);

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment/cancel`,
    metadata: {
      firebaseUid,
      planKey: 'individual',
      billingCycle,
    },
  });

  if (checkoutSession.url) {
    redirect(checkoutSession.url);
  }

  throw new Error('Could not create Stripe checkout session.');
}
