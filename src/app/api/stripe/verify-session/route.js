import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";

/**
 * Verify checkout session and create/update subscription without webhooks
 * This is called from the success page after checkout
 */
export async function POST(req) {
  try {
    const authSession = await auth();
    const userId = authSession?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    // Verify the session is completed
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify the session belongs to this user (safety check)
    const sessionUserId = session.metadata?.userId;
    if (sessionUserId && sessionUserId !== user.id) {
      return NextResponse.json(
        { error: "Session does not belong to this user" },
        { status: 403 }
      );
    }

    const tier = session.metadata?.tier || "Free";
    
    // Extract subscription ID - handle both expanded object and string ID
    const subscriptionId = typeof session.subscription === "string" 
      ? session.subscription 
      : session.subscription?.id || null;
    
    // Extract customer ID - handle both expanded object and string ID
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;

    // Get subscription details if it exists
    let subscriptionData = null;
    if (subscriptionId) {
      // If subscription was expanded, use it directly, otherwise retrieve it
      if (typeof session.subscription === "object" && session.subscription.id) {
        subscriptionData = session.subscription;
        // Still need to expand items if not already expanded
        if (!subscriptionData.items || !subscriptionData.items.data) {
          subscriptionData = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price"],
          });
        }
      } else {
        subscriptionData = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ["items.data.price"],
        });
      }
    }

    // Get the price ID from subscription
    const priceId = subscriptionData?.items?.data?.[0]?.price?.id || null;

    // Create or update subscription in database
    const subscription = await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: tier.charAt(0).toUpperCase() + tier.slice(1), // Capitalize: Basic, Pro
        status: subscriptionData?.status || "active",
        stripeSubscriptionId: subscriptionId || null,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: subscriptionData?.current_period_start
          ? new Date(subscriptionData.current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: subscriptionData?.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
      },
      update: {
        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
        status: subscriptionData?.status || "active",
        stripeSubscriptionId: subscriptionId || null,
        stripePriceId: priceId,
        stripeCustomerId: customerId || null,
        currentPeriodStart: subscriptionData?.current_period_start
          ? new Date(subscriptionData.current_period_start * 1000)
          : undefined,
        currentPeriodEnd: subscriptionData?.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000)
          : undefined,
        cancelAtPeriodEnd: subscriptionData?.cancel_at_period_end || false,
        canceledAt: subscriptionData?.canceled_at
          ? new Date(subscriptionData.canceled_at * 1000)
          : null,
      },
    });

    // Update user's stripeCustomerId if not set
    if (customerId && !user.stripeCustomerId) {
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: "Subscription verified and activated successfully",
    });
  } catch (error) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}

