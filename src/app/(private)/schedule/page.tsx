import { ScheduleForm } from "@/components/forms/ScheduleForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { db } from "@/drizzle/db"
import { auth } from "@clerk/nextjs/server"
import { Clock } from "lucide-react"
import { createDefaultSchedule } from "@/server/actions/schedule"

export const revalidate = 0

export default async function SchedulePage() {
  const { userId } = await auth()
  
  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    }
  }

  // Get or create schedule
  let schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: { availabilities: true },
  })

  // If no schedule exists, create a default one
  if (!schedule) {
    await createDefaultSchedule();
    
    // Fetch the newly created schedule
    schedule = await db.query.ScheduleTable.findFirst({
      where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
      with: { availabilities: true },
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <Card className="shadow-lg border-gray-800/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Your Availability Schedule</CardTitle>
          </div>
          <CardDescription>
            Set your weekly availability hours. Clients will be able to book appointments during these times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleForm schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  )
}