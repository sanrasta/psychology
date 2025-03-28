import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Get current schedule info
    const schedule = await db.query.ScheduleTable.findFirst({
      where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
      with: {
        availabilities: true,
      },
    });
    
    if (!schedule) {
      return NextResponse.json({ message: "No schedule found" }, { status: 404 });
    }
    
    // Return the schedule and its availabilities for debugging
    return NextResponse.json({
      schedule,
      daysAvailable: schedule.availabilities.map(a => a.dayOfWeek),
      numDays: schedule.availabilities.length
    });
    
  } catch (error) {
    console.error("Error in debug route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 