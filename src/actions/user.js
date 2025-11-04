"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(
      async (tx) => {
        // Get the user
        let user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error("User not found");
        }

        // First check if industry exists
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        // If industry doesn't exist, create it with default values
        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Now update the user
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      {
        timeout: 10000, // default: 5000
      }
    );

    // Revalidate all pages that use user profile data
    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/resume");
    revalidatePath("/ai-cover-letter");
    revalidatePath("/interview");
    revalidatePath("/settings/subscription");
    
    return { success: true, user: result.updatedUser };
  } catch (error) {
    console.error("Error updating user and industry:", error.message);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        industry: true,
      },
    });

    // If user doesn't exist, they're not onboarded - return false instead of throwing
    if (!user) {
      return {
        isOnboarded: false,
      };
    }

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Return false on error to allow redirect to onboarding
    return {
      isOnboarded: false,
    };
  }
}

export async function getUserProfile() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        industry: true,
        experience: true,
        bio: true,
        skills: true,
      },
    });

    return {
      success: true,
      user: user || null,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      user: null,
    };
  }
}