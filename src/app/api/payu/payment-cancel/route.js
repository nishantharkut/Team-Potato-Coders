import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // User cancelled the payment
    return NextResponse.redirect(
      new URL("/subscription/cancel?reason=user_cancelled", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("PayU payment cancel handler error:", error);
    return NextResponse.redirect(
      new URL("/subscription/cancel", 
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  }
}

// PayU can also send GET requests
export async function GET(req) {
  return POST(req);
}

