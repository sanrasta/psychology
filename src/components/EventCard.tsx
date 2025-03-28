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
    : "239, 68, 68";  // red for in-person

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
        <Card className={cn(
          "flex flex-col h-full transform transition-all duration-300 bg-gray-700/90 border-gray-700 group",
          !isActive && "opacity-70"
        )}>
          <CardHeader className={cn("bg-gradient-to-r from-gray-700 to-gray-600 rounded-t-lg transition-all duration-300", 
            locationType === "virtual" 
              ? "group-hover:from-blue-900/30 group-hover:to-blue-800/20" 
              : "group-hover:from-red-900/30 group-hover:to-red-800/20", 
            !isActive && "opacity-50"
          )}>
            <CardTitle className="flex items-center text-xl text-white">
              <span className={cn(
                "transition-colors duration-300 mr-2", 
                locationType === "virtual" ? "text-blue-400 group-hover:text-blue-300" : "text-red-400 group-hover:text-red-300"
              )}>•</span> 
              {name}
            </CardTitle>
            <CardDescription className="flex items-center mt-2 text-gray-200">
              <Clock className={cn(
                "mr-2 h-4 w-4 transition-colors duration-300", 
                locationType === "virtual" ? "text-blue-300 group-hover:text-blue-200" : "text-red-300 group-hover:text-red-200"
              )} />
              {formatEventDescription(durationInMinutes)}
              
              {locationType === "virtual" && (
                <span className="ml-4 flex items-center">
                  <Video className="mr-1 h-4 w-4 text-blue-300 group-hover:text-blue-200 transition-colors duration-300" />
                  <span className="text-blue-300 group-hover:text-blue-200 transition-colors duration-300">Virtual</span>
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          {description != null && (
            <CardContent className={cn("py-4 flex-grow", !isActive && "opacity-50")}>
              <p className="text-white">{description}</p>
            </CardContent>
          )}
          
          <CardFooter className="flex justify-center mt-auto p-4">
            <Button 
              size="lg"
              className={cn(
                "font-medium px-6 py-2 rounded-full flex items-center gap-2 transition-all duration-300 group shadow-md w-full justify-center",
                locationType === "virtual"
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              Book Now
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
} 