"use server"

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function addLocationTypeColumn() {
  try {
    // Add the location_type column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS "locationType" text NOT NULL DEFAULT 'in-person';
    `);
    
    console.log("Successfully added locationType column");
    return { success: true };
  } catch (error) {
    console.error("Error adding locationType column:", error);
    return { error: true, message: error instanceof Error ? error.message : String(error) };
  }
} 