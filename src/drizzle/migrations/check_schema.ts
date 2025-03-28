"use server"

import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function checkSchema() {
  try {
    // Check column names in the events table
    const result = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events';
    `);
    
    console.log("Event table columns:", result.rows);
    return { success: true, columns: result.rows };
  } catch (error: unknown) {
    console.error("Error checking schema:", error);
    return { 
      error: true, 
      message: error instanceof Error ? error.message : String(error) 
    };
  }
} 