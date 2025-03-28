"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { DAYS_OF_WEEK_IN_ORDER } from "@/data/constants";
import { scheduleFormSchema } from "@/schema/schedule";
import { timeToInt } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatTimezoneOffset } from "@/lib/formatters";
import { Fragment, useState } from "react";
import { Plus, X, Save, Clock, Calendar, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { saveSchedule } from "@/server/actions/schedule";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

type Availability = {
  startTime: string;
  endTime: string;
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
};

type ScheduleFormProps = {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
};

export function ScheduleForm({ schedule }: ScheduleFormProps) {
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities?.toSorted((a, b) => 
        timeToInt(a.startTime) - timeToInt(b.startTime)
      ) ?? [],
    },
  });

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({
    name: "availabilities",
    control: form.control,
  });

  const groupedAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({ ...field, index })),
    (availability) => availability.dayOfWeek
  );

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const data = await saveSchedule(values);

    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your schedule",
      });
    } else {
      setSuccessMessage("Schedule saved successfully!");
      setTimeout(() => setSuccessMessage(undefined), 3000);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Your Availability Schedule</CardTitle>
            </div>
            <CardDescription>
              Set your weekly availability hours. Clients will be able to book appointments during these times.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {form.formState.errors.root?.message && (
              <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
                <p className="text-sm font-medium flex items-center">
                  <X className="h-4 w-4 mr-2" />
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                <p className="text-sm font-medium flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {successMessage}
                </p>
              </div>
            )}

            <div className="mb-8">
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">Time Zone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full md:w-[400px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Intl.supportedValuesOf("timeZone").map(timezone => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone} ({formatTimezoneOffset(timezone)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              {/* Desktop calendar view (hidden on small screens) */}
              <div className="hidden md:block">
                <div className="grid grid-cols-7 bg-muted text-center border-b">
                  {DAYS_OF_WEEK_IN_ORDER.map(day => (
                    <div key={day} className="py-3 font-medium capitalize text-sm border-r last:border-r-0">
                      {day}
                      {groupedAvailabilityFields[day]?.length && groupedAvailabilityFields[day]!.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {groupedAvailabilityFields[day]!.length}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 min-h-[400px]">
                  {DAYS_OF_WEEK_IN_ORDER.map(dayOfWeek => (
                    <div key={dayOfWeek} className="p-2 border-r last:border-r-0 bg-card">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          addAvailability({
                            dayOfWeek,
                            startTime: "09:00",
                            endTime: "17:00",
                          });
                        }}
                        className="w-full mb-2 h-7 text-xs justify-start"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Slot
                      </Button>
                      
                      <div className="space-y-2">
                        {groupedAvailabilityFields[dayOfWeek]?.map((field, labelIndex) => (
                          <div key={field.id} className="relative">
                            <div className="bg-primary/10 p-2 rounded border border-primary/20 hover:bg-primary/15 transition-colors">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-xs font-medium">Slot {labelIndex + 1}</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => removeAvailability(field.index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-1">
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.startTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs">From</span>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            className="h-6 text-xs"
                                            placeholder="09:00"
                                          />
                                        </FormControl>
                                      </div>
                                      <FormMessage className="text-xs" />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.endTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs">To</span>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            className="h-6 text-xs"
                                            placeholder="17:00"
                                          />
                                        </FormControl>
                                      </div>
                                      <FormMessage className="text-xs" />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {form.formState.errors.availabilities?.[field.index]?.root && (
                                <div className="mt-1 text-xs text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {form.formState.errors.availabilities[field.index]?.root?.message}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {!groupedAvailabilityFields[dayOfWeek]?.length && (
                          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Calendar className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs text-center">No time slots</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile list view (hidden on medium screens and up) */}
              <div className="md:hidden space-y-4">
                {DAYS_OF_WEEK_IN_ORDER.map(dayOfWeek => (
                  <div key={dayOfWeek} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted p-3 flex justify-between items-center">
                      <h3 className="font-medium capitalize">{dayOfWeek}</h3>
                      <div className="flex items-center gap-2">
                        {groupedAvailabilityFields[dayOfWeek]?.length && groupedAvailabilityFields[dayOfWeek]!.length > 0 && (
                          <Badge variant="secondary">
                            {groupedAvailabilityFields[dayOfWeek]!.length}
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            addAvailability({
                              dayOfWeek,
                              startTime: "09:00",
                              endTime: "17:00",
                            });
                          }}
                          className="h-7 px-2"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-3">
                      {!groupedAvailabilityFields[dayOfWeek]?.length ? (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                          <p className="text-sm">No time slots</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {groupedAvailabilityFields[dayOfWeek]?.map((field, labelIndex) => (
                            <div key={field.id} className="bg-primary/10 p-3 rounded border border-primary/20">
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-sm">Slot {labelIndex + 1}</div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => removeAvailability(field.index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.startTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">From</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8" placeholder="09:00" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name={`availabilities.${field.index}.endTime`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs">To</FormLabel>
                                      <FormControl>
                                        <Input {...field} className="h-8" placeholder="17:00" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              {form.formState.errors.availabilities?.[field.index]?.root && (
                                <div className="mt-2 text-xs text-destructive flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {form.formState.errors.availabilities[field.index]?.root?.message}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 bg-background pt-4 pb-2 z-10">
          <Button 
            disabled={form.formState.isSubmitting} 
            type="submit"
            className="w-full md:w-auto py-6 shadow-md"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" /> 
            {form.formState.isSubmitting ? "Saving Schedule..." : "Save Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  );
}