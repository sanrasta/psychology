"use server"
import { db } from "@/drizzle/db"
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule"
import { meetingActionSchema } from "@/schema/meetings"
import { z } from "zod"
import { createCalendarEvent } from "../googleCalendar"
import { redirect } from "next/navigation"
import { fromZonedTime } from "date-fns-tz"
import { revalidatePath } from "next/cache"
import { MeetingTable } from "@/drizzle/schema"

export async function createMeeting(
  unsafeData: z.infer<typeof meetingActionSchema> & {
    eventId: string
    clerkUserId: string
    isVirtual: boolean
  }
) {
  const { success, data } = meetingActionSchema.safeParse(unsafeData)

  if (!success) {
    return { error: true }
  }

  // Get the event to double-check the duration
  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(id, unsafeData.eventId), eq(clerkUserId, unsafeData.clerkUserId)),
  })

  if (!event) {
    return { error: true }
  }

  // Create a calendar event
  try {
    const calendarEvent = await createCalendarEvent({
      clerkUserId: unsafeData.clerkUserId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestNotes: data.guestNotes,
      startTime: data.startTime,
      durationInMinutes: event.durationInMinutes,
      eventName: event.name,
      isVirtual: unsafeData.isVirtual
    })

    // Store the meeting in the database
    await db.insert(MeetingTable).values({
      name: data.guestName,
      email: data.guestEmail,
      notes: data.guestNotes,
      startTime: data.startTime,
      eventId: unsafeData.eventId,
      calendarEventId: calendarEvent.id,
      conferenceLink: calendarEvent.hangoutLink ?? null,
      locationType: unsafeData.isVirtual ? "virtual" : "in-person",
    })

    revalidatePath(`/book/${unsafeData.clerkUserId}`)
    return { success: true }
  } catch (error) {
    console.error("Error creating meeting:", error)
    return { error: true }
  }
}
