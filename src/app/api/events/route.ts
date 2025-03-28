import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDefaultEvents } from "@/server/actions/defaultEvents";

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  // Ensure default events exist
  await createDefaultEvents();
  
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => [desc(createdAt)],
  });
  
  return NextResponse.json(events);
} 