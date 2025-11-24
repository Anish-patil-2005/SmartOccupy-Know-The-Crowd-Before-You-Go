"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Onboarding() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);

  const selectRole = async (role: "admin" | "customer") => {
    setLoading(role);
    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      
      if (res.ok) {
        // Reload user data so the app knows they now have a role
        await user?.reload();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-[400px] shadow-2xl animate-in fade-in zoom-in">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome! Who are you?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            variant="outline" 
            className="h-24 text-lg border-2 hover:border-blue-500 hover:bg-blue-50"
            onClick={() => selectRole("customer")}
            disabled={!!loading}
          >
            {loading === 'customer' ? "Saving..." : "🛍️ I am a Shopper"}
          </Button>

          <Button 
            variant="outline" 
            className="h-24 text-lg border-2 hover:border-green-500 hover:bg-green-50"
            onClick={() => selectRole("admin")}
            disabled={!!loading}
          >
            {loading === 'admin' ? "Saving..." : "🏪 I am a Store Owner"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}