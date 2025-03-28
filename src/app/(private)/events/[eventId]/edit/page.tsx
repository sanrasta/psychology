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
    <Card className="max-w-md mx-auto bg-gray-800 text-white border-gray-700">
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm event={{ 
          ...event, 
          description: event.description || undefined,
          locationType 
        }} />
      </CardContent>
    </Card>
  );
}