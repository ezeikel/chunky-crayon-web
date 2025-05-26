'use server';

import { headers } from 'next/headers';
import { db } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getUserId } from './user';

export const createCheckoutSession = async (
  priceId: string,
  mode: 'payment' | 'subscription',
): Promise<{
  id: string;
} | null> => {
  const headersList = await headers();
  const origin = headersList.get('origin');

  const userId = await getUserId('create a checkout session');

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    console.error('User not found.');
    return null;
  }

  // TODO: findUnique instead of findFirst
  const subscription = await db.subscription.findFirst({
    where: {
      user: {
        id: userId,
      },
    },
  });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: `${origin}/account/billing/success`,
    // cancel_url: `${origin}/account/billing`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: userId,

    // send stripe customer id if user already exists in stripe
    customer: user.stripeCustomerId ?? undefined,
    customer_email: subscription ? undefined : user.email,
  });

  return {
    id: stripeSession.id,
  };
};

export const createCustomerPortalSession = async () => {
  const headersList = await headers();
  const origin = headersList.get('origin');

  const userId = await getUserId('create a customer portal session');

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      stripeCustomerId: true,
    },
  });

  if (!user?.stripeCustomerId) {
    console.error('No subscription found for this user.');
    return null;
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/account/billing`,
  });

  return {
    url: portalSession.url,
  };
};

export const getSubscriptionDetails = async (stripeSubscriptionId: string) => {
  const userId = await getUserId('get subscription details');

  if (!userId) {
    console.error('You need to be logged in to get subscription details.');
    return null;
  }

  const subscription = await db.subscription.findFirst({
    where: {
      stripeSubscriptionId,
    },
  });

  if (!subscription) {
    console.error('No subscription found for this user.');
    return null;
  }

  try {
    // get subscription details from Stripe
    const stripeSubscription =
      await stripe.subscriptions.retrieve(stripeSubscriptionId);

    return {
      subscription,
      stripeSubscription,
    };
  } catch (error) {
    console.error('Error fetching subscription details from Stripe:', error);
    return null;
  }
};
