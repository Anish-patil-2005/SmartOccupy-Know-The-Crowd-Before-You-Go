
# 🛍️ SmartOccupy: Know The Crowd Before You Go 
( Smart Crowd Monitoring & Suggestion System )
A full-stack IoT solution that bridges the physical and digital worlds.  
This system tracks real-time footfall in retail stores using IR sensors and provides actionable analytics for shop owners while helping customers shop safely by displaying live crowd levels.

# Live at : https://smart-occupy-know-the-crowd-before.vercel.app/
---

## 📑 Table of Contents
- 📖 Overview  
- ✨ Key Features  
- 🏗️ System Architecture  
- 🛠️ Tech Stack  
- 🚀 Getting Started (Software)  
- 📡 Getting Started (Hardware)  
- 🧪 Running the Simulator  
- 🔌 API Reference  
- 🗄️ Database Schema  
- 🔮 Future Scope  
- 📄 License  

---

## 📖 Overview

In the post-pandemic era, managing crowd density is crucial for safety and customer experience. Traditional manual counting is expensive and prone to error.

This project solves that by:

- **Automating Counts:** Using localized IoT sensors (ESP32 + IR) to detect entry and exit.  
- **Real-Time Sync:** Instantly updating a cloud dashboard via secure API.  
- **Democratizing Data:** Giving customers a "Google Maps" style directory to check if a store is crowded before they leave home.

---

## ✨ Key Features

### 🏢 For Shop Owners (Admin Portal)

- **Live Footfall Counter:** Real-time updates of “People Inside”.  
- **Visual Alerts:** Dashboard turns RED and pulses when occupancy > 80%.  
- **Analytics:** Hourly charts showing visitor trends and peak hours.  
- **Store Management:** Configure Max Capacity, Store Name, and link IoT Devices.  
- **Role-Based Access:** Secure login (Admin role required).  

---

### 🛒 For Shoppers (Customer Portal)

- **Smart Directory:** Search stores by name, category, or location (floor/level).  
- **Live Traffic Indicators:**  
  - 🟢 **Low Traffic** (<50% capacity)  
  - 🟡 **Moderate** (50–80%)  
  - 🔴 **High** (>80%)  
- **Interactive Map:** View stores on a Leaflet/OpenStreetMap interface.  
- **Smart Navigation:** One-click “Navigate” button opens Google Maps with store address pre-filled.

---

## 🏗️ System Architecture

The system uses an **Event-Driven Architecture**:

1. **Sensing:** IR Sensors detect beam breaks → determines “Entry” or “Exit”.  
2. **Transmission:** ESP32 sends JSON payload via HTTPS POST to API.  
3. **Processing:** Next.js API validates Device ID, updates occupancy count, and logs timestamp.  
4. **Storage:** MongoDB Atlas stores real-time + historical data.  
5. **Visualization:** SWR + Server/Client Components render live dashboard.

### **Data Flow**

```

Physical Event → ESP32 → Next.js API Route → MongoDB → SWR/Polling → UI Update

````

---

## 🛠️ Tech Stack

### **Software (Web)**

| Layer | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Authentication | Clerk (RBAC Middleware) |
| Database | MongoDB Atlas + Mongoose ORM |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |

---

### **Hardware (IoT)**

| Component | Details |
|----------|----------|
| Microcontroller | ESP32 (DOIT DEVKIT V1) |
| Sensors | 2× IR Proximity Sensors |
| Protocol | HTTP (JSON over WiFi) |

---

## 🚀 Getting Started (Software)

### **Prerequisites**
- Node.js v18+  
- MongoDB Atlas account (Free Tier)  
- Clerk Account  

---

### **1. Clone the Repository**

```bash
git clone https://github.com/your-username/crowd-monitor.git
cd crowd-monitor
````

---

### **2. Install Dependencies**

```bash
npm install
```

---

### **3. Configure Environment**

Create **`.env.local`**:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crowd_monitor
```

---

### **4. Run the Development Server**

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📡 Getting Started (Hardware)

### **Wiring**

| Component        | ESP32 Pin |
| ---------------- | --------- |
| Sensor A (Entry) | GPIO 15   |
| Sensor B (Exit)  | GPIO 14   |
| LCD SDA          | GPIO 21   |
| LCD SCL          | GPIO 22   |

---

### **Setup Steps**

1. Install Arduino IDE
2. Install libraries:

   * ArduinoJson
   * LiquidCrystal_I2C
3. Open `ESP32_IoT_Sensor_Final.ino`
4. Update WiFi + API Config:

```cpp
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "https://your-app.vercel.app/api/iot/update";
const char* deviceId = "store_01";  // Must match Admin Dashboard ID
```

5. Upload the code to ESP32.

---

## 🧪 Running the Simulator

If you don't have hardware, use the simulator.

### **Steps:**

Ensure server is running:

```bash
npm run dev
```

Open a new terminal:

```bash
node simulate-sensor.js
```

Watch the dashboard update live!

---

## 🔌 API Reference

### **1. Update Footfall (IoT Endpoint)**

Receives data from ESP32.

**URL:** `/api/iot/update`
**Method:** `POST`

#### **Body:**

```json
{
  "deviceId": "store_01",
  "entries": 1,
  "exits": 0
}
```

---

### **2. Get Public Stores**

**URL:** `/api/stores`
**Method:** `GET`

---

### **3. Get Admin Store**

**URL:** `/api/stores/mine`
**Method:** `GET`
**Auth:** Clerk Session Cookie (automatically handled)

---

## 🗄️ Database Schema

### **Store Collection**

| Field        | Type   | Description                |
| ------------ | ------ | -------------------------- |
| adminUserId  | String | Links store to Clerk admin |
| iotDeviceId  | String | Unique ESP32 ID            |
| currentCount | Number | Current occupancy          |
| todayVisits  | Number | Total entries today        |
| maxCapacity  | Number | For alerting               |
| lat          | Number | Map latitude               |
| lng          | Number | Map longitude              |

---

### **FootfallLog Collection**

| Field     | Type             | Description        |
| --------- | ---------------- | ------------------ |
| storeId   | ObjectId         | Reference to store |
| action    | "entry" / "exit" | Movement type      |
| timestamp | Date             | Exact event time   |

---

## 🔮 Future Scope

* **AI Prediction:** Predict footfall for next hour/day.
* **Mobile App:** React Native version for customers.

---

## 📄 License

This project is open-source and available under the **MIT License**.

Built with ❤️ by *Anish Patil* | *Sanket Wagh*


