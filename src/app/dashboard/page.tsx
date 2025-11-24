"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Image from 'next/image';
import Onboarding from "@/components/ui/Onboarding"; 
import ShopDashboard from "@/components/dashboard/ShopDashboard";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";

export default function Dashboard() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-slate-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const role = user?.publicMetadata?.role as string | undefined;

  // 1. No Role? -> Onboarding
  if (!role) return <Onboarding />;

  // 2. Render the Layout
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Common Header for Everyone */}
      <header className="sticky top-0 z-30 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-6 py-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            {/* Simple Logo Icon */}
            <div className="h-8 w-8  text-white rounded flex items-center justify-center">
              <img src="/favicon.ico" alt="" />
            </div>
            <span>{role === 'admin' ? 'SmartOccupy | Admin ' : 'SmartOccupy | Customer'}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 hidden md:inline-block">
               {user?.primaryEmailAddress?.emailAddress}
             </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* 3. Traffic Control Logic */}
      <main className="container mx-auto p-6">
        {role === 'admin' ? <ShopDashboard /> : <CustomerDashboard />}
      </main>
    </div>
  );
}