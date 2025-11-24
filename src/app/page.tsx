import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    // 1. Improved Background: Subtle gradient + nice font antialiasing
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 overflow-hidden selection:bg-green-100">
      
      {/* Background decorative blob (Optional: adds a modern glow) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#dcfce7_100%)]"></div>

      <div className="container px-4 md:px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        
        {/* 2. Hero Image with Depth */}
        <div className="relative w-full max-w-[600px] mb-8 hover:scale-[1.02] transition-transform duration-500 ease-out">
            {/* Added a drop shadow to make the image pop off the screen */}
            <Image 
              src="/Cover_Page.png" 
              alt="SmartOccupy Cover"
              width={600}
              height={600}
              className="object-contain drop-shadow-2xl mx-auto"
              priority
            />
        </div>

        {/* 3. Text Hierarchy (Restored & Styled) */}
        {/* <div className="space-y-4 mb-10 animate-in slide-in-from-bottom-5 fade-in duration-700">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1a2c49] sm:text-5xl md:text-6xl">
            Smart<span className="text-[#61b259]">Occupy</span>
          </h1>
          <p className="mx-auto max-w-[700px] text-lg text-slate-600 md:text-xl font-medium">
            Know the Crowd Before You Go.
          </p>
        </div> */}

        {/* 4. Enhanced Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-in slide-in-from-bottom-5 fade-in duration-1000 fill-mode-backwards">
          
          {/* CASE 1: Not Logged In */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button 
                size="lg" 
                className="bg-[#61b259] hover:bg-[#4e9646] text-white shadow-lg shadow-green-100 hover:shadow-green-200 transition-all hover:scale-105 text-lg px-8 rounded-full"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
          </SignedOut>

          {/* CASE 2: Logged In */}
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all hover:scale-105 gap-2 px-8 rounded-full text-lg font-medium shadow-sm"
                >
                  <LayoutDashboard className="w-5 h-5 text-[#61b259]" />
                  Open Dashboard
                </Button>
              </Link>
              
              {/* Profile - Added a ring to make it stand out */}
              <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white ring-2 ring-slate-100 shadow-md transition-transform hover:scale-110">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          </SignedIn>

        </div>
      </div>
      
      {/* Footer / Legal (Optional polish) */}
      <footer className="absolute bottom-6 text-sm text-slate-400">
        © {new Date().getFullYear()} SmartOccupy. All rights reserved.
      </footer>

    </main>
  );
}