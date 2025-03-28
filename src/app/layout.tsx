// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata = {
  title: "Personal Trainer App",
  description: "Book and manage your personal training sessions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} dark`}>
        <head>
          {/* Add preload for critical resources */}
          <link
            rel="preload"
            href="/rio.png"
            as="image"
            type="image/png"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="min-h-screen bg-black text-foreground">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}