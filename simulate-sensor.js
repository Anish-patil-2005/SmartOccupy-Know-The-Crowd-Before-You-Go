// simulate-sensor.js

// List of all active sensors
const SENSORS = ["IoT_1214", "IOT_1245"]; 
const API_URL = "http://127.0.0.1:3000/api/iot/update";

async function sendPulse() {
  // Pick a random store to update
  const randomDevice = SENSORS[Math.floor(Math.random() * SENSORS.length)];

  const isEntry = Math.random() > 0.5;

  const payload = {
    deviceId: randomDevice, // Dynamic ID
    entries: isEntry ? 1 : 0,
    exits: !isEntry ? 1 : 0
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if(res.ok) {
        console.log(`📡 ${randomDevice}: ${isEntry ? "IN" : "OUT"} | Count: ${data.newCount}`);
    }
  } catch (e) { console.log("Error", e.message); }
}

setInterval(sendPulse, 1000); // Fast updates!