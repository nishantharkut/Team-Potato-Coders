import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { db } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatHistory = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user information for context
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
        skills: true,
        experience: true,
        bio: true,
      },
    });

    // Build system prompt with application features
    const systemPrompt = `You are a helpful AI assistant for Sensai, an AI-powered career development platform. Your role is to help users with career guidance, interview preparation, resume building, and cover letter creation.

About Sensai's Features:
1. AI-Powered Career Guidance: Personalized career advice and insights powered by advanced AI technology
2. Interview Preparation: Practice with role-specific questions and get instant feedback to improve performance
3. Industry Insights: Real-time industry trends, salary data, and market analysis
4. Smart Resume Creation: Generate ATS-optimized resumes with AI assistance
5. Cover Letter Generator: Create professional, tailored cover letters
6. Customized Learning Paths: Personalized learning recommendations based on career goals
7. Career Growth Strategies: Proven strategies to accelerate career growth
8. Mental Health Support: Resources and support for maintaining a healthy work-life balance

${user ? `Current User Context:
- Industry: ${user.industry || "Not specified"}
- Experience: ${user.experience || "Not specified"} years
- Skills: ${user.skills?.join(", ") || "Not specified"}
- Background: ${user.bio || "Not specified"}
` : ""}

Instructions:
- Be helpful, friendly, and professional
- Answer questions about Sensai's features and how to use them
- Provide general career advice and guidance
- Reference the user's industry and skills when relevant
- If asked about features, explain how they work and where to find them
- Keep responses concise but informative
- You can discuss resume building, interview prep, cover letters, industry insights, and career development strategies
- IMPORTANT: Write in plain text only. Do NOT use markdown formatting such as **bold**, *italic*, # headers, bullet points with markdown syntax, code blocks, links with markdown syntax, or any other markdown elements
- Use regular text formatting only - write naturally as if having a text conversation
- If you need to emphasize something, use capitalization or natural language rather than markdown`;

    // Build messages array with system prompt and chat history
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    return NextResponse.json({
      message: aiResponse,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
