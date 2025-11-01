import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { razorpay, verifyWebhookSignature } from "@/lib/razorpay";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature");

    if (!razorpay) {
      console.error("Razorpay is not configured");
      return NextResponse.json(
        { error: "Razorpay is not configured" },
        { status: 500 }
      );
    }

    // Webhook secret is required for Razorpay
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.warn("RAZORPAY_WEBHOOK_SECRET is not configured - webhooks will not work.");
      return NextResponse.json(
        { error: "Webhook secret is not configured. Please set RAZORPAY_WEBHOOK_SECRET." },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      signature,
      body,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error("Razorpay webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    // Handle the event
    switch (eventType) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        await handlePaymentCaptured(payment);
        break;
      }

      case "subscription.created": {
        const subscription = event.payload.subscription.entity;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "subscription.charged": {
        const subscription = event.payload.subscription.entity;
        await handleSubscriptionCharged(subscription);
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "order.paid": {
        const order = event.payload.order.entity;
        await handleOrderPaid(order);
        break;
      }

      default:
        console.log(`Unhandled Razorpay event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment) {
  try {
    // Get order details from payment notes or fetch from Razorpay
    const orderId = payment.order_id;
    let order;

    try {
      order = await razorpay.orders.fetch(orderId);
    } catch (error) {
      console.error("Error fetching order from Razorpay:", error);
      return;
    }

    const userId = order.notes?.userId;
    const tier = order.notes?.tier;

    if (!userId || !tier) {
      console.error("Missing userId or tier in order notes", order.notes);
      return;
    }

    // Calculate subscription period (1 month from now)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Create or update subscription
    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        // Store Razorpay order ID in transactionHash field for reference
        transactionHash: orderId,
      },
      update: {
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: orderId,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    console.log(`Subscription created/updated for user ${userId}: ${tier} via Razorpay`);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

async function handleOrderPaid(order) {
  try {
    // This is similar to payment.captured but triggered when order is paid
    const userId = order.notes?.userId;
    const tier = order.notes?.tier;

    if (!userId || !tier) {
      console.error("Missing userId or tier in order notes", order.notes);
      return;
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: order.id,
      },
      update: {
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: order.id,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    console.log(`Subscription activated for user ${userId}: ${tier} via Razorpay`);
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}

async function handleSubscriptionCreated(subscription) {
  try {
    // Handle Razorpay subscription creation (for recurring subscriptions)
    // For now, we're using one-time payments, but this can be extended
    console.log("Subscription created event received:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription created:", error);
  }
}

async function handleSubscriptionCharged(subscription) {
  try {
    // Handle recurring subscription charge
    // This would be useful if you switch to Razorpay subscriptions instead of one-time orders
    console.log("Subscription charged event received:", subscription.id);
  } catch (error) {
    console.error("Error handling subscription charged:", error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    // Handle subscription cancellation
    // For now, we'll need to find the subscription by some identifier
    // You might need to store razorpaySubscriptionId in the database
    console.log("Subscription cancelled event received:", subscription.id);
    
    // Update subscription status to canceled
    // Note: This requires storing razorpaySubscriptionId in the Subscription model
    // For now, this is a placeholder
  } catch (error) {
    console.error("Error handling subscription cancelled:", error);
  }
}

