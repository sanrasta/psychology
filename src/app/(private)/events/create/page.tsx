import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { EventForm } from "@/components/forms/EventForm";

export default function NewEventPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-8">
                            <h1 className="text-3xl font-bold text-slate-800 mb-8">
                                Crear Nueva Consulta
                            </h1>
                            <EventForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}