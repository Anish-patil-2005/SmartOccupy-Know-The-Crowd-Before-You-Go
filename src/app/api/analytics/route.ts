import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';
import FootfallLog from '@/models/FootfallLog';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // 1. Find the User's Store
    const store = await Store.findOne({ adminUserId: userId });
    if (!store) return NextResponse.json({ error: "No store found" }, { status: 404 });

    // 2. Define Time Range (Today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 3. AGGREGATION: Group logs by Hour
    const logs = await FootfallLog.aggregate([
      {
        $match: {
          storeId: store._id,
          action: 'entry', // We only chart "Visits" (Entries), not Exits
          timestamp: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: { $hour: "$timestamp" }, // Group by the Hour (0-23)
          count: { $sum: 1 }            // Count how many entries in that hour
        }
      },
      { $sort: { "_id": 1 } } // Sort by hour (morning to night)
    ]);

    // 4. Format Data for the Chart (Fill in missing hours with 0)
    const chartData = Array.from({ length: 24 }, (_, i) => {
      const found = logs.find(l => l._id === i);
      return {
        hour: `${i}:00`,
        visitors: found ? found.count : 0
      };
    });

    return NextResponse.json({ chartData });

  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}