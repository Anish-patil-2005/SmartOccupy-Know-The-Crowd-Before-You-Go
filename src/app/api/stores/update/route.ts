import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';

export async function PUT(req: Request) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Get Data
    const body = await req.json();
    const { name, address, category, maxCapacity } = body; // Note: We usually don't update iotDeviceId

    await connectDB();

    // 3. Update the store that belongs to THIS admin
    const updatedStore = await Store.findOneAndUpdate(
      { adminUserId: userId },
      { 
        name, 
        address, 
        category, 
        maxCapacity: Number(maxCapacity) 
      },
      { new: true } // Return the updated object
    );

    if (!updatedStore) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, store: updatedStore });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}