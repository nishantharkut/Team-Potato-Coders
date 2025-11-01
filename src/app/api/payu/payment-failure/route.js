import { NextResponse } from "next/server";
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
      error: formData.get("error"),
      error_Message: formData.get("error_Message"),
    };

    const payuConfig = getPayUConfig();

    // Verify hash (optional for failure, but good practice)
    if (params.hash) {
      const isValidHash = verifyPayUHash(params, payuConfig.salt);
      if (!isValidHash) {
        console.error("Invalid PayU hash in failure response:", params);
      }
    }

    console.log("PayU payment failed:", params);

    // Redirect to cancel page with error details
    const errorMessage = params.error_Message || params.error || "Payment failed";
    return NextResponse.redirect(
      new URL(`/subscription/cancel?error=${encodeURIComponent(errorMessage)}`, 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("PayU payment failure handler error:", error);
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
    const error = searchParams.get("error") || searchParams.get("error_Message") || "Payment failed";
    return NextResponse.redirect(
      new URL(`/subscription/cancel?error=${encodeURIComponent(error)}`, 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    return NextResponse.redirect(
      new URL("/subscription/cancel?error=processing_error", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }
}

