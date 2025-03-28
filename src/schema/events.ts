import { z } from "zod";

export const EventFormSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .max(100, { message: "Name must be 100 characters or less" }),
    description: z
        .string()
        .max(500, { message: "Description must be 500 characters or less" })
        .optional(),
    isActive: z.boolean().default(true),
    durationInMinutes: z
        .number()
        .int()
        .min(15, { message: "Duration must be at least 15 minutes" })
        .max(240, { message: "Duration must be 4 hours or less" }),
    locationType: z.enum(["in-person", "virtual"]).default("in-person"),
});