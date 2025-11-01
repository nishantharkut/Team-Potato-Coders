import { NextResponse } from "next/server";
import { scheduleCall } from "@/actions/calls";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phoneNumber, scheduledTime, recipientName } = body;

    if (!phoneNumber || !scheduledTime) {
      return NextResponse.json(
        { error: "Phone number and scheduled time are required" },
        { status: 400 }
      );
    }

    const result = await scheduleCall({
      phoneNumber,
      scheduledTime,
      recipientName,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Schedule call error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to schedule call" },
      { status: 500 }
    );
  }
}
