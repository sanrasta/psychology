"use server"

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function createMeetingsTable() {
  try {
    // Create the meetings table with all required columns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "meetings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "notes" TEXT,
        "start_time" TIMESTAMP NOT NULL,
        "calendar_event_id" TEXT,
        "conference_link" TEXT,
        "location_type" TEXT NOT NULL DEFAULT 'in-person',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Successfully created meetings table");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating meetings table:", error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : String(error)
    };
  }
} 