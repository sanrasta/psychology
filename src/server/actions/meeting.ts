"use server"

import { meetingFormSchema } from "@/schema/meetings"
import { z } from "zod"
import { db } from "@/drizzle/db"
import { MeetingTable, EventTable } from "@/drizzle/schema"
import { createCalendarEvent } from "@/server/googleCalendar"
import { revalidatePath } from "next/cache"

export async function createMeeting(
  unsafeData: z.infer<typeof meetingFormSchema> & {
    eventId: string
    clerkUserId: string
    isVirtual: boolean // Add this parameter
  }
) {
  const { success, data } = meetingFormSchema.safeParse(unsafeData)

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

  // Create a calendar event first
  try {
    const calendarEvent = await createCalendarEvent({
      clerkUserId: unsafeData.clerkUserId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestNotes: data.guestNotes,
      startTime: data.startTime,
      durationInMinutes: event.durationInMinutes,
      eventName: event.name,
      isVirtual: unsafeData.isVirtual // Pass the virtual flag to calendar creation
    })

    // Now, store the meeting in our database
    await db.insert(MeetingTable).values({
      name: data.guestName,
      email: data.guestEmail,
      notes: data.guestNotes,
      startTime: data.startTime,
      eventId: unsafeData.eventId,
      calendarEventId: calendarEvent.id, // Store the Google Calendar event ID
      conferenceLink: calendarEvent.hangoutLink ?? null, // Store the Google Meet link
    })

    revalidatePath(`/book/${unsafeData.clerkUserId}`)
    return { success: true }
  } catch (error) {
    console.error("Error creating meeting:", error)
    return { error: true }
  }
} 