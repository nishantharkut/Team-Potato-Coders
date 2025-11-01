"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function saveResume(content, title, resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resumeData = {
      userId: user.id,
      content,
      title: title || "My Resume",
    };

    let resume;
    if (resumeId) {
      // Update existing resume
      resume = await db.resume.update({
        where: { id: resumeId },
        data: resumeData,
      });
    } else {
      // Create new resume
      resume = await db.resume.create({
        data: resumeData,
      });
    }

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

export async function getResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  if (resumeId) {
    return await db.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });
  }

  // Return the most recently updated resume if no ID specified
  return await db.resume.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getAllResumes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function deleteResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    await db.resume.delete({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw new Error("Failed to delete resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const improvedContent = result.choices[0].message.content?.trim() || "";
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
