import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export default function BookingConfirmationPage() {
  return (
    <Card className="max-w-xl mx-auto text-center">
      <CardHeader>
        <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
        <CardDescription>
          Your appointment has been successfully scheduled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          We've sent a confirmation email with all the details. You'll also receive a calendar invitation.
        </p>
        <p className="text-muted-foreground text-sm">
          If you need to reschedule or cancel, please use the links in your confirmation email.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  )
} 