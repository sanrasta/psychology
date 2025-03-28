"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loading from "@/components/Loading";

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Reset loading state when pathname changes (navigation completes)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Handle navigation with loading state
  const handleNavigation = (path: string) => {
    setIsLoading(true);
    router.push(path);
  };

  // Expose navigation function to window for use in child components
  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - Add a global navigate function
      window.navigateWithLoading = handleNavigation;
    }
    
    return () => {
      if (typeof window !== "undefined") {
        // @ts-ignore - Clean up
        delete window.navigateWithLoading;
      }
    };
  }, []);

  return (
    <>
      {isLoading && <Loading />}
      {children}
    </>
  );
} 