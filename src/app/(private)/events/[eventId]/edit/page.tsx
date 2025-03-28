import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/forms/EventForm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function EditEventPage({
  params,
}: {
  params: { eventId: string };
}) {
  const { eventId } = await params;
  const { userId, redirectToSignIn } = await auth();
  
  if (!userId) {
    return redirectToSignIn();
  }

  const event = await db.query.EventTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(clerkUserId, userId), eq(id, eventId)),
  });

  if (!event) {
    return notFound();
  }

  // Ensure locationType is one of the allowed values
  let locationType: "virtual" | "in-person";
  if (event.locationType === "virtual") {
    locationType = "virtual";
  } else {
    locationType = "in-person";
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-8">
                Editar Consulta
              </h1>
              <EventForm event={{ 
                ...event, 
                description: event.description || undefined,
                locationType 
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}