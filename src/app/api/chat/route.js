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
    const systemPrompt = `You are a helpful AI assistant for UpRoot, an AI-powered career development platform. Your role is to help users with career guidance, interview preparation, resume building, and cover letter creation.

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

FORMATTING RULES:
- You can use HTML tags for text formatting: <b> or <strong> for bold text, <i> or <em> for italic text
- Use <b>Resume Building</b> for bold text instead of **Resume Building** or asterisks
- Use <i>important point</i> for italic text instead of *important point* or asterisks
- You can combine them: <b><i>very important</i></b> for bold and italic
- Write naturally as if in a text conversation, but feel free to use HTML formatting tags for emphasis
- Use numbered lists with plain numbers (1. 2. 3.) when listing items
- Use line breaks to separate points
- Example: "Here are some areas to focus on: 1. <b>Resume Building</b> - You can create... 2. <b>Interview Preparation</b> - Preparing for..."
- Only use <b>, <strong>, <i>, and <em> tags - do not use other HTML tags or markdown syntax`;

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

    let aiResponse = completion.choices[0].message.content;

    // Convert markdown to HTML if any slipped through
    // Convert markdown bold (**text** or __text__) to <b> (do this first to avoid conflicts)
    aiResponse = aiResponse.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    aiResponse = aiResponse.replace(/__([^_]+)__/g, '<b>$1</b>');
    // Convert markdown italic (*text* or _text_) to <i> (only single asterisks/underscores)
    // First handle single asterisks that aren't part of double asterisks
    aiResponse = aiResponse.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<i>$1</i>');
    // Then handle single underscores that aren't part of double underscores
    aiResponse = aiResponse.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<i>$1</i>');
    
    // Sanitize HTML - only allow safe formatting tags
    // Remove any HTML tags that aren't b, strong, i, or em
    aiResponse = aiResponse.replace(/<(?!\/?(?:b|strong|i|em)\b)[^>]+>/gi, '');
    
    // Remove markdown headers, code blocks, and links (keeping text only)
    aiResponse = aiResponse.replace(/^#{1,6}\s+/gm, '');
    aiResponse = aiResponse.replace(/```[\s\S]*?```/g, '');
    aiResponse = aiResponse.replace(/`([^`]+)`/g, '$1');
    aiResponse = aiResponse.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

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
