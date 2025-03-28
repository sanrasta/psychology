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
          <div className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700">Nombre de la Consulta</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: Consulta Inicial" 
                  className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-slate-500">
                ¿Cómo se llamará esta consulta?
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
              <FormLabel className="text-slate-700">Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Una breve descripción de la consulta."
                  className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription className="text-slate-500">
                Describe brevemente en qué consiste esta consulta.
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
              <FormLabel className="text-slate-700">Duración (minutos)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  className="bg-slate-50 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription className="text-slate-500">
                ¿Cuánto tiempo dura esta consulta?
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
              <FormLabel className="text-slate-700">Tipo de Consulta</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in-person" id="in-person" />
                    <label htmlFor="in-person" className="flex items-center cursor-pointer text-slate-700">
                      <MapPin className="h-4 w-4 mr-2 text-teal-500" />
                      Presencial
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="virtual" id="virtual" />
                    <label htmlFor="virtual" className="flex items-center cursor-pointer text-slate-700">
                      <Video className="h-4 w-4 mr-2 text-blue-500" />
                      Virtual (Google Meet)
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription className="text-slate-500">
                Elige si la consulta será presencial o virtual. Las consultas virtuales generarán automáticamente un enlace de Google Meet.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="space-y-0.5">
                <FormLabel className="text-base text-slate-700">Activa</FormLabel>
                <FormDescription className="text-slate-500">
                  Desactiva para ocultar temporalmente esta consulta de la reserva.
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
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción no se puede deshacer</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeletePending || form.formState.isSubmitting}
                    variant="destructive"
                    onClick={onDelete}
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button 
            type="submit" 
            disabled={isDeletePending || form.formState.isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar Consulta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}