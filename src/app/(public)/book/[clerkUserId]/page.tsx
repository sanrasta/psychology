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
import { clerkClient } from "@clerk/nextjs/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { formatEventDescription } from "@/lib/formatters"
import { Video } from "lucide-react"

export const revalidate = 0

export default async function UserEventsPage({
  params,
}: {
  params: { clerkUserId: string }
}) {
  // Await params before destructuring
  const resolvedParams = await params;
  const { clerkUserId } = resolvedParams;
  
  // Get all active events for this user
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId)),
  })

  if (events.length === 0) return notFound()

  // Get the user details
  const clerk = await clerkClient()
  const calendarUser = await clerk.users.getUser(clerkUserId)

  // Use this optimization for the events displayed on the page
  const optimizedEvents = events.map(event => ({
    ...event,
    formattedDuration: formatEventDescription(event.durationInMinutes)
  }));

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          Book a session with {calendarUser.fullName}
        </CardTitle>
        <CardDescription>
          Select the type of meeting you'd like to schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {optimizedEvents.map(event => (
          <Card key={event.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="flex items-center">
                {event.formattedDuration}
                {event.locationType === "virtual" && (
                  <span className="ml-2 flex items-center text-blue-400">
                    <Video className="h-3 w-3 mr-1" />
                    Virtual
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            {event.description && (
              <CardContent className="p-4 pt-0">
                {event.description}
              </CardContent>
            )}
            <CardFooter className="p-4 pt-0">
              <Button asChild className="w-full">
                <Link href={`/book/${clerkUserId}/${event.id}`}>
                  Select
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}