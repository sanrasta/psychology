import { z } from "zod";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { timeToInt } from "@/lib/utils";

// Time validation regex (HH:MM format, 24-hour)
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const availabilitySchema = z.object({
    dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
    startTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM (24-hour)"),
    endTime: z.string().regex(timeRegex, "Invalid time format. Use HH:MM (24-hour)"),
}).refine(
    (data) => timeToInt(data.startTime) < timeToInt(data.endTime),
    {
        message: "End time must be after start time",
        path: ["endTime"],
    }
);

type DayGroup = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  originalIndex: number;
};

export const scheduleFormSchema = z.object({
    timezone: z.string(),
    availabilities: z.array(availabilitySchema),
}).superRefine((data, ctx) => {
    // Check for overlaps
    const dayGroups: Partial<Record<(typeof DAYS_OF_WEEK_IN_ORDER)[number], DayGroup[]>> = {};
    
    // Group by day of week
    data.availabilities.forEach((avail, index) => {
        if (!dayGroups[avail.dayOfWeek]) {
            dayGroups[avail.dayOfWeek] = [];
        }
        
        // Store with the original index so we can add errors properly
        dayGroups[avail.dayOfWeek]!.push({
            ...avail,
            originalIndex: index
        });
    });
    
    // Check each day's slots for overlaps
    Object.values(dayGroups).forEach(daySlots => {
        if (!Array.isArray(daySlots) || daySlots.length <= 1) return;
        
        // For each time slot
        for (let i = 0; i < daySlots.length; i++) {
            const slot = daySlots[i];
            const slotStart = timeToInt(slot.startTime);
            const slotEnd = timeToInt(slot.endTime);
            
            // Compare with every other slot
            for (let j = 0; j < daySlots.length; j++) {
                // Skip self-comparison
                if (i === j) continue;
                
                const otherSlot = daySlots[j];
                const otherStart = timeToInt(otherSlot.startTime);
                const otherEnd = timeToInt(otherSlot.endTime);
                
                // Check for overlap: 
                // if start of slot A is less than end of slot B AND
                // end of slot A is greater than start of slot B
                if (slotStart < otherEnd && slotEnd > otherStart) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Overlaps with another time slot",
                        path: [`availabilities.${slot.originalIndex}.root`],
                    });
                    
                    // No need to check other slots once we found an overlap
                    break;
                }
            }
        }
    });
});