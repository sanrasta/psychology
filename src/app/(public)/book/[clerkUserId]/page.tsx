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
import { Video, Clock } from "lucide-react"
import { motion } from "framer-motion"

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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Agenda tu <span className="text-blue-600">Consulta</span>
            </h1>
            <p className="text-slate-600 text-lg">
              Selecciona el tipo de sesión que mejor se adapte a tus necesidades
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {optimizedEvents.map(event => (
              <motion.div
                key={event.id}
                whileHover={{ 
                  y: -5,
                  boxShadow: "0 10px 30px -5px rgba(59, 130, 246, 0.5)"
                }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{event.name}</h3>
                  <div className="flex items-center text-slate-600 mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    {event.formattedDuration}
                    {event.locationType === "virtual" && (
                      <span className="ml-2 flex items-center text-blue-500">
                        <Video className="h-4 w-4 mr-1" />
                        Virtual
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-slate-600 mb-6">
                      {event.description}
                    </p>
                  )}
                  <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Link href={`/book/${clerkUserId}/${event.id}`}>
                      Seleccionar
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}