"use server"

import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/drizzle/db"
import { ScheduleTable, ScheduleAvailabilityTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { scheduleFormSchema } from "@/schema/schedule"
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"

// In-memory storage for development until database is set up
const DEV_SCHEDULES = new Map();

// Create a default schedule with all days
export async function createDefaultSchedule() {
  const { userId } = await auth()
  if (!userId) return { error: true }

  try {
    // Check if user already has a schedule
    const existingSchedule = await db.query.ScheduleTable.findFirst({
      where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    })

    if (existingSchedule) {
      return { error: false } // Schedule already exists
    }

    // Create a new schedule with default timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const [newSchedule] = await db
      .insert(ScheduleTable)
      .values({ 
        timezone, 
        clerkUserId: userId 
      })
      .returning()

    // Create default availability for all days of the week
    // 9 AM to 5 PM
    const defaultAvailabilities = DAYS_OF_WEEK_IN_ORDER.map(dayOfWeek => ({
      scheduleId: newSchedule.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00"
    }))

    await db.insert(ScheduleAvailabilityTable).values(defaultAvailabilities)
    
    return { error: false }
  } catch (error) {
    console.error("Error creating default schedule:", error)
    return { error: true }
  }
}

export async function getSchedule() {
  const { userId } = await auth()
  if (userId == null) return null

  try {
    // Try database first
    const schedule = await db.query.ScheduleTable.findFirst({
      where: (schedule, { eq }) => eq(schedule.clerkUserId, userId),
      with: {
        availabilities: true,
      },
    })
    
    return schedule
  } catch (error) {
    // Fallback to in-memory storage if database tables don't exist
    console.error("Database tables don't exist yet. Using in-memory storage.")
    return DEV_SCHEDULES.get(userId) || null
  }
}

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>
) {
  const { userId } = await auth()

  const result = scheduleFormSchema.safeParse(unsafeData)

  if (!result.success || userId == null) {
    return { error: true, errors: result.error?.format() }
  }

  const { data } = result
  const { availabilities, ...scheduleData } = data

  try {
    // First, find or create the schedule
    let schedule = await db.query.ScheduleTable.findFirst({
      where: (schedule, { eq }) => eq(schedule.clerkUserId, userId),
    })

    if (!schedule) {
      // Create a new schedule
      const [newSchedule] = await db
        .insert(ScheduleTable)
        .values({ ...scheduleData, clerkUserId: userId })
        .returning()
      
      schedule = newSchedule
    } else {
      // Update existing schedule
      await db
        .update(ScheduleTable)
        .set(scheduleData)
        .where(eq(ScheduleTable.id, schedule.id))
    }

    // Delete existing availabilities
    await db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.scheduleId, schedule.id))

    // Insert new availabilities if any exist
    if (availabilities.length > 0) {
      await db.insert(ScheduleAvailabilityTable).values(
        availabilities.map(availability => ({
          ...availability,
          scheduleId: schedule.id,
        }))
      )
    }

    return { error: false }
  } catch (error) {
    console.error("Error saving schedule:", error)
    return { error: true }
  }
}