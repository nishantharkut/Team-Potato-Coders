"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";

/**
 * Get user's current subscription
 */
export async function getUserSubscription() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) throw new Error("User not found");

  // Return subscription or create default Free tier
  if (!user.subscription) {
    return await db.subscription.create({
      data: {
        userId: user.id,
        tier: "Free",
        status: "active",
      },
    });
  }

  return user.subscription;
}

/**
 * Create or update Stripe customer
 */
export async function getOrCreateStripeCustomer(userId, email, name) {
  if (!stripe) {
    throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  // If user already has a Stripe customer ID, return it
  if (user?.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      if (!customer.deleted) {
        return customer.id;
      }
    } catch (error) {
      // Customer doesn't exist in Stripe, create a new one
    }
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  });

  // Update user with Stripe customer ID
  await db.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

/**
 * Update subscription status from Stripe webhook
 */
export async function updateSubscriptionFromStripe(
  stripeSubscriptionId,
  subscriptionData
) {
  const subscription = await db.subscription.findUnique({
    where: { stripeSubscriptionId },
    include: { user: true },
  });

  if (!subscription) {
    // Create new subscription if it doesn't exist
    const user = await db.user.findFirst({
      where: { stripeCustomerId: subscriptionData.customer },
    });

    if (!user) {
      throw new Error(`User not found for customer ${subscriptionData.customer}`);
    }

    return await db.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId,
        stripePriceId: subscriptionData.items.data[0].price.id,
        tier: getTierFromPriceId(subscriptionData.items.data[0].price.id),
        status: subscriptionData.status,
        currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
        currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
        cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
        canceledAt: subscriptionData.canceled_at
          ? new Date(subscriptionData.canceled_at * 1000)
          : null,
      },
    });
  }

  // Update existing subscription
  return await db.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      stripePriceId: subscriptionData.items.data[0].price.id,
      tier: getTierFromPriceId(subscriptionData.items.data[0].price.id),
      status: subscriptionData.status,
      currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
      currentPeriodEnd: new Date(subscriptionData.current_period_end * 1000),
      cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
      canceledAt: subscriptionData.canceled_at
        ? new Date(subscriptionData.canceled_at * 1000)
        : null,
    },
  });
}

/**
 * Helper to get tier from Stripe price ID
 */
function getTierFromPriceId(priceId) {
  const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC;
  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
  
  if (priceId === basicPriceId) return "Basic";
  if (priceId === proPriceId) return "Pro";
  return "Free";
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    throw new Error("No active subscription found");
  }

  const subscription = user.subscription;

  // Handle cancellation based on payment method
  if (subscription.paymentMethod === "stripe" && subscription.stripeSubscriptionId) {
    if (!stripe) {
      throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.");
    }

    // Cancel in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update in database
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    revalidatePath("/settings/subscription");
    return updated;
  } else if (subscription.paymentMethod === "web3") {
    // For Razorpay and Web3 (one-time payments), just mark for cancellation at period end
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    revalidatePath("/settings/subscription");
    return updated;
  } else {
    throw new Error("Unsupported payment method for cancellation");
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription) {
    throw new Error("No subscription found");
  }

  const subscription = user.subscription;

  // Handle reactivation based on payment method
  if (subscription.paymentMethod === "stripe" && subscription.stripeSubscriptionId) {
    if (!stripe) {
      throw new Error("Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.");
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update in database
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });

    revalidatePath("/settings/subscription");
    return updated;
  } else if (subscription.paymentMethod === "web3") {
    // For Razorpay and Web3, just remove cancellation flag
    const updated = await db.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });

    revalidatePath("/settings/subscription");
    return updated;
  } else {
    throw new Error("Unsupported payment method for reactivation");
  }
}

