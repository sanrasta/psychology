"use server"

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function addLocationTypeToMeetingsTable() {
  try {
    // Add the location_type column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS "location_type" text NOT NULL DEFAULT 'in-person';
    `);
    
    console.log("Successfully added locationType column to meetings table");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error adding locationType column to meetings:", error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : String(error)
    };
  }
} 