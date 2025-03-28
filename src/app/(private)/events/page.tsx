import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { createDefaultEvents } from "@/server/actions/defaultEvents";
import { EventsPageClient } from "./client-page";

export const revalidate = 0;

export default async function EventsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null; // The middleware will handle redirection
  }

  // Ensure default events exist
  await createDefaultEvents();
  
  const events = await db.query.EventTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => [desc(createdAt)],
    columns: {
      id: true,
      name: true, 
      description: true,
      durationInMinutes: true,
      isActive: true,
      clerkUserId: true,
      locationType: true,
    }
  });

  return <EventsPageClient events={events} />;
}