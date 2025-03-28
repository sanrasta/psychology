import { auth } from "@clerk/nextjs/server";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth(); // Await `auth()` synchronously
  if (userId) redirect("/events"); // Redirect if user is signed in

  return <div className="min-h-screen flex flex-col justify-center items-center">{children}</div>;
}