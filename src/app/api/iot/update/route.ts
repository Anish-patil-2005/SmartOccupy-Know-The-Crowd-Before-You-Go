import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import FootfallLog from "@/models/FootfallLog";
import Store from "@/models/Store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { deviceId, entries = 0, exits = 0 } = body;

    if (!deviceId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await connectDB();
    const now = new Date();

    // STEP 1: Atomic Update
    // We update the numbers directly in MongoDB to prevent race conditions.
    const store = await Store.findOneAndUpdate(
      { iotDeviceId: deviceId },
      {
        $inc: {
          currentCount: entries - exits,
          todayVisits: entries,
        },
      },
      { new: true } 
    );

    if (!store) return NextResponse.json({ error: "Device not found" }, { status: 404 });

    // STEP 2: Safety & Reset Logic
    // We only call .save() if we actually need to correct a value (like < 0 or new day)
    let needsSave = false;

    // Prevent negative counts
    if (store.currentCount < 0) {
      store.currentCount = 0;
      needsSave = true;
    }

    // Daily Reset Check
    const lastReset = new Date(store.lastResetDate || 0);
    if (now.toDateString() !== lastReset.toDateString()) {
      store.todayVisits = entries; 
      store.lastResetDate = now;
      needsSave = true;
    }

    if (needsSave) await store.save();

    // STEP 3: Analytics Logging
    // Using Promise.all makes this faster
    const logs = [];
    if (entries > 0) logs.push(FootfallLog.create({ storeId: store._id, action: "entry", timestamp: now }));
    if (exits > 0) logs.push(FootfallLog.create({ storeId: store._id, action: "exit", timestamp: now }));
    await Promise.all(logs);

    console.log(`✅ ${store.name} Updated | Live: ${store.currentCount}`);

    return NextResponse.json({ success: true, newCount: store.currentCount });

  } catch (error) {
    console.error("IoT Update Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
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
