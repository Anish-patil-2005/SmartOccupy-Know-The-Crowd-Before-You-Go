import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import FootfallLog from '@/models/FootfallLog';
import Store from '@/models/Store';

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming JSON from ESP32
    // matches: { "deviceId": "store_01", "entries": 1, "exits": 0 }
    const body = await req.json();
    const { deviceId, entries = 0, exits = 0 } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "Missing Device ID" }, { status: 400 });
    }

    await connectDB();

    // 2. Find the Store linked to this Sensor ID
    const store = await Store.findOne({ iotDeviceId: deviceId });

    if (!store) {
      // If ESP32 sends an ID that isn't in the DB, reject it
      return NextResponse.json({ error: "Device not registered in Admin Dashboard" }, { status: 404 });
    }

    // 3. Logic: Daily Reset Check
    // If the last update was yesterday, reset "Today's Visits" to 0
    const now = new Date();
    const lastReset = new Date(store.lastResetDate || 0);
    
    // Check if day, month, or year is different
    if (now.toDateString() !== lastReset.toDateString()) {
      store.todayVisits = 0;
      store.lastResetDate = now;
    }

    // 4. Logic: Calculate New Counts
    // Prevent negative numbers (e.g., if sensor error causes extra exits)
    let newCount = store.currentCount + (entries - exits);
    if (newCount < 0) newCount = 0;

    store.currentCount = newCount;
    
    // Only add to "Today's Visits" if people entered
    if (entries > 0) {
      store.todayVisits += entries;
    }

    // 5. Save to Database (This updates the Dashboard instantly)
    await store.save();

    // 6. Analytics: Log the event
    // This allows us to make charts later (e.g., "Peak hour was 6 PM")
    if (entries > 0) {
      await FootfallLog.create({ storeId: store._id, action: 'entry', timestamp: now });
    }
    if (exits > 0) {
      await FootfallLog.create({ storeId: store._id, action: 'exit', timestamp: now });
    }

    console.log(`✅ Update Success: ${store.name} | Count: ${newCount}`);

    // 7. Reply to ESP32
    return NextResponse.json({ 
      success: true, 
      newCount: store.currentCount 
    });

  } catch (error) {
    console.error("IoT Update Error:", error);
    return NextResponse.json({ error: "Server Internal Error" }, { status: 500 });
  }
}
// ```

// ### **2. The Integration Checklist**

// For the system to work, these 3 things must match exactly:

// 1.  **The Code ID:** In your Arduino code, you wrote `const char* deviceId = "store_01";`.
// 2.  **The Database ID:** In your **Admin Dashboard**, you must Edit your store and set "IoT Device ID" to `store_01`.
// 3.  **The Network:** Your ESP32 must be on the **same WiFi** as your laptop, and the `serverUrl` must use your laptop's IP (not `localhost`).



// ### **3. How to Test It (Without waiting for ESP32)**

// You can verify this backend logic works *right now* using a test tool.

// **Option A: Using Terminal (Curl)**
// Run this command while your Next.js app is running:
// ```bash
// curl -X POST http://localhost:3000/api/iot/update \
//      -H "Content-Type: application/json" \
//      -d '{"deviceId": "store_01", "entries": 1, "exits": 0}'
// ```

// **Option B: Using Browser Console (Easy)**
// 1.  Open your browser to `localhost:3000`.
// 2.  Right-click -> Inspect -> **Console**.
// 3.  Paste this JavaScript code and hit Enter:
//     ```javascript
//     fetch('/api/iot/update', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ deviceId: "store_01", entries: 1 })
//     }).then(r => r.json()).then(console.log);