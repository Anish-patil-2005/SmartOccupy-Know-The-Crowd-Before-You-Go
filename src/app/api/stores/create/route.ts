import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Get Data from Form
    const body = await req.json();
    const { name, address, category, maxCapacity, iotDeviceId } = body;

    await connectDB();

    // 3. Check if this device ID is already taken
    const existingDevice = await Store.findOne({ iotDeviceId });
    if (existingDevice) {
      return NextResponse.json({ error: "IoT Device ID already active" }, { status: 400 });
    }

    // 4. Create the Store
    const newStore = await Store.create({
      adminUserId: userId, // Link to this admin
      name,
      address,
      category,
      maxCapacity: Number(maxCapacity),
      iotDeviceId,
      currentCount: 0 // Start empty
    });

    return NextResponse.json({ success: true, store: newStore });
  } catch (error) {
    console.error("Create Store Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}