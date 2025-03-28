import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "./ui/button"
import { Calendar, Home } from "lucide-react"

export function Nav() {
  return (
    <nav className="border-b">
      <div className="max-w-5xl mx-auto flex items-center gap-6 px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link href="/schedule" className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule
        </Link>
        <div className="ml-auto">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
} 