import ClientBooking from "../components/ClientBooking"
import { MeetingForm } from "@/components/forms/MeetingForm"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { getValidTimesFromSchedule } from "@/lib/getValidTimesFromSchedule"
import { clerkClient } from "@clerk/nextjs/server"
import {
  addWeeks,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createDefaultSchedule } from "@/server/actions/schedule"
import { ScheduleAvailabilityTable } from "@/drizzle/schema"
import { Video, MapPin } from "lucide-react"

export const revalidate = 0

export default async function BookEventPage({
  params,
}: {
  params: { clerkUserId: string; eventId: string }
}) {
  // Need to await params in Next.js 14+
  const resolvedParams = await params;
  const { clerkUserId, eventId } = resolvedParams;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(eventId)) {
    console.error("Invalid UUID format:", eventId);
    return notFound();
  }

  // Get the event by ID but exclude locationType which doesn't exist yet
  const event = await db.query.EventTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
    columns: {
      id: true,
      name: true,
      description: true,
      durationInMinutes: true,
      isActive: true,
      clerkUserId: true,
      locationType: true,
    }
  })

  if (!event) return notFound()

  // Get clerk user 
  const clerk = await clerkClient()
  const calendarUser = await clerk.users.getUser(clerkUserId)

  // Check if the user has a schedule, if not create one
  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, event.clerkUserId),
    with: { availabilities: true },
  })

  if (!schedule) {
    // Still try to create a default schedule as fallback
    await createDefaultSchedule();
  }

  // Calculate date range for scheduling
  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: "ceil",
  })
  const endDate = endOfDay(addWeeks(startDate, 2))

  // Get valid scheduling times
  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
    { 
      clerkUserId: event.clerkUserId,
      durationInMinutes: event.durationInMinutes 
    }
  )

  if (validTimes.length === 0) {
    return <NoTimeSlots event={event} calendarUser={calendarUser} />
  }

  return (
    <ClientBooking
      event={event}
      userName={calendarUser.fullName}
      userId={clerkUserId}
    >
      <MeetingForm
        validTimes={validTimes}
        eventId={event.id}
        clerkUserId={clerkUserId}
        locationType={event.locationType}
      />
    </ClientBooking>
  )
}

function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { 
    name: string; 
    description: string | null;
    locationType?: string;
  }
  calendarUser: { id: string; fullName: string | null }
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {calendarUser.fullName} is currently booked up. Please check back later
        or choose a shorter event.
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/book/${calendarUser.id}`}>Choose Another Event</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}