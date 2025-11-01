"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const ELEVENLABS_PHONE_NUMBER = process.env.ELEVENLABS_PHONE_NUMBER;
const ELEVENLABS_AGENT_ID = process.env.ELEVENLABS_AGENT_ID;

// Helper function to update scheduled call status from ElevenLabs batch API
async function updateScheduledCallStatus(batchId) {
  const elevenBase = process.env.ELEVENLABS_BASE_URL || "https://api.elevenlabs.io/v1";
  const elevenKey = process.env.ELEVENLABS_API_KEY;

  if (!elevenKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  try {
    // Get batch call status from ElevenLabs
    const batchStatusRes = await fetch(`${elevenBase}/batch-calling/${batchId}`, {
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenKey,
      },
    });

    if (!batchStatusRes.ok) {
      throw new Error(`Failed to fetch batch status: ${batchStatusRes.statusText}`);
    }

    const batchData = await batchStatusRes.json();
    
    if (!batchData || !batchData.recipients || batchData.recipients.length === 0) {
      throw new Error("Batch data or recipients missing");
    }

    // Find the scheduled call by batchId (inngestEventId)
    const scheduledCall = await db.scheduledCall.findFirst({
      where: { inngestEventId: batchId },
      include: { callLog: true },
    });

    if (!scheduledCall) {
      return { success: false, error: "Scheduled call not found" };
    }

    const recipient = batchData.recipients[0];
    const convId = recipient.conversation_id;
    const recipientStatus = recipient.status;


    // Status mapping matching the reference implementation
    const statusMap = {
      pending: "Upcoming",
      in_progress: "Upcoming",
      completed: "Completed",
      failed: "Failed",
      cancelled: "Cancelled",
      voicemail: "NoResponse",
    };

    let updatedStatus;

    // Handle "initiated" status with 4-minute grace period
    if (recipientStatus === "initiated") {
      const nowUnix = Math.floor(Date.now() / 1000);
      const scheduledTimeUnix = Number(batchData.scheduled_time_unix ?? 0);

      if (scheduledTimeUnix > 0 && nowUnix - scheduledTimeUnix > 240) {
        // If it's been >4 minutes since scheduled and still "initiated" → assume NoResponse
        updatedStatus = "NoResponse";
      } else {
        // Still within grace window → treat as Upcoming
        updatedStatus = "Upcoming";
      }
    } else {
      updatedStatus = statusMap[recipientStatus] || "Upcoming";
    }

    // Fetch conversation transcript if conversation_id exists
    let transcript = null;
    let conversationMessages = [];
    let conversationDuration = null;
    let conversationStartedAt = null;
    let conversationEndedAt = null;

    if (convId) {
      try {
        const convRes = await fetch(`${elevenBase}/conversations/${convId}`, {
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenKey,
          },
        });

        if (convRes.ok) {
          const convData = await convRes.json();
          
          const transcriptData = convData?.transcript ?? [];
          
          // Format conversation messages
          conversationMessages = transcriptData.map((item) => ({
            role: item.role === "agent" ? "agent" : "user",
            message: item.message ?? "",
          }));

          // Format transcript as readable string for storage
          if (conversationMessages.length > 0) {
            transcript = conversationMessages
              .map((msg) => `${msg.role === "agent" ? "Agent" : "User"}: ${msg.message}`)
              .join("\n\n");
          }

          // Try to get duration from conversation data (check multiple possible fields)
          // Check metadata first - this is where ElevenLabs stores it
          if (convData.metadata) {
            // Primary: call_duration_secs (this is the field ElevenLabs uses)
            if (convData.metadata.call_duration_secs !== undefined && convData.metadata.call_duration_secs !== null) {
              conversationDuration = typeof convData.metadata.call_duration_secs === 'number' 
                ? convData.metadata.call_duration_secs 
                : parseInt(convData.metadata.call_duration_secs);
            } 
            // Fallback: other duration fields
            else if (convData.metadata.duration_seconds !== undefined && convData.metadata.duration_seconds !== null) {
              conversationDuration = typeof convData.metadata.duration_seconds === 'number' 
                ? convData.metadata.duration_seconds 
                : parseInt(convData.metadata.duration_seconds);
            } else if (convData.metadata.duration !== undefined && convData.metadata.duration !== null) {
              conversationDuration = typeof convData.metadata.duration === 'number' 
                ? convData.metadata.duration 
                : parseInt(convData.metadata.duration);
            }
            
            // Get start and end times from metadata
            // Calculate end time from start_time_unix_secs + call_duration_secs if available
            if (convData.metadata.start_time_unix_secs) {
              const startUnix = typeof convData.metadata.start_time_unix_secs === 'number' 
                ? convData.metadata.start_time_unix_secs 
                : parseInt(convData.metadata.start_time_unix_secs);
              conversationStartedAt = new Date(startUnix * 1000);
              
              // Calculate end time if we have duration
              if (conversationDuration !== null) {
                conversationEndedAt = new Date((startUnix + conversationDuration) * 1000);
              }
            }
            
            // Use accepted_time_unix_secs if start_time_unix_secs not available
            if (!conversationStartedAt && convData.metadata.accepted_time_unix_secs) {
              const acceptedUnix = typeof convData.metadata.accepted_time_unix_secs === 'number' 
                ? convData.metadata.accepted_time_unix_secs 
                : parseInt(convData.metadata.accepted_time_unix_secs);
              conversationStartedAt = new Date(acceptedUnix * 1000);
              
              // Calculate end time if we have duration
              if (conversationDuration !== null) {
                conversationEndedAt = new Date((acceptedUnix + conversationDuration) * 1000);
              }
            }
            
            // Fallback: check for other timestamp fields
            if (!conversationStartedAt && convData.metadata.started_at) {
              conversationStartedAt = typeof convData.metadata.started_at === 'number' 
                ? new Date(convData.metadata.started_at * 1000)
                : new Date(convData.metadata.started_at);
            }
            if (!conversationEndedAt && convData.metadata.ended_at) {
              conversationEndedAt = typeof convData.metadata.ended_at === 'number'
                ? new Date(convData.metadata.ended_at * 1000)
                : new Date(convData.metadata.ended_at);
            }
          }
          
          // Check analysis field
          if (conversationDuration === null && convData.analysis) {
            if (convData.analysis.duration_seconds !== undefined && convData.analysis.duration_seconds !== null) {
              conversationDuration = convData.analysis.duration_seconds;
            } else if (convData.analysis.duration !== undefined && convData.analysis.duration !== null) {
              conversationDuration = typeof convData.analysis.duration === 'number' 
                ? convData.analysis.duration 
                : parseInt(convData.analysis.duration);
            }
          }
          
          // Check top-level fields as fallback
          if (conversationDuration === null) {
            if (convData.duration_seconds !== undefined && convData.duration_seconds !== null) {
              conversationDuration = convData.duration_seconds;
            } else if (convData.duration !== undefined && convData.duration !== null) {
              conversationDuration = typeof convData.duration === 'number' 
                ? convData.duration 
                : parseInt(convData.duration);
            } else if (convData.call_duration_seconds !== undefined && convData.call_duration_seconds !== null) {
              conversationDuration = convData.call_duration_seconds;
            }
          }

          // Get start and end times from top-level if not in metadata
          if (!conversationStartedAt && convData.started_at) {
            conversationStartedAt = typeof convData.started_at === 'number' 
              ? new Date(convData.started_at * 1000)
              : new Date(convData.started_at);
          }
          if (!conversationEndedAt && convData.ended_at) {
            conversationEndedAt = typeof convData.ended_at === 'number'
              ? new Date(convData.ended_at * 1000)
              : new Date(convData.ended_at);
          }
        }
      } catch (convError) {
        console.error(`Failed to fetch conversation for convId ${convId}:`, convError);
        // Continue without transcript if fetch fails
      }
    }

    // Calculate duration - check multiple sources with priority
    let duration = null;
    let startedAt = null;
    let endedAt = null;

    // First priority: duration from conversation API
    if (conversationDuration !== null && conversationDuration !== undefined) {
      duration = conversationDuration;
    }
    // Second priority: calculate from conversation start/end times
    else if (conversationStartedAt && conversationEndedAt) {
      duration = Math.floor((conversationEndedAt.getTime() - conversationStartedAt.getTime()) / 1000);
      startedAt = conversationStartedAt;
      endedAt = conversationEndedAt;
    }
    // Third priority: calculate from batch recipient start/end times
    else if (recipient.started_at && recipient.ended_at) {
      const start = typeof recipient.started_at === 'number' 
        ? recipient.started_at 
        : new Date(recipient.started_at).getTime() / 1000;
      const end = typeof recipient.ended_at === 'number'
        ? recipient.ended_at
        : new Date(recipient.ended_at).getTime() / 1000;
      duration = Math.floor(end - start);
      startedAt = new Date(start * 1000);
      endedAt = new Date(end * 1000);
    }
    // Fourth priority: duration directly from recipient
    else if (recipient.duration !== undefined && recipient.duration !== null) {
      duration = typeof recipient.duration === 'number' 
        ? recipient.duration 
        : parseInt(recipient.duration);
    }
    
    // Set timestamps if we have them from conversation or recipient
    if (!startedAt) {
      if (conversationStartedAt) {
        startedAt = conversationStartedAt;
      } else if (recipient.started_at) {
        startedAt = typeof recipient.started_at === 'number'
          ? new Date(recipient.started_at * 1000)
          : new Date(recipient.started_at);
      }
    }
    
    if (!endedAt) {
      if (conversationEndedAt) {
        endedAt = conversationEndedAt;
      } else if (recipient.ended_at) {
        endedAt = typeof recipient.ended_at === 'number'
          ? new Date(recipient.ended_at * 1000)
          : new Date(recipient.ended_at);
      }
    }

    // Create or update CallLog
    const callLogData = {
      userId: scheduledCall.userId,
      scheduledCallId: scheduledCall.id,
      phoneNumber: scheduledCall.phoneNumber,
      recipientName: scheduledCall.recipientName,
      status: updatedStatus.toLowerCase(), // Store in lowercase for consistency
      duration: duration || null,
      startedAt: startedAt || null,
      endedAt: endedAt || null,
      recordingUrl: recipient.recording_url || null,
      transcript: transcript || null,
      errorMessage: updatedStatus === "Failed" ? recipient.error_message || "Call failed" : null,
    };

    if (scheduledCall.callLog) {
      // Update existing CallLog
      await db.callLog.update({
        where: { id: scheduledCall.callLog.id },
        data: callLogData,
      });
    } else {
      // Create new CallLog
      await db.callLog.create({
        data: callLogData,
      });
    }

    // Update scheduled call status
    await db.scheduledCall.update({
      where: { id: scheduledCall.id },
      data: { status: updatedStatus },
    });

    return { success: true, updatedStatus, conversation: conversationMessages };
  } catch (error) {
    console.error(`Failed to update call status for batchId ${batchId}:`, error);
    return { success: false, error: String(error) };
  }
}

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
        status: "Upcoming",
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
    const now = new Date();

    // Check for ScheduledCall records that are "Upcoming" and due (scheduledTime <= now)
    const scheduledCalls = await db.scheduledCall.findMany({
      where: {
        userId: user.id,
        status: "Upcoming",
        scheduledTime: { lte: now },
        inngestEventId: { not: null }, // Must have batchId to check status
      },
    });

    // Update status for due calls
    for (const call of scheduledCalls) {
      const result = await updateScheduledCallStatus(call.inngestEventId);
      if (!result.success) {
        console.error(
          `Failed to update call status with batchId ${call.inngestEventId}:`,
          result.error
        );
        // Continue processing other calls even if one fails
      }
    }

    // Fetch CallLogs
    const callLogs = await db.callLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        scheduledCall: true,
      },
    });

    // Also fetch ScheduledCalls to show upcoming ones
    const allScheduledCalls = await db.scheduledCall.findMany({
      where: { userId: user.id },
      orderBy: { scheduledTime: "asc" },
      include: {
        callLog: true,
      },
    });

    // Combine and format for frontend
    // Map ScheduledCalls to CallLog-like format for display
    const scheduledCallLogs = allScheduledCalls
      .filter((sc) => !sc.callLog) // Only include scheduled calls without a call log yet
      .map((sc) => ({
        id: sc.id,
        phoneNumber: sc.phoneNumber,
        recipientName: sc.recipientName,
        status: sc.status,
        duration: null,
        createdAt: sc.createdAt,
        scheduledTime: sc.scheduledTime,
        isScheduled: true,
      }));

    // Combine callLogs and scheduledCallLogs, sorted by date
    const allLogs = [...callLogs, ...scheduledCallLogs].sort((a, b) => {
      const dateA = a.scheduledTime || a.createdAt;
      const dateB = b.scheduledTime || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    return allLogs;
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
          in: ["Upcoming"],
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
