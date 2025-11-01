import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { ethers } from "ethers";

/**
 * POST /api/subscription/web3
 * Process Web3 subscription payment
 * This endpoint verifies the transaction and creates/updates the subscription
 */
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier, transactionHash, walletAddress, amount, currency, network, chainId } = await req.json();

    if (!tier || !transactionHash || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: tier, transactionHash, walletAddress" },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers = ["Basic", "Pro"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be 'Basic' or 'Pro'" },
        { status: 400 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify wallet address matches user's linked wallet
    if (user.walletAddress?.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Wallet address does not match your linked wallet" },
        { status: 400 }
      );
    }

    // Validate Ethereum address
    if (!ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Verify transaction hash format
    if (!/^0x([A-Fa-f0-9]{64})$/.test(transactionHash)) {
      return NextResponse.json(
        { error: "Invalid transaction hash format" },
        { status: 400 }
      );
    }

    // Note: In production, you should verify the transaction on-chain
    // This would involve:
    // 1. Fetching transaction details from a blockchain provider (Infura, Alchemy, etc.)
    // 2. Verifying the transaction was sent from the correct wallet
    // 3. Verifying the amount matches the subscription price
    // 4. Verifying the transaction was successful
    // For now, we'll trust the transaction hash (you should implement proper verification)

    // Calculate subscription period (1 month from now)
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Prepare subscription data with currency/network info
    const subscriptionData = {
      tier,
      status: "active",
      paymentMethod: "web3",
      walletAddress: ethers.getAddress(walletAddress),
      transactionHash,
      currentPeriodStart,
      currentPeriodEnd,
    };

    // Store currency/network info in transaction hash field (format: "hash|currency|network|chainId")
    // In production, you might want to add dedicated fields to the schema for currency and network
    const transactionInfo = currency && network && chainId
      ? `${transactionHash}|${currency}|${network}|${chainId}`
      : transactionHash;
    
    subscriptionData.transactionHash = transactionInfo;

    // Create or update subscription
    let subscription;
    if (user.subscription) {
      // Update existing subscription
      subscription = await db.subscription.update({
        where: { id: user.subscription.id },
        data: {
          ...subscriptionData,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });
    } else {
      // Create new subscription
      subscription = await db.subscription.create({
        data: {
          userId: user.id,
          ...subscriptionData,
        },
      });
    }

    // Extract transaction hash (remove currency/network info if present)
    const txHash = subscription.transactionHash?.split('|')[0] || subscription.transactionHash;

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        tier: subscription.tier,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        currentPeriodEnd: subscription.currentPeriodEnd,
        transactionHash: txHash,
        currency: currency || null,
        network: network || null,
        chainId: chainId || null,
      },
      message: "Subscription activated successfully",
    });
  } catch (error) {
    console.error("Web3 subscription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process Web3 subscription" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/web3/verify
 * Verify a transaction hash and return transaction details
 * This is useful for frontend verification before submitting to the backend
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const transactionHash = searchParams.get("hash");
    const walletAddress = searchParams.get("wallet");

    if (!transactionHash || !walletAddress) {
      return NextResponse.json(
        { error: "Missing transactionHash or walletAddress" },
        { status: 400 }
      );
    }

    // Note: In production, implement actual blockchain verification
    // This would use a provider like Infura or Alchemy to fetch transaction details
    // For now, return a placeholder response
    // Example:
    // const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    // const tx = await provider.getTransaction(transactionHash);
    // const receipt = await provider.getTransactionReceipt(transactionHash);
    // Verify: tx.from === walletAddress, receipt.status === 1, etc.

    return NextResponse.json({
      verified: false, // Set to true after implementing actual verification
      message: "Transaction verification not yet implemented. Please implement blockchain verification.",
    });
  } catch (error) {
    console.error("Transaction verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
