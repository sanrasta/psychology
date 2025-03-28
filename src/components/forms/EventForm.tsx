"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EventFormSchema } from "@/schema/events";
import { Form } from "../ui/form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { createEvent, updateEvent, deleteEvent } from "@/server/actions/event";
import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { Video, MapPin } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type EventFormProps = {
  event?: z.infer<typeof EventFormSchema> & {
    id: string;
    locationType?: string;
  };
};

export function EventForm({ event }: EventFormProps) {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const form = useForm<z.infer<typeof EventFormSchema>>({
    resolver: zodResolver(EventFormSchema),
    defaultValues: {
      name: event?.name ?? "",
      description: event?.description ?? "",
      durationInMinutes: event?.durationInMinutes ?? 30,
      isActive: event?.isActive ?? true,
      locationType: event?.locationType ?? "in-person",
    },
  });

  async function onSubmit(values: z.infer<typeof EventFormSchema>) {
    const action = event == null ? createEvent : updateEvent.bind(null, event.id);
    const data = await action(values);
    if (data?.error) {
      form.setError("root", {
        message: "There was an error saving your event",
      });
    }
  }

  async function onDelete() {
    if (!event) return;
    setDeleting(true);
    await deleteEvent(event.id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Quick consultation call" {...field} />
              </FormControl>
              <FormDescription>
                What is this event called?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short 15-minute call to discuss your goals."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                A brief description of the event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationInMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                How long is this event?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Location Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <label htmlFor="in-person" className="flex items-center cursor-pointer">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      In Person
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <label htmlFor="virtual" className="flex items-center cursor-pointer">
                      <Video className="h-4 w-4 mr-2 text-primary" />
                      Virtual (Google Meet)
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Choose whether this event will be in-person or virtual. Virtual events will automatically generate a Google Meet link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>
                  Deactivate to temporarily hide this event from booking.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructiveGhost"
                  disabled={isDeletePending || form.formState.isSubmitting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>this action cannot be undone</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeletePending || form.formState.isSubmitting}
                    variant="destructive"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button type="submit" disabled={isDeletePending || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}