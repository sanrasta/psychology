import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default async function BookPage() {
  const { userId } = await auth();
  
  // If user is not signed in, redirect to sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Booking Links</h1>
      
      <div className="flex flex-col gap-4">
        <Button asChild className="w-fit">
          <Link href="/events">Manage My Events</Link>
        </Button>
        
        <p className="text-muted-foreground">
          Share your booking link with others to let them schedule meetings with you.
        </p>
        
        <div className="text-sm mt-4">
          <p className="font-medium">Your booking link:</p>
          <p className="text-muted-foreground mt-1">
            {`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/book/${userId}`}
          </p>
        </div>
      </div>
    </div>
  );
} 