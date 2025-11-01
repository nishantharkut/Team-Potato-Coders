"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ELEVENLABS_PHONE_NUMBER = process.env.ELEVENLABS_PHONE_NUMBER;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

export async function scheduleCall(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const elevenBase = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io/v1";
    const elevenKey = process.env.ELEVENLABS_API_KEY;

    if (!elevenKey) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }

    // Convert scheduled time to Unix timestamp
    const scheduledTimeUnix = Math.floor(new Date(data.scheduledTime).getTime() / 1000);

    // Step 1: Get phone number ID from ElevenLabs
    const phoneNumbersRes = await fetch(`${elevenBase}/phone-numbers`, {
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
    });

    if (!phoneNumbersRes.ok) {
      throw new Error("Failed to fetch phone numbers from ElevenLabs");
    }

    const phoneNumbers = await phoneNumbersRes.json();
    const matchedPhone = phoneNumbers.find(
      (p) => p.phone_number === ELEVENLABS_PHONE_NUMBER
    );

    if (!matchedPhone) {
      throw new Error("Outbound phone not found in ElevenLabs");
    }

    const agentPhoneNumberId = matchedPhone.phone_number_id;

    // Step 2: Submit batch call to ElevenLabs (they handle the scheduling)
    const batchCallRes = await fetch(`${elevenBase}/batch-calling/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
      body: JSON.stringify({
        call_name: `${data.recipientName || "Call"} - ${data.phoneNumber}`,
        agent_id: ELEVENLABS_AGENT_ID,
        agent_phone_number_id: agentPhoneNumberId,
        scheduled_time_unix: scheduledTimeUnix,
        recipients: [
          {
            phone_number: data.phoneNumber,
            conversation_initiation_client_data: {
              dynamic_variables: {},
            },
          },
        ],
      }),
    });

    if (!batchCallRes.ok) {
      const error = await batchCallRes.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const batchCallData = await batchCallRes.json();
    const batchId = batchCallData.id;

    // Step 3: Save scheduled call in database
    const scheduledCall = await db.scheduledCall.create({
      data: {
        userId: user.id,
        phoneNumber: data.phoneNumber,
        scheduledTime: new Date(data.scheduledTime),
        recipientName: data.recipientName || null,
        status: "scheduled",
        inngestEventId: batchId, // Store ElevenLabs batch ID here
      },
    });

    return { success: true, scheduledCall };
  } catch (error) {
    console.error("Error scheduling call:", error);
    throw new Error(error.message || "Failed to schedule call");
  }
}

export async function getCallLogs() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const callLogs = await db.callLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        scheduledCall: true,
      },
    });

    return callLogs;
  } catch (error) {
    console.error("Error fetching call logs:", error);
    throw new Error("Failed to fetch call logs");
  }
}

export async function getScheduledCalls() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const scheduledCalls = await db.scheduledCall.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["scheduled"],
        },
      },
      orderBy: { scheduledTime: "asc" },
    });

    return scheduledCalls;
  } catch (error) {
    console.error("Error fetching scheduled calls:", error);
    throw new Error("Failed to fetch scheduled calls");
  }
}
