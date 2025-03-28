import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Check if the meetings table exists
    const meetingsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'meetings'
      );
    `);
    
    // Get list of all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("Tables in database:", tables.rows);
    console.log("Meetings table exists:", meetingsTableExists.rows[0].exists);
    
    return NextResponse.json({ 
      success: true, 
      tables: tables.rows,
      meetingsTableExists: meetingsTableExists.rows[0].exists
    });
  } catch (error: any) {
    console.error("Error checking schema:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error) 
    }, { status: 500 });
  }
} 