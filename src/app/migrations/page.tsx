"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MigrationsPage() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function runMigration() {
    try {
      setStatus("running");
      const response = await fetch("/api/migrations/run");
      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        setMessage("Database migration successful! The locationType column has been added.");
      } else {
        setStatus("error");
        setMessage(`Migration failed: ${data.error}`);
      }
    } catch (error) {
      setStatus("error");
      setMessage(`Error: ${error.message}`);
    }
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Database Migrations</h1>
      
      <div className="p-6 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Location Type Column</h2>
        <p className="text-gray-500 mb-4">
          This migration adds the locationType column to the events table.
        </p>
        
        <Button 
          onClick={runMigration}
          disabled={status === "running"}
        >
          {status === "running" ? "Running Migration..." : "Run Migration"}
        </Button>
        
        {status === "success" && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            {message}
          </div>
        )}
        
        {status === "error" && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
} 