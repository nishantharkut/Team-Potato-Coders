"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { uploadFileToCloudinary, getUserResumeFolder } from "@/lib/cloudinary";
import { randomBytes } from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a unique public link ID for resume sharing
 */
function generatePublicLinkId() {
  return randomBytes(16).toString("hex");
}

/**
 * Create a new named resume for user
 */
async function createNamedResume(userId, title) {
  const publicLinkId = generatePublicLinkId();
  
  const resume = await db.resume.create({
    data: {
      userId,
      title,
      publicLinkId,
    },
  });

  return resume;
}

/**
 * Get resume by ID (for editing/viewing specific resume)
 */
async function getResumeById(resumeId, userId) {
  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId, // Ensure user owns this resume
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
      },
    },
  });

  return resume;
}

/**
 * Save resume content - creates a new version for a specific resume
 * If no file is provided, creates a text-only version
 */
export async function saveResume(content, resumeId, file = null, fileName = null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (!resumeId) {
    throw new Error("Resume ID is required");
  }

  try {
    // Get the specific resume (verify ownership)
    const resume = await getResumeById(resumeId, user.id);
    if (!resume) {
      throw new Error("Resume not found or unauthorized");
    }

    // Get current version number
    const currentVersions = await db.resumeVersion.findMany({
      where: { resumeId: resume.id },
      orderBy: { versionNumber: "desc" },
      take: 1,
    });

    const nextVersionNumber =
      currentVersions.length > 0
        ? currentVersions[0].versionNumber + 1
        : 1;

    // Upload file to Cloudinary if provided
    let cloudinaryUrl = null;
    if (file) {
      const folder = getUserResumeFolder(user.id);
      const uploadResult = await uploadFileToCloudinary(file, folder);
      cloudinaryUrl = uploadResult.url;
    }

    // Mark all previous versions as not current
    await db.resumeVersion.updateMany({
      where: { resumeId: resume.id },
      data: { isCurrent: false },
    });

    // Create new version
    const newVersion = await db.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: nextVersionNumber,
        isCurrent: true,
        content: content || "",
        cloudinaryUrl,
        fileName: fileName || null,
      },
    });

    // Update resume to point to current version
    await db.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: newVersion.id },
    });

    revalidatePath("/resume");
    return {
      resume,
      version: newVersion,
    };
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error("Failed to save resume");
  }
}

/**
 * Create a new named resume with an initial version
 */
export async function createResumeWithUpload(title, file, extractedContent = null, fileName = null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (!title || title.trim().length === 0) {
    throw new Error("Resume title is required");
  }

  try {
    // Check if resume with this title already exists
    const existingResume = await db.resume.findUnique({
      where: {
        userId_title: {
          userId: user.id,
          title: title.trim(),
        },
      },
    });

    if (existingResume) {
      throw new Error(`A resume with the title "${title}" already exists. Please use a different title.`);
    }

    // Create new named resume
    const resume = await createNamedResume(user.id, title.trim());

    // Create first version (version 1)
    const versionNumber = 1;

    // Get file name
    let finalFileName = fileName || "resume.pdf";
    if (file instanceof File && !fileName) {
      finalFileName = file.name;
    }

    // Upload file to Cloudinary
    const folder = getUserResumeFolder(user.id);
    const uploadResult = await uploadFileToCloudinary(file, folder);

    // Create first version
    const newVersion = await db.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber,
        isCurrent: true,
        content: extractedContent || "",
        cloudinaryUrl: uploadResult.url,
        fileName: finalFileName,
      },
    });

    // Update resume to point to current version
    await db.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: newVersion.id },
    });

    revalidatePath("/resume");
    return {
      resume,
      version: newVersion,
    };
  } catch (error) {
    console.error("Error creating resume with upload:", error);
    throw new Error(error.message || "Failed to create resume");
  }
}

/**
 * Upload a new version to an existing resume
 */
export async function uploadResumeVersion(resumeId, file, extractedContent = null, fileName = null) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  if (!resumeId) {
    throw new Error("Resume ID is required");
  }

  try {
    // Get the specific resume (verify ownership)
    const resume = await getResumeById(resumeId, user.id);
    if (!resume) {
      throw new Error("Resume not found or unauthorized");
    }

    // Get next version number
    const currentVersions = await db.resumeVersion.findMany({
      where: { resumeId: resume.id },
      orderBy: { versionNumber: "desc" },
      take: 1,
    });

    const nextVersionNumber =
      currentVersions.length > 0
        ? currentVersions[0].versionNumber + 1
        : 1;

    // Get file name
    let finalFileName = fileName || "resume.pdf";
    if (file instanceof File && !fileName) {
      finalFileName = file.name;
    }

    // Upload file to Cloudinary
    const folder = getUserResumeFolder(user.id);
    const uploadResult = await uploadFileToCloudinary(file, folder);

    // Mark all previous versions as not current
    await db.resumeVersion.updateMany({
      where: { resumeId: resume.id },
      data: { isCurrent: false },
    });

    // Create new version
    const newVersion = await db.resumeVersion.create({
      data: {
        resumeId: resume.id,
        versionNumber: nextVersionNumber,
        isCurrent: true,
        content: extractedContent || "",
        cloudinaryUrl: uploadResult.url,
        fileName: finalFileName,
      },
    });

    // Update resume to point to current version
    await db.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: newVersion.id },
    });

    revalidatePath("/resume");
    return {
      resume,
      version: newVersion,
    };
  } catch (error) {
    console.error("Error uploading resume version:", error);
    throw new Error(error.message || "Failed to upload resume version");
  }
}

/**
 * Get all resumes for the authenticated user
 */
export async function getAllResumes() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const resumes = await db.resume.findMany({
    where: { userId: user.id },
    include: {
      versions: {
        where: { isCurrent: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { versions: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return resumes.map((resume) => ({
    id: resume.id,
    title: resume.title,
    publicLinkId: resume.publicLinkId,
    currentVersion: resume.versions[0] || null,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
    versionCount: resume._count.versions,
  }));
}

/**
 * Get a specific resume by ID with all its versions
 */
export async function getResume(resumeId) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const resume = await getResumeById(resumeId, user.id);
  if (!resume) {
    return null;
  }

  const currentVersion = resume.versions.find((v) => v.isCurrent) || resume.versions[0] || null;

  return {
    id: resume.id,
    title: resume.title,
    publicLinkId: resume.publicLinkId,
    currentVersion,
    versions: resume.versions,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}

/**
 * Get all versions for a specific resume
 */
export async function getResumeVersions(resumeId) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const resume = await getResumeById(resumeId, user.id);
  if (!resume) {
    return null;
  }

  return {
    resume: {
      id: resume.id,
      title: resume.title,
      publicLinkId: resume.publicLinkId,
    },
    versions: resume.versions,
  };
}

/**
 * Get a specific resume version by ID
 */
export async function getResumeVersion(versionId) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const version = await db.resumeVersion.findUnique({
    where: { id: versionId },
    include: {
      resume: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!version || version.resume.userId !== user.id) {
    throw new Error("Version not found or unauthorized");
  }

  return version;
}

/**
 * Set a specific version as the current version
 */
export async function setCurrentVersion(versionId) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // Verify the version belongs to the user
  const version = await db.resumeVersion.findUnique({
    where: { id: versionId },
    include: {
      resume: true,
    },
  });

  if (!version || version.resume.userId !== user.id) {
    throw new Error("Version not found or unauthorized");
  }

  try {
    // Mark all versions as not current
    await db.resumeVersion.updateMany({
      where: { resumeId: version.resumeId },
      data: { isCurrent: false },
    });

    // Set this version as current
    await db.resumeVersion.update({
      where: { id: versionId },
      data: { isCurrent: true },
    });

    // Update resume to point to current version
    await db.resume.update({
      where: { id: version.resumeId },
      data: { currentVersionId: versionId },
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error setting current version:", error);
    throw new Error("Failed to set current version");
  }
}

/**
 * Get resume by public link ID (public access, no auth required)
 */
export async function getResumeByPublicLink(publicLinkId) {
  const resume = await db.resume.findUnique({
    where: { publicLinkId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
        },
      },
      versions: {
        where: { isCurrent: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!resume || resume.versions.length === 0) {
    return null;
  }

  return {
    resume,
    currentVersion: resume.versions[0],
    user: resume.user,
  };
}

/**
 * Get public link for a specific resume
 */
export async function getPublicLink(resumeId) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  const resume = await getResumeById(resumeId, user.id);
  if (!resume) {
    return null;
  }

  return {
    publicLinkId: resume.publicLinkId,
    publicUrl: `${process.env.NEXT_PUBLIC_APP_URL || ""}/resume/public/${resume.publicLinkId}`,
  };
}

/**
 * Improve content with AI (existing function, keeping for compatibility)
 */
export async function improveWithAI({ current, type }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
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
