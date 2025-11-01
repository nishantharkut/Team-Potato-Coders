import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (
      !allowedTypes.includes(fileType) &&
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".doc") &&
      !fileName.endsWith(".docx") &&
      !fileName.endsWith(".txt")
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, DOC, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    let extractedText = "";

    // Handle different file types
    if (fileName.endsWith(".txt") || fileType === "text/plain") {
      // Plain text file
      extractedText = await file.text();
    } else if (fileName.endsWith(".pdf") || fileType === "application/pdf") {
      // PDF file - use pdf-parse library for reliable text extraction
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text || "";
        
        // If pdf-parse couldn't extract text (likely image-based PDF), fallback to OpenAI Vision
        if (!extractedText || extractedText.trim().length < 50) {
          console.log("PDF text extraction returned minimal text, trying OpenAI Vision API as fallback...");
          
          // Check file size for vision API
          if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
              { error: "PDF appears to be image-based and file is too large for OCR. Please use a text-based PDF or convert to TXT." },
              { status: 400 }
            );
          }

          const base64 = buffer.toString("base64");
          const { default: OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all text from this resume document image. Return ONLY the raw text content, preserving the structure and formatting. Do not add any analysis, commentary, or markdown formatting. Just return the text as-is.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${fileType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 4000,
          });

          extractedText = response.choices[0].message.content || "";
          
          if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
              { error: "Could not extract sufficient text from PDF. The PDF may be image-based or contain unreadable text. Please ensure your PDF contains selectable text or convert it to TXT format." },
              { status: 400 }
            );
          }
        }
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        
        // If pdf-parse fails, try OpenAI Vision as fallback
        try {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json(
              { error: "Failed to extract text from PDF. File may be too large or corrupted. Please try a smaller file or convert to TXT." },
              { status: 400 }
            );
          }

          const base64 = buffer.toString("base64");
          const { default: OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Extract all text from this resume document. Return ONLY the raw text content, preserving the structure and formatting. Do not add any analysis, commentary, or markdown formatting. Just return the text as-is.",
                  },
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${fileType};base64,${base64}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 4000,
          });

          extractedText = response.choices[0].message.content || "";
          
          if (!extractedText || extractedText.trim().length < 50) {
            return NextResponse.json(
              { error: "Failed to extract text from PDF. The PDF may be corrupted, password-protected, or image-only. Please ensure your PDF contains readable text or convert it to TXT format." },
              { status: 500 }
            );
          }
        } catch (fallbackError) {
          console.error("Fallback PDF extraction also failed:", fallbackError);
          return NextResponse.json(
            { error: "Failed to extract text from PDF. Please ensure your PDF contains readable, selectable text or convert it to TXT format." },
            { status: 500 }
          );
        }
      }
    } else if (fileName.endsWith(".docx") || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // DOCX file - try to install mammoth or use alternative
      return NextResponse.json(
        { error: "DOCX support coming soon. Please convert to PDF or TXT for now." },
        { status: 400 }
      );
    } else if (fileName.endsWith(".doc") || fileType === "application/msword") {
      // DOC file - requires special handling
      return NextResponse.json(
        { error: "DOC support coming soon. Please convert to PDF or TXT for now." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from file. Please ensure the file contains readable text." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content: extractedText,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file upload" },
      { status: 500 }
    );
  }
}

