import { startOfDay } from "date-fns"
import { z } from "zod"

// Define the locationType enum separately so it can be reused 
export const locationTypeEnum = z.enum(["in-person", "virtual"]);

const meetingSchemaBase = z.object({
  startTime: z.date().min(new Date()),
  guestEmail: z.string().email().min(1, "Required"),
  guestName: z.string().min(1, "Required"),
  guestNotes: z.string().optional(),
  timezone: z.string().min(1, "Required"),
  locationType: locationTypeEnum.default("in-person"), // Add this to base schema
})

export const meetingFormSchema = z
  .object({
    timezone: z.string(),
    date: z.date(),
    startTime: z.date(),
    guestName: z.string().min(2, "Name is required"),
    guestEmail: z.string().email("Valid email is required"),
    guestNotes: z.string().optional(),
    locationType: locationTypeEnum.default("in-person"),
  })
  .merge(meetingSchemaBase)

export const meetingActionSchema = z
  .object({
    eventId: z.string().min(1, "Required"),
    clerkUserId: z.string().min(1, "Required"),
  })
  .merge(meetingSchemaBase)
