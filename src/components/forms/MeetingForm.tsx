"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import Link from "next/link"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { meetingFormSchema } from "@/schema/meetings"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  formatDate,
  formatTimeString,
  formatTimezoneOffset,
} from "@/lib/formatters"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "../ui/calendar"
import { isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"
import { toZonedTime } from "date-fns-tz"
import { createMeeting } from "@/server/actions/meetings"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MapPin, Video } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type MeetingFormProps = {
  validTimes: Date[]
  eventId: string
  clerkUserId: string
  locationType?: string
}

export function MeetingForm({
  validTimes,
  eventId,
  clerkUserId,
  locationType = "in-person",
}: MeetingFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof meetingFormSchema>>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      guestName: "",
      guestEmail: "",
      guestNotes: "",
      locationType: locationType,
    },
  })

  const timezone = form.watch("timezone")
  const date = form.watch("date")
  const selectedLocationType = form.watch("locationType")
  
  const validTimesInTimezone = useMemo(() => {
    return validTimes.map(date => toZonedTime(date, timezone))
  }, [validTimes, timezone])

  const availableDays = useMemo(() => {
    const days = new Set<string>();
    validTimesInTimezone.forEach(time => {
      days.add(time.toDateString());
    });
    return days;
  }, [validTimesInTimezone]);

  const isDateAvailable = (date: Date) => {
    const isAvailable = validTimesInTimezone.some(time => 
      isSameDay(date, time)
    );
    
    if (!isAvailable) {
      // Find what day of week this is
      const dayOfWeek = format(date, 'EEEE').toLowerCase();
      console.log(`${format(date, 'yyyy-MM-dd')} (${dayOfWeek}) is not available`);
    }
    
    return isAvailable;
  };

  async function onSubmit(values: z.infer<typeof meetingFormSchema>) {
    try {
      setSubmitting(true);
      const data = await createMeeting({
        ...values,
        eventId,
        clerkUserId,
        isVirtual: values.locationType === "virtual"
      });

      if (data?.error) {
        form.setError("root", {
          message: "There was an error saving your meeting",
        });
      } else {
        router.push(`/book/${clerkUserId}/${eventId}/success?startTime=${values.startTime.toISOString()}`);
      }
    } catch (error) {
      console.error("Meeting creation error:", error);
      form.setError("root", {
        message: "There was an error processing your booking",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
            {form.formState.errors.root.message}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>How would you like to meet?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in-person">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>In Person</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="virtual">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Virtual (Google Meet)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {selectedLocationType === "virtual" ? 
                  "A Google Meet link will be created automatically and included in your calendar invitation." :
                  "In-person meeting details will be provided in your calendar invitation."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map(timezone => (
                    <SelectItem key={timezone} value={timezone}>
                      {timezone}
                      {` (${formatTimezoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover>
                <FormItem className="flex-1">
                  <FormLabel>Date</FormLabel>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal flex w-full",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={date => !isDateAvailable(date)}
                      initialFocus
                    />
                  </PopoverContent>
                  <FormMessage />
                </FormItem>
              </Popover>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Time</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={value =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          date == null || timezone == null
                            ? "Select a date/timezone first"
                            : "Select a meeting time"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter(time => date && isSameDay(time, date))
                      .map(time => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="guestNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button
            disabled={submitting}
            type="button"
            asChild
            variant="outline"
          >
            <Link href="/events">Cancel</Link>
          </Button>
          <Button disabled={submitting} type="submit">
            {submitting ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  )
}