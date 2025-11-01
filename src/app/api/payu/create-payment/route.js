import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { usdToInr, generatePayUHash, getPayUConfig } from "@/lib/payu";

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

    const payuConfig = getPayUConfig();
    if (!payuConfig.key || !payuConfig.salt) {
      return NextResponse.json(
        { error: "PayU is not configured. Please set PAYU_KEY and PAYU_SALT in your environment variables." },
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
    const userPhone = clerkUser?.phoneNumbers?.[0]?.phoneNumber || "";

    // Get base URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    // Calculate amount in INR (in smallest currency unit - paise)
    const usdAmount = tierPricing[tier];
    const amount = usdToInr(usdAmount);

    // Generate unique transaction ID
    const txnid = `UPROOT_${user.id}_${Date.now()}`;

    // Prepare payment parameters
    const paymentParams = {
      key: payuConfig.key,
      txnid: txnid,
      amount: amount.toString(),
      productinfo: `${tier} Subscription Plan`,
      firstname: userName.split(" ")[0] || "User",
      lastname: userName.split(" ").slice(1).join(" ") || "",
      email: userEmail,
      phone: userPhone.replace(/[^0-9]/g, "") || "0000000000",
      surl: `${baseUrl}/api/payu/payment-success`,
      furl: `${baseUrl}/api/payu/payment-failure`,
      curl: `${baseUrl}/api/payu/payment-cancel`,
      hash: "", // Will be generated below
      // Additional parameters
      service_provider: "payu_paisa",
      udf1: user.id, // Store user ID
      udf2: tier, // Store tier
      udf3: "subscription", // Store type
    };

    // Generate hash
    paymentParams.hash = generatePayUHash(paymentParams, payuConfig.salt);

    // Store transaction details in database (optional - for tracking)
    // You could create a PaymentTransaction model if needed

    return NextResponse.json({
      paymentParams,
      actionUrl: `${payuConfig.baseUrl}/_payment`,
      success: true,
    });
  } catch (error) {
    console.error("PayU payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create PayU payment" },
      { status: 500 }
    );
  }
}

