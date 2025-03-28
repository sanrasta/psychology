"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { formatEventDescription } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { Clock, ArrowRight, Video } from "lucide-react";
import Loading from "@/components/Loading";
import { motion } from "framer-motion";

interface EventCardProps {
  id: string;
  isActive: boolean;
  name: string;
  durationInMinutes: number;
  description: string | null;
  clerkUserId: string;
  locationType?: string;
}

export default function EventCard({
  id,
  isActive,
  name,
  durationInMinutes,
  description,
  clerkUserId,
  locationType = "in-person",
}: EventCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const navigateToBooking = () => {
    setIsLoading(true);
    router.push(`/book/${clerkUserId}/${id}`);
  };

  // Set glow color based on event type
  const glowColor = locationType === "virtual" 
    ? "59, 130, 246" // blue for virtual
    : "20, 184, 166";  // teal for in-person

  return (
    <>
      {isLoading && <Loading />}
      <motion.div
        whileHover={{ 
          y: -8,
          boxShadow: `0 10px 30px -5px rgba(${glowColor}, 0.5)`,
          scale: 1.02
        }}
        transition={{ duration: 0.3 }}
        style={{
          "--glow-color": `rgba(${glowColor}, 0.7)`,
          "--glow-color-light": `rgba(${glowColor}, 0.4)`
        } as React.CSSProperties}
        onClick={navigateToBooking}
        className="cursor-pointer"
      >
        <Card className="h-full bg-white border-slate-200">
          <CardHeader className="p-6">
            <CardTitle className="text-xl text-slate-800">{name}</CardTitle>
            <CardDescription className="flex items-center text-slate-600">
              <Clock className="h-4 w-4 mr-2" />
              {formatEventDescription(durationInMinutes)}
              {locationType === "virtual" && (
                <span className="ml-2 flex items-center text-blue-500">
                  <Video className="h-4 w-4 mr-1" />
                  Virtual
                </span>
              )}
            </CardDescription>
          </CardHeader>
          {description && (
            <CardContent className="p-6 pt-0">
              <p className="text-slate-600">{description}</p>
            </CardContent>
          )}
          <CardFooter className="flex justify-center mt-auto p-6 pt-0">
            <Button 
              size="lg"
              className={cn(
                "font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 group shadow-md w-full justify-center",
                locationType === "virtual"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              )}
            >
              Reservar Ahora
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
} 