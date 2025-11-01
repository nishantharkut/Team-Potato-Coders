import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { ethers } from "ethers";

/**
 * POST /api/wallet/link
 * Link a wallet address to the user's account
 */
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { walletAddress, signature, message } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Normalize address to checksum format
    const checksumAddress = ethers.getAddress(walletAddress);

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if wallet is already linked to another account
    // Using findFirst since walletAddress might not be indexed as unique yet if migration hasn't run
    const existingUser = await db.user.findFirst({
      where: { 
        walletAddress: checksumAddress,
        id: { not: user.id } // Exclude current user
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "This wallet is already linked to another account" },
        { status: 409 }
      );
    }

    // If signature and message are provided, verify ownership
    // This ensures the user actually owns the wallet
    if (signature && message) {
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== checksumAddress.toLowerCase()) {
          return NextResponse.json(
            { error: "Signature verification failed. Wallet ownership could not be verified." },
            { status: 400 }
          );
        }
      } catch (verifyError) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    // Update user with wallet address
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { walletAddress: checksumAddress },
    });

    return NextResponse.json({
      success: true,
      walletAddress: updatedUser.walletAddress,
      message: "Wallet linked successfully",
    });
  } catch (error) {
    console.error("Wallet link error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link wallet" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wallet/link
 * Unlink wallet from user account
 */
export async function DELETE(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an active Web3 subscription
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
    });

    if (subscription && subscription.paymentMethod === "web3" && subscription.status === "active") {
      return NextResponse.json(
        { error: "Cannot unlink wallet while you have an active Web3 subscription. Please cancel your subscription first." },
        { status: 400 }
      );
    }

    // Unlink wallet
    await db.user.update({
      where: { id: user.id },
      data: { walletAddress: null },
    });

    return NextResponse.json({
      success: true,
      message: "Wallet unlinked successfully",
    });
  } catch (error) {
    console.error("Wallet unlink error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to unlink wallet" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wallet/link
 * Get user's linked wallet address
 */
export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { walletAddress: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      walletAddress: user.walletAddress || null,
      isLinked: !!user.walletAddress,
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get wallet address" },
      { status: 500 }
    );
  }
}
