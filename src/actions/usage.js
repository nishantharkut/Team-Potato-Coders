"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Feature limits based on subscription tier
 */
const TIER_LIMITS = {
  Free: {
    coverLetter: 3,
    quiz: 5,
    resume: 1,
    chatbot: 50,
    scheduledCall: 2,
  },
  Basic: {
    coverLetter: 10,
    quiz: Infinity,
    resume: Infinity,
    chatbot: Infinity,
    scheduledCall: 5,
  },
  Pro: {
    coverLetter: Infinity,
    quiz: Infinity,
    resume: Infinity,
    chatbot: Infinity,
    scheduledCall: Infinity,
  },
};

/**
 * Feature name mapping
 */
const FEATURE_MAP = {
  coverLetter: "coverLetter",
  quiz: "quiz",
  resume: "resume",
  chatbot: "chatbot",
  scheduledCall: "scheduledCall",
};

/**
 * Get user's current subscription tier
 * Defaults to "Free" if no subscription exists
 * @param {string} userId - User's database ID (not Clerk ID)
 */
async function getUserTier(userId) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return "Free";
    }

    // If subscription model doesn't exist yet, default to Free
    if (!user.subscription) {
      return "Free";
    }

    // Return tier from subscription, or default to Free
    return user.subscription?.tier || "Free";
  } catch (error) {
    // If subscription relation doesn't exist, default to Free
    console.warn("Error getting user tier, defaulting to Free:", error.message);
    return "Free";
  }
}

/**
 * Get usage for a specific feature for the current month
 * @param {string} userId - User's database ID (not Clerk ID)
 */
async function getCurrentUsage(userId, featureName) {
  try {
    // Get current month start
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Try to get usage from UsageTracking model
    // If model doesn't exist, count from actual records
    try {
      const usage = await db.usageTracking.findUnique({
        where: {
          userId_feature_month: {
            userId: userId,
            feature: featureName,
            month: monthStart,
          },
        },
      });
      return usage?.count || 0;
    } catch (error) {
      // UsageTracking model doesn't exist, count from actual records
      if (featureName === "coverLetter") {
        const count = await db.coverLetter.count({
          where: {
            userId,
            createdAt: { gte: monthStart },
          },
        });
        return count;
      }
      if (featureName === "quiz") {
        const count = await db.assessment.count({
          where: {
            userId,
            createdAt: { gte: monthStart },
          },
        });
        return count;
      }
      if (featureName === "resume") {
        // Resumes are updated, not created multiple times
        // Check if user has a resume
        const resume = await db.resume.findUnique({
          where: { userId },
        });
        return resume ? 1 : 0;
      }
      if (featureName === "scheduledCall") {
        const count = await db.scheduledCall.count({
          where: {
            userId,
            createdAt: { gte: monthStart },
          },
        });
        return count;
      }
      // For chatbot, we can't track from database yet
      return 0;
    }
  } catch (error) {
    console.error("Error getting usage:", error);
    return 0;
  }
}

/**
 * Increment usage for a feature
 * @param {string} userId - User's database ID (not Clerk ID)
 */
async function incrementUsage(userId, featureName) {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Try to use UsageTracking model if it exists
    try {
      await db.usageTracking.upsert({
        where: {
          userId_feature_month: {
            userId: userId,
            feature: featureName,
            month: monthStart,
          },
        },
        create: {
          userId,
          feature: featureName,
          month: monthStart,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });
    } catch (error) {
      // UsageTracking model doesn't exist yet
      // Usage will be tracked via actual records (CoverLetter, Assessment, etc.)
      // This is fine - we count from records in getCurrentUsage
    }
  } catch (error) {
    console.error("Error incrementing usage:", error);
    // Don't throw error, just log it
  }
}

/**
 * Check if user can use a feature and increment usage if allowed
 * @param {string} featureName - Name of the feature (coverLetter, quiz, resume, chatbot, scheduledCall)
 * @throws {Error} If user has exceeded their limit
 */
export async function useFeature(featureName) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user from database to get their ID
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get user's tier
  const tier = await getUserTier(user.id);
  
  // Get limits for this tier
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.Free;
  const limit = limits[featureName];

  // If unlimited, allow and don't track
  if (limit === Infinity) {
    await incrementUsage(user.id, featureName);
    return;
  }

  // Get current usage
  const currentUsage = await getCurrentUsage(user.id, featureName);

  // Check if limit exceeded
  if (currentUsage >= limit) {
    throw new Error(
      `You have reached your monthly limit of ${limit} ${featureName}${limit === 1 ? "" : "s"}. ` +
      `Please upgrade your plan to continue using this feature.`
    );
  }

  // Increment usage
  await incrementUsage(user.id, featureName);
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = await getUserTier(user.id);
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.Free;

  const usage = {
    coverLetters: {
      used: await getCurrentUsage(user.id, "coverLetter"),
      limit: limits.coverLetter,
    },
    interviewQuizzes: {
      used: await getCurrentUsage(user.id, "quiz"),
      limit: limits.quiz,
    },
    resumes: {
      used: await getCurrentUsage(user.id, "resume"),
      limit: limits.resume,
    },
    chatbotMessages: {
      used: await getCurrentUsage(user.id, "chatbot"),
      limit: limits.chatbot,
    },
    scheduledCalls: {
      used: await getCurrentUsage(user.id, "scheduledCall"),
      limit: limits.scheduledCall,
    },
  };

  return {
    tier,
    usage,
  };
}

/**
 * Check if user can use a feature without incrementing usage
 */
export async function canUseFeature(featureName) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return false;
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const tier = await getUserTier(user.id);
    const limits = TIER_LIMITS[tier] || TIER_LIMITS.Free;
    const limit = limits[featureName];

    if (limit === Infinity) {
      return true;
    }

    const currentUsage = await getCurrentUsage(user.id, featureName);
    return currentUsage < limit;
  } catch (error) {
    console.error("Error checking feature usage:", error);
    return false;
  }
}
