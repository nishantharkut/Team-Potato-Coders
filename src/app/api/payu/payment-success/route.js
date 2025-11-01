import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { verifyPayUHash, getPayUConfig } from "@/lib/payu";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const params = {
      key: formData.get("key"),
      txnid: formData.get("txnid"),
      amount: formData.get("amount"),
      productinfo: formData.get("productinfo"),
      firstname: formData.get("firstname"),
      email: formData.get("email"),
      status: formData.get("status"),
      hash: formData.get("hash"),
      // Additional parameters
      udf1: formData.get("udf1"), // user ID
      udf2: formData.get("udf2"), // tier
      udf3: formData.get("udf3"), // type
    };

    // PayU sends data via POST form data
    const payuConfig = getPayUConfig();

    // Verify hash
    const isValidHash = verifyPayUHash(params, payuConfig.salt);

    if (!isValidHash) {
      console.error("Invalid PayU hash:", params);
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=invalid_hash", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    // Check payment status
    if (params.status !== "success") {
      return NextResponse.redirect(
        new URL(`/subscription/cancel?error=${params.status}`, 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    // Get user ID and tier from udf fields
    const userId = params.udf1;
    const tier = params.udf2;

    if (!userId || !tier) {
      console.error("Missing user ID or tier in payment response");
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=missing_data", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=user_not_found", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    // Calculate subscription period (1 month from now)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Create or update subscription
    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier,
        status: "active",
        paymentMethod: "payu",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${params.txnid}|${params.status}`,
      },
      update: {
        tier,
        status: "active",
        paymentMethod: "payu",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${params.txnid}|${params.status}`,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    console.log(`Subscription created/updated for user ${userId}: ${tier} via PayU`);

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/subscription/success?payment_method=payu", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("PayU payment success handler error:", error);
    return NextResponse.redirect(
      new URL("/subscription/cancel?error=processing_error", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }
}

// PayU can also send GET requests
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      key: searchParams.get("key"),
      txnid: searchParams.get("txnid"),
      amount: searchParams.get("amount"),
      productinfo: searchParams.get("productinfo"),
      firstname: searchParams.get("firstname"),
      email: searchParams.get("email"),
      status: searchParams.get("status"),
      hash: searchParams.get("hash"),
      udf1: searchParams.get("udf1"),
      udf2: searchParams.get("udf2"),
      udf3: searchParams.get("udf3"),
    };

    const payuConfig = getPayUConfig();
    const isValidHash = verifyPayUHash(params, payuConfig.salt);

    if (!isValidHash || params.status !== "success") {
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=invalid_payment", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    const userId = params.udf1;
    const tier = params.udf2;

    if (!userId || !tier) {
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=missing_data", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.redirect(
        new URL("/subscription/cancel?error=user_not_found", 
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
      );
    }

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    await db.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier,
        status: "active",
        paymentMethod: "payu",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${params.txnid}|${params.status}`,
      },
      update: {
        tier,
        status: "active",
        paymentMethod: "payu",
        currentPeriodStart,
        currentPeriodEnd,
        transactionHash: `${params.txnid}|${params.status}`,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return NextResponse.redirect(
      new URL("/subscription/success?payment_method=payu", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("PayU payment success GET handler error:", error);
    return NextResponse.redirect(
      new URL("/subscription/cancel?error=processing_error", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }
}

