"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { eq, count } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

// Create default events for a user
export async function createDefaultEvents() {
  const { userId } = await auth();
  if (!userId) return { error: true };

  try {
    // Check if user already has exactly 4 events - if so, don't recreate them
    const eventCount = await db.select({ count: count() })
      .from(EventTable)
      .where(eq(EventTable.clerkUserId, userId));
    
    if (eventCount[0].count === 4) {
      console.log(`User ${userId} already has 4 events, skipping creation`);
      return { error: false };
    }
    
    // Delete all existing events for this user
    await db.delete(EventTable)
      .where(eq(EventTable.clerkUserId, userId));
    
    console.log(`Deleted existing events for user ${userId}`);
    
    // Create the 4 default events with dynamically generated IDs
    const defaultEvents = [
      {
        id: uuidv4(),
        name: "Quick Call",
        description: "A brief 15-minute consultation to discuss your needs",
        durationInMinutes: 15,
        clerkUserId: userId,
        isActive: true
      },
      {
        id: uuidv4(),
        name: "Questions & Inquiries",
        description: "30-minute session to answer any questions you may have",
        durationInMinutes: 30,
        clerkUserId: userId,
        isActive: true
      },
      {
        id: uuidv4(),
        name: "Active Gym Session",
        description: "60-minute workout session with personalized guidance",
        durationInMinutes: 60,
        clerkUserId: userId,
        isActive: true
      },
      {
        id: uuidv4(),
        name: "Assessment",
        description: "45-minute comprehensive fitness assessment",
        durationInMinutes: 45,
        clerkUserId: userId,
        isActive: true
      }
    ];

    // Insert all default events
    await db.insert(EventTable).values(defaultEvents);
    
    console.log(`Created 4 default events for user ${userId}`);
    
    return { error: false };
  } catch (error) {
    console.error("Error creating default events:", error);
    return { error: true };
  }
}