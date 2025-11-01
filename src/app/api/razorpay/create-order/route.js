import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { razorpay, usdToInr } from "@/lib/razorpay";
import { db } from "@/lib/prisma";

// Tier pricing in USD
const tierPricing = {
  Basic: 9.99,
  Pro: 19.99,
};

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (!tier) {
      return NextResponse.json(
        { error: "Tier is required" },
        { status: 400 }
      );
    }

    const validTiers = ["Basic", "Pro"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'Basic' or 'Pro'" },
        { status: 400 }
      );
    }

    // Check if Razorpay is configured
    if (!razorpay) {
      return NextResponse.json(
        { error: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables." },
        { status: 500 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user details
    const clerkUser = await currentUser();
    const userName = user.name || clerkUser?.firstName || "User";
    const userEmail = user.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "";

    // Get base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    // Calculate amount in INR (paise)
    const usdAmount = tierPricing[tier];
    const amount = usdToInr(usdAmount);

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: "INR",
      receipt: `subscription_${tier}_${user.id}_${Date.now()}`,
      notes: {
        userId: user.id,
        tier: tier,
        email: userEmail,
      },
    };

    const order = await razorpay.orders.create(options);

    // Store order details in database (optional, for tracking)
    // You could create an Order model if needed for better tracking

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      // Include user details for pre-filling payment form
      prefill: {
        name: userName,
        email: userEmail,
      },
      // Callback URLs
      callback_url: `${baseUrl}/api/razorpay/verify-payment`,
      success_url: `${baseUrl}/subscription/success?payment_method=razorpay&order_id=${order.id}`,
      cancel_url: `${baseUrl}/subscription/cancel`,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}

