"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function RunMigrationPage() {
  const [status, setStatus] = useState<string>("idle");
  const [tables, setTables] = useState<any[]>([]);
  const [meetingsTableExists, setMeetingsTableExists] = useState<boolean>(false);

  // Function to create the meetings table
  async function createMeetingsTable() {
    setStatus("creating_meetings_table");
    try {
      // Execute SQL query directly
      const response = await fetch("/api/migrations/create-meetings-table", {
        method: "POST",
      });
      const result = await response.json();
      
      setStatus(result.success ? "meetings_table_created" : "meetings_table_error");
      if (!result.success) {
        console.error("Failed to create meetings table:", result.error);
      } else {
        // Refresh schema after creating table
        await checkCurrentSchema();
      }
    } catch (error) {
      console.error("Error creating meetings table:", error);
      setStatus("meetings_table_error");
    }
  }

  // Function to check schema
  async function checkCurrentSchema() {
    try {
      setStatus("checking_schema");
      
      const response = await fetch("/api/migrations/check-schema");
      const result = await response.json();
      
      if (result.success) {
        setTables(result.tables || []);
        setMeetingsTableExists(result.meetingsTableExists || false);
        setStatus("schema_checked");
      } else {
        setStatus("schema_check_error");
      }
    } catch (error) {
      console.error("Schema check error:", error);
      setStatus("schema_check_error");
    }
  }

  // Check schema on initial load
  useEffect(() => {
    checkCurrentSchema();
  }, []);

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Database Migration Tool</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
          </CardHeader>
          <CardContent>
            {status === "checking_schema" && <p>Checking schema...</p>}
            {status === "schema_check_error" && <p className="text-red-500">Error checking schema</p>}
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Tables in Database:</h3>
              <div className="bg-gray-100 p-4 rounded overflow-auto">
                <ul className="space-y-2">
                  {tables.map((table, i) => (
                    <li key={i} className="flex items-center">
                      {typeof table === 'object' ? table.table_name : table}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex items-center">
              <h3 className="font-semibold">Meetings Table:</h3>
              <div className="ml-4">
                {meetingsTableExists ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Table exists</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-5 w-5 mr-2" />
                    <span>Table does not exist</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={checkCurrentSchema}>Refresh Schema</Button>
            </div>
          </CardContent>
        </Card>
        
        {!meetingsTableExists && (
          <Card>
            <CardHeader>
              <CardTitle>Create Meetings Table</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This will create the meetings table in your database, needed for booking functionality.
              </p>
              
              <Button 
                onClick={createMeetingsTable} 
                disabled={status === "creating_meetings_table"}
                className="mr-4"
              >
                {status === "creating_meetings_table" ? "Creating Table..." : "Create Meetings Table"}
              </Button>
              
              {status === "meetings_table_created" && (
                <span className="text-green-500">Meetings table created successfully!</span>
              )}
              
              {status === "meetings_table_error" && (
                <span className="text-red-500">Failed to create meetings table. Check console for details.</span>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 