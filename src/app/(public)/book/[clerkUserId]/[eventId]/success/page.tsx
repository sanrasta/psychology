import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { formatDateTime } from "@/lib/formatters"
import { db } from "@/drizzle/db";
import { MeetingTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Video } from "lucide-react";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { startTime?: string }
}) {
  const resolvedSearchParams = await searchParams;
  const startTimeStr = resolvedSearchParams.startTime;

  const meeting = await db.query.MeetingTable.findFirst({
    where: startTimeStr ? eq(MeetingTable.startTime, new Date(startTimeStr)) : undefined,
  });

  return (
    <Card className="max-w-xl mx-auto text-center">
      <CardHeader>
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
        <CardDescription>
          Your appointment has been successfully scheduled
          {startTimeStr && ` for ${formatDateTime(new Date(startTimeStr))}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          We've sent a confirmation email with all the details. You'll also receive a calendar invitation.
        </p>
        <p className="text-muted-foreground text-sm">
          If you need to reschedule or cancel, please use the links in your confirmation email.
        </p>
        {meeting?.locationType === "virtual" && (
          <div className="flex items-center gap-2 mt-6 p-4 bg-blue-50 rounded-md">
            <Video className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-blue-700">Virtual Meeting</p>
              <p className="text-blue-600 text-sm">A Google Meet link has been sent to your email.</p>
              {meeting.conferenceLink && (
                <a 
                  href={meeting.conferenceLink}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="text-blue-600 underline mt-2 inline-block"
                >
                  Join with Google Meet
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 