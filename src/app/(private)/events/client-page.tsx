'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import EventCard from "@/components/EventCard";
import Loading from "@/components/Loading";
import { Home } from "lucide-react";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";

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
      <div className="min-h-screen bg-slate-50">
        {/* Navbar */}
        <motion.header
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-[50px] h-[50px]">
                <UserButton afterSignOutUrl="/" />
              </div>
              <span className="text-2xl font-bold text-slate-800">
                Dra. <span className="text-blue-600">Blanca Stella</span>
              </span>
            </motion.div>

            <motion.nav 
              className="hidden md:flex space-x-6 text-lg items-center text-slate-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Button
                onClick={navigateToHome}
                variant="ghost"
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
            </motion.nav>
          </div>
        </motion.header>

        <div className="pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
                <span className="text-slate-800">Tipos de </span>
                <span className="text-blue-600">Consulta</span>
              </h1>
              <div className="flex items-center justify-center w-full max-w-xl">
                <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-30 rounded-full"></div>
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
      </div>
    </>
  );
} 