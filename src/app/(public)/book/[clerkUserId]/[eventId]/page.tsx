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
import { Video, MapPin, ArrowLeft } from "lucide-react"

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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-800">
                  Agenda {event.name} con {calendarUser.fullName}
                </h1>
                <Link href={`/book/${clerkUserId}`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                  </Button>
                </Link>
              </div>
              
              {event.description && (
                <p className="text-slate-600 mb-6">
                  {event.description}
                </p>
              )}
              
              {event.locationType && (
                <div className="flex items-center gap-2 mb-6 text-slate-600">
                  {event.locationType === "virtual" ? (
                    <>
                      <Video className="h-5 w-5 text-blue-500" />
                      <span>Esta es una sesión virtual a través de Google Meet</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <span>Esta es una sesión presencial</span>
                    </>
                  )}
                </div>
              )}
              
              <MeetingForm
                validTimes={validTimes}
                eventId={event.id}
                clerkUserId={clerkUserId}
                locationType={event.locationType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
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