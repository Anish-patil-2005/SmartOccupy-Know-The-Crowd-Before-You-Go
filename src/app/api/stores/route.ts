import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Store from '@/models/Store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // .select('-field') excludes that field from the result
    const stores = await Store.find({})
      .select('-iotDeviceId -adminUserId -__v') 
      .sort({ currentCount: -1 }); // Show crowded stores first (or sort by name)

    return NextResponse.json({ stores });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 });
  }
}