import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants"
import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable } from "@/drizzle/schema"
import { getCalendarEventTimes } from "@/server/googleCalendar"
import { 
  fromZonedTime, 
  toZonedTime 
} from "date-fns-tz"
import {
  addMinutes,
  addDays,
  areIntervalsOverlapping,
  format,
  isWithinInterval,
  setHours,
  setMinutes,
} from "date-fns"

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number }
) {
  const start = timesInOrder[0]
  const end = timesInOrder.at(-1)

  if (start == null || end == null) return []

  // Fetch the user's schedule
  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId: userIdCol }, { eq }) =>
      eq(userIdCol, event.clerkUserId),
    with: { availabilities: true },
  })

  if (schedule == null || !schedule.availabilities.length) {
    // Create default available times for all days
    // This is a fallback when no schedule exists
    const defaultAvailabilities: { start: Date; end: Date }[] = [];
    const today = new Date();
    
    // Add default 6am-8pm slots for the next 2 weeks
    for (let i = 0; i < 14; i++) {
      const dayDate = addDays(today, i);
      
      const daySlot = {
        start: setHours(setMinutes(dayDate, 0), 6), // 6:00 AM
        end: setHours(setMinutes(dayDate, 0), 20)   // 8:00 PM
      };
      
      defaultAvailabilities.push(daySlot);
    }
    
    // Filter the original times against these default slots
    return timesInOrder.filter(time => {
      const timeWithDuration = addMinutes(time, event.durationInMinutes);
      
      // Check if this time fits in any default slot
      const fitsInDefaultSlot = defaultAvailabilities.some(slot => 
        isWithinInterval(time, slot) && 
        isWithinInterval(addMinutes(time, event.durationInMinutes - 1), slot)
      );
      
      return fitsInDefaultSlot;
    });
  }

  // Get calendar events to block out times
  const eventTimes = await getCalendarEventTimes(event.clerkUserId, {
    start,
    end,
  })

  // Get valid times based on schedule
  return timesInOrder.filter(time => {
    // Convert to user's timezone for availability checking
    const timeInScheduleTz = toZonedTime(time, schedule.timezone)
    
    // The duration of the event must fit within availability slots
    const timeWithDuration = addMinutes(time, event.durationInMinutes)

    // Check if this time is within any of the availability slots
    const availableSlots = getAvailabilityIntervalsForDate(
      timeInScheduleTz,
      schedule.availabilities,
      schedule.timezone
    )
    
    if (availableSlots.length === 0) {
      return false
    }

    // Check if the time + duration fits within an availability slot
    const fitsIntoSlot = availableSlots.some(slot =>
      isWithinInterval(time, slot) &&
      isWithinInterval(addMinutes(time, event.durationInMinutes - 1), slot)
    )
    
    if (!fitsIntoSlot) {
      return false
    }

    // Check if there are overlapping calendar events
    const hasOverlappingEvents = eventTimes.some(eventTime =>
      areIntervalsOverlapping(
        { start: time, end: timeWithDuration },
        eventTime
      )
    )

    return !hasOverlappingEvents
  })
}

function getAvailabilityIntervalsForDate(
  date: Date,
  availabilities: typeof ScheduleAvailabilityTable.$inferSelect[],
  timezone: string
) {
  // Use lowercase day of week and handle both 'wednesday' and 'wendesday' spellings
  const dayOfWeek = format(date, 'EEEE').toLowerCase();
  
  // Find availabilities that match this day
  const dayAvailabilities = availabilities.filter(a => {
    const availDay = a.dayOfWeek.toLowerCase();
    // Check if the day matches, handling both spellings of Wednesday
    return availDay === dayOfWeek || 
           (dayOfWeek === 'wednesday' && availDay === 'wendesday') ||
           (dayOfWeek === 'wendesday' && availDay === 'wednesday');
  });

  if (dayAvailabilities.length === 0) {
    // If no availabilities for this day, create a default 6am-8pm slot
    const start = fromZonedTime(
      setMinutes(setHours(date, 6), 0),  // 6:00 AM
      timezone
    );
    
    const end = fromZonedTime(
      setMinutes(setHours(date, 20), 0), // 8:00 PM
      timezone
    );
    
    return [{ start, end }];
  }

  // Convert availability time strings to actual intervals for this date
  return dayAvailabilities.map(({ startTime, endTime }) => {
    const start = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(startTime.split(":")[0])),
        parseInt(startTime.split(":")[1])
      ),
      timezone
    )

    const end = fromZonedTime(
      setMinutes(
        setHours(date, parseInt(endTime.split(":")[0])),
        parseInt(endTime.split(":")[1])
      ),
      timezone
    )

    return { start, end }
  })
}