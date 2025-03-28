import { NextRequest, NextResponse } from 'next/server';
import { getValidTimesFromSchedule } from '@/lib/getValidTimesFromSchedule';
import { db } from '@/drizzle/db';
import { addDays, addWeeks, eachMinuteOfInterval, endOfDay, roundToNearestMinutes } from 'date-fns';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');
  const clerkUserId = searchParams.get('clerkUserId');

  if (!eventId || !clerkUserId) {
    return NextResponse.json(
      { error: 'Missing required parameters: eventId or clerkUserId' },
      { status: 400 }
    );
  }
  
  try {
    // Get the event information to determine duration
    const event = await db.query.EventTable.findFirst({
      where: ({ id, clerkUserId: userIdCol }, { eq, and }) =>
        and(eq(id, eventId), eq(userIdCol, clerkUserId)),
      columns: {
        durationInMinutes: true,
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Calculate date range for scheduling - only 2 weeks
    const startDate = roundToNearestMinutes(new Date(), {
      nearestTo: 15,
      roundingMethod: 'ceil',
    });
    
    // Generate times for the next 2 weeks only
    const endDate = endOfDay(addWeeks(startDate, 2));

    // Get valid scheduling times
    const validTimes = await getValidTimesFromSchedule(
      eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
      { 
        clerkUserId,
        durationInMinutes: event.durationInMinutes
      }
    );

    return NextResponse.json({ times: validTimes });
  } catch (error) {
    console.error('Error calculating available times:', error);
    return NextResponse.json(
      { error: 'Failed to calculate available times' },
      { status: 500 }
    );
  }
} 