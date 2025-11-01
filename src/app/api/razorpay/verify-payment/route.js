import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const crypto = require("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const orderUserId = order.notes?.userId;
    const tier = order.notes?.tier;

    if (!orderUserId || !tier) {
      return NextResponse.json(
        { error: "Invalid order. Missing user information." },
        { status: 400 }
      );
    }

    // Verify the order belongs to the authenticated user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.id !== orderUserId) {
      return NextResponse.json(
        { error: "Order does not belong to authenticated user" },
        { status: 403 }
      );
    }

    // Calculate subscription period (1 month from now)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Create or update subscription
    const subscription = await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${razorpay_order_id}|${razorpay_payment_id}`,
      },
      update: {
        tier,
        status: "active",
        paymentMethod: "razorpay",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${razorpay_order_id}|${razorpay_payment_id}`,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
      message: "Payment verified and subscription activated successfully",
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

