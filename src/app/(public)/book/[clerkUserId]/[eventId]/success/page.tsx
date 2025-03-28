import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-4">
              ¡Consulta Confirmada!
            </h1>
            <p className="text-slate-600 mb-6">
              Tu cita ha sido programada exitosamente
              {startTimeStr && ` para ${formatDateTime(new Date(startTimeStr))}`}
            </p>
            
            <div className="space-y-4">
              <p className="text-slate-600">
                Hemos enviado un correo de confirmación con todos los detalles. También recibirás una invitación al calendario.
              </p>
              <p className="text-slate-500 text-sm">
                Si necesitas reprogramar o cancelar, por favor usa los enlaces en tu correo de confirmación.
              </p>
              
              {meeting?.locationType === "virtual" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Video className="h-5 w-5 text-blue-500" />
                    <p className="font-medium text-blue-700">Sesión Virtual</p>
                  </div>
                  <p className="text-blue-600 text-sm mb-3">
                    Se ha enviado un enlace de Google Meet a tu correo electrónico.
                  </p>
                  {meeting.conferenceLink && (
                    <a 
                      href={meeting.conferenceLink}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Unirse a Google Meet
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 