import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    const store = await Store.findOne({ adminUserId: userId });

    if (!store) {
      return NextResponse.json({ store: null });
    }

    // --- DYNAMIC CALCULATIONS ---
    
    // 1. Calculate Growth Percentage
    // Formula: ((Today - Yesterday) / Yesterday) * 100
    let growthPercent = 0;
    if (store.yesterdayVisits > 0) {
      growthPercent = ((store.todayVisits - store.yesterdayVisits) / store.yesterdayVisits) * 100;
    } else if (store.todayVisits > 0) {
      growthPercent = 100; // If yesterday was 0 and today is >0, treat as 100% growth
    }

    // 2. System Status Logic
    const occupancyPct = (store.currentCount / store.maxCapacity) * 100;
    let systemStatus = "All Good";
    let systemMessage = "Sensors active. No anomalies.";
    
    if (occupancyPct > 90) {
      systemStatus = "Critical";
      systemMessage = "Capacity exceeded. Stop entry.";
    } else if (occupancyPct > 80) {
      systemStatus = "Warning";
      systemMessage = "Crowd density high.";
    }

    // Return combined data
    return NextResponse.json({ 
      store,
      stats: {
        growth: Math.round(growthPercent),
        status: systemStatus,
        message: systemMessage
      }
    });

  } catch (error) {
    console.error("Fetch Store Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}