import { NextResponse } from "next/server";
import { getCallLogs } from "@/actions/calls";

export async function GET(req) {
  try {
    const callLogs = await getCallLogs();
    return NextResponse.json(callLogs);
  } catch (error) {
    console.error("Get call logs error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch call logs" },
      { status: 500 }
    );
  }
}
