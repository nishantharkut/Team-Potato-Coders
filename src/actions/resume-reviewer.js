"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Comprehensive resume review function that analyzes the resume
 * and provides detailed feedback, enhancements, and suggestions
 */
export async function reviewResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      resume: true,
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!user.resume || !user.resume.content) {
    throw new Error("No resume found. Please create a resume first.");
  }

  const resumeContent = user.resume.content;
  const industry = user.industry || "General";
  const experience = user.experience || 0;
  const skills = user.skills || [];

  const prompt = `You are an expert resume reviewer and career advisor. Review the following resume comprehensively and provide detailed feedback.

Resume Content:
${resumeContent}

Candidate Information:
- Industry: ${industry}
- Years of Experience: ${experience}
- Skills: ${skills.join(", ") || "Not specified"}

Your task is to provide a comprehensive review in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "overallScore": <number between 0-100>,
  "atsScore": <number between 0-100>,
  "summary": "<Overall assessment summary (2-3 sentences)>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    {
      "category": "<category like 'Summary', 'Experience', 'Skills', 'Education', etc.>",
      "issue": "<what needs improvement>",
      "suggestion": "<specific suggestion for improvement>",
      "priority": "<'high' or 'medium' or 'low'>"
    }
  ],
  "enhancedSections": {
    "summary": "<improved professional summary>",
    "skills": "<improved skills section with better formatting>"
  },
  "atsOptimization": [
    "<ATS optimization tip 1>",
    "<ATS optimization tip 2>",
    "<ATS optimization tip 3>"
  ],
  "industrySpecificTips": [
    "<industry-specific recommendation 1>",
    "<industry-specific recommendation 2>"
  ],
  "suggestedKeywords": [
    "<missing keyword 1>",
    "<missing keyword 2>",
    "<missing keyword 3>"
  ]
}

Focus on:
1. ATS (Applicant Tracking System) compatibility and optimization
2. Quantifiable achievements and metrics
3. Industry-relevant keywords
4. Clear structure and formatting
5. Impactful action verbs
6. Proper section organization
7. Industry-specific best practices
8. Missing elements that could strengthen the resume

Provide actionable, specific feedback that the user can implement immediately.`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer. Always respond with valid JSON only, no markdown code blocks or additional text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let reviewContent = result.choices[0].message.content?.trim() || "";

    // Remove markdown code blocks if present
    reviewContent = reviewContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let reviewData;
    try {
      reviewData = JSON.parse(reviewContent);
    } catch (parseError) {
      console.error("Failed to parse review JSON:", parseError);
      // Fallback: create a structured response manually
      reviewData = {
        overallScore: 75,
        atsScore: 70,
        summary: "Resume review completed. Please review the suggestions below.",
        strengths: ["Well-structured format", "Clear section organization"],
        improvements: [
          {
            category: "General",
            issue: "Could benefit from more specific feedback",
            suggestion: "Review the resume for quantifiable achievements",
            priority: "medium",
          },
        ],
        enhancedSections: {
          summary: user.resume.content.split("\n")[0] || "Professional summary",
          skills: "Skills section",
        },
        atsOptimization: [
          "Ensure consistent date formatting",
          "Use standard section headings",
          "Include relevant keywords from job descriptions",
        ],
        industrySpecificTips: ["Keep resume updated with industry trends"],
        suggestedKeywords: [],
      };
    }

    // Update resume with ATS score and feedback
    await db.resume.update({
      where: {
        userId: user.id,
      },
      data: {
        atsScore: reviewData.atsScore || null,
        feedback: JSON.stringify(reviewData),
      },
    });

    return reviewData;
  } catch (error) {
    console.error("Error reviewing resume:", error);
    throw new Error("Failed to review resume. Please try again.");
  }
}

/**
 * Get enhanced version of a specific resume section
 */
export async function enhanceResumeSection(sectionName, sectionContent) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `As an expert resume writer, enhance the following ${sectionName} section for a ${user.industry || "professional"} with ${user.experience || 0} years of experience.

Current ${sectionName}:
${sectionContent}

Requirements:
1. Make it more impactful and quantifiable
2. Use strong action verbs
3. Include metrics and achievements where applicable
4. Align with industry best practices
5. Keep it concise but compelling
6. Ensure ATS-friendly formatting
7. Maintain the same format/structure as the original

Return ONLY the enhanced ${sectionName} content, no explanations or additional text.`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const enhancedContent = result.choices[0].message.content?.trim() || sectionContent;
    return enhancedContent;
  } catch (error) {
    console.error("Error enhancing section:", error);
    throw new Error("Failed to enhance section");
  }
}

/**
 * Review uploaded resume content (for file uploads)
 */
export async function reviewUploadedResume(resumeContent) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  if (!resumeContent || resumeContent.trim().length === 0) {
    throw new Error("Resume content is required.");
  }

  const industry = user.industry || "General";
  const experience = user.experience || 0;
  const skills = user.skills || [];

  const prompt = `You are an expert resume reviewer and career advisor. Review the following resume comprehensively and provide detailed feedback.

Resume Content:
${resumeContent}

Candidate Information:
- Industry: ${industry}
- Years of Experience: ${experience}
- Skills: ${skills.join(", ") || "Not specified"}

Your task is to provide a comprehensive review in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "overallScore": <number between 0-100>,
  "atsScore": <number between 0-100>,
  "summary": "<Overall assessment summary (2-3 sentences)>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    {
      "category": "<category like 'Summary', 'Experience', 'Skills', 'Education', etc.>",
      "issue": "<what needs improvement>",
      "suggestion": "<specific suggestion for improvement>",
      "priority": "<'high' or 'medium' or 'low'>"
    }
  ],
  "enhancedSections": {
    "summary": "<improved professional summary>",
    "skills": "<improved skills section with better formatting>"
  },
  "atsOptimization": [
    "<ATS optimization tip 1>",
    "<ATS optimization tip 2>",
    "<ATS optimization tip 3>"
  ],
  "industrySpecificTips": [
    "<industry-specific recommendation 1>",
    "<industry-specific recommendation 2>"
  ],
  "suggestedKeywords": [
    "<missing keyword 1>",
    "<missing keyword 2>",
    "<missing keyword 3>"
  ]
}

Focus on:
1. ATS (Applicant Tracking System) compatibility and optimization
2. Quantifiable achievements and metrics
3. Industry-relevant keywords
4. Clear structure and formatting
5. Impactful action verbs
6. Proper section organization
7. Industry-specific best practices
8. Missing elements that could strengthen the resume

Provide actionable, specific feedback that the user can implement immediately.`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume reviewer. Always respond with valid JSON only, no markdown code blocks or additional text.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    let reviewContent = result.choices[0].message.content?.trim() || "";

    // Remove markdown code blocks if present
    reviewContent = reviewContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let reviewData;
    try {
      reviewData = JSON.parse(reviewContent);
    } catch (parseError) {
      console.error("Failed to parse review JSON:", parseError);
      // Fallback: create a structured response manually
      reviewData = {
        overallScore: 75,
        atsScore: 70,
        summary: "Resume review completed. Please review the suggestions below.",
        strengths: ["Well-structured format", "Clear section organization"],
        improvements: [
          {
            category: "General",
            issue: "Could benefit from more specific feedback",
            suggestion: "Review the resume for quantifiable achievements",
            priority: "medium",
          },
        ],
        enhancedSections: {
          summary: "Professional summary",
          skills: "Skills section",
        },
        atsOptimization: [
          "Ensure consistent date formatting",
          "Use standard section headings",
          "Include relevant keywords from job descriptions",
        ],
        industrySpecificTips: ["Keep resume updated with industry trends"],
        suggestedKeywords: [],
      };
    }

    return reviewData;
  } catch (error) {
    console.error("Error reviewing uploaded resume:", error);
    throw new Error("Failed to review resume. Please try again.");
  }
}

/**
 * Get resume review history/previous feedback
 */
export async function getResumeReview() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const resume = await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!resume || !resume.feedback) {
    return null;
  }

  try {
    return JSON.parse(resume.feedback);
  } catch (error) {
    console.error("Error parsing feedback:", error);
    return null;
  }
}

