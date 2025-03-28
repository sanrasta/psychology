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
  locationType?: "in-person" | "virtual"
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
      locationType: locationType as "in-person" | "virtual",
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
              <FormLabel className="text-slate-700">¿Cómo te gustaría reunirte?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-slate-500">
                    <SelectValue placeholder="Selecciona en persona o virtual" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="in-person" className="hover:bg-blue-50 focus:bg-blue-50 text-slate-900 hover:text-slate-900 focus:text-slate-900">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-teal-500" />
                      <span>Presencial</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="virtual" className="hover:bg-blue-50 focus:bg-blue-50 text-slate-900 hover:text-slate-900 focus:text-slate-900">
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Virtual (Google Meet)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription className="text-slate-500">
                {selectedLocationType === "virtual" ? 
                  "Se creará automáticamente un enlace de Google Meet y se incluirá en tu invitación al calendario." :
                  "Los detalles de la reunión presencial se proporcionarán en tu invitación al calendario."}
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
              <FormLabel className="text-slate-700">Zona Horaria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-slate-500">
                    <SelectValue placeholder="Selecciona tu zona horaria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white border-slate-200">
                  {Intl.supportedValuesOf("timeZone").map(timezone => (
                    <SelectItem 
                      key={timezone} 
                      value={timezone}
                      className="hover:bg-blue-50 focus:bg-blue-50 text-slate-900 hover:text-slate-900 focus:text-slate-900"
                    >
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
                  <FormLabel className="text-slate-700">Fecha</FormLabel>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal flex w-full bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900",
                          !field.value && "text-slate-500"
                        )}
                      >
                        {field.value ? (
                          <span className="text-slate-900">{formatDate(field.value)}</span>
                        ) : (
                          <span>Selecciona una fecha</span>
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
                      className="bg-white border-slate-200"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-slate-900",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-slate-900",
                        nav_button_previous: "absolute left-1",
                        nav_button_next: "absolute right-1",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                        row: "flex w-full mt-2",
                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-slate-900",
                        day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700",
                        day_today: "bg-slate-100 text-slate-900",
                        day_outside: "text-slate-400 opacity-50",
                        day_disabled: "text-slate-400 opacity-50",
                        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-slate-900",
                        day_hidden: "invisible",
                      }}
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
                <FormLabel className="text-slate-700">Hora</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={value =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400 text-slate-500">
                      <SelectValue
                        placeholder={
                          date == null || timezone == null
                            ? "Selecciona primero una fecha/zona horaria"
                            : "Selecciona una hora"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-slate-200">
                    {validTimesInTimezone
                      .filter(time => date && isSameDay(time, date))
                      .map(time => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                          className="hover:bg-blue-50 focus:bg-blue-50 text-slate-900 hover:text-slate-900 focus:text-slate-900"
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
                <FormLabel className="text-slate-700">Tu Nombre</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                  />
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
                <FormLabel className="text-slate-700">Tu Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    {...field} 
                    className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                  />
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
              <FormLabel className="text-slate-700">Notas</FormLabel>
              <FormControl>
                <Textarea 
                  className="resize-none bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400" 
                  {...field} 
                />
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
            className="border-slate-200 hover:bg-slate-100"
          >
            <Link href="/events">Cancelar</Link>
          </Button>
          <Button 
            disabled={submitting} 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Agendando..." : "Agendar"}
          </Button>
        </div>
      </form>
    </Form>
  )
}