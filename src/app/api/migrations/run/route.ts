import { NextResponse } from "next/server";
import { addLocationTypeColumn } from "@/drizzle/migrations/add_location_type";

export async function GET() {
  const result = await addLocationTypeColumn();
  
  if (result.error) {
    return NextResponse.json({ success: false, error: result.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
} 