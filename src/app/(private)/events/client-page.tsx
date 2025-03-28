'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import Loading from "@/components/Loading";
import { Home } from "lucide-react";

interface EventsPageClientProps {
  events: Array<{
    id: string;
    isActive: boolean;
    name: string;
    durationInMinutes: number;
    description: string | null;
    clerkUserId: string;
    locationType?: string;
  }>;
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const navigateToHome = () => {
    setIsLoading(true);
    router.push("/");
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className="bg-gray-900 min-h-screen -mt-28 pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-center mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600 animate-gradient">
                Event Types
              </span>
            </h1>
            <div className="flex items-center justify-center w-full max-w-xl">
              <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent w-full opacity-30 rounded-full"></div>
            </div>
            
            <div className="mt-6 flex justify-end w-full">
              <Button
                onClick={navigateToHome}
                variant="outline"
                className="border-red-500/30 text-white hover:bg-red-500/20"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {events.map((event) => (
              <EventCard 
                key={event.id} 
                {...event} 
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 