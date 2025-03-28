'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Video, MapPin, ArrowLeft } from "lucide-react";
import Loading from "@/components/Loading";

interface ClientBookingProps {
  children: React.ReactNode;
  event: {
    name: string;
    description: string | null;
    locationType?: string;
  };
  userName: string | null;
  userId: string;
}

export default function ClientBooking({ children, event, userName, userId }: ClientBookingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const navigateBack = () => {
    setIsLoading(true);
    router.push(`/book/${userId}`);
  };

  return (
    <>
      {isLoading && <Loading />}
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Book {event.name} with {userName}
            </CardTitle>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={navigateBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to events
            </Button>
          </div>
          <CardDescription>
            {event.description}
            {event.locationType ? (
              event.locationType === "virtual" ? (
                <span className="flex items-center mt-2 text-primary">
                  <Video className="h-4 w-4 mr-2" /> This is a virtual meeting via Google Meet
                </span>
              ) : (
                <span className="flex items-center mt-2">
                  <MapPin className="h-4 w-4 mr-2" /> This is an in-person meeting
                </span>
              )
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </>
  );
} 