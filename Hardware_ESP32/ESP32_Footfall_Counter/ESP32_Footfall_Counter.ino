#include <WiFi.h>
#include <HTTPClient.h>

#define ENTRY_SENSOR 4
#define EXIT_SENSOR 5

// --- 1. CREDENTIALS ---
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// --- 2. PRODUCTION SETTINGS ---
// Vercel URL (Use your live link)
const char* serverName = "https://smart-occupy-know-the-crowd-before.vercel.app/api/iot/update"; 

// This must match the "IoT Device ID" in your Admin Dashboard
const char* deviceId = "IoT_1214"; 

// This MUST match the ESP32_API_KEY you set in Vercel Environment Variables
const char* apiKey = "jdhfksgdghiwuhu376273hjfhdsk"; 

int count = 0;
bool entryLock = false;
bool exitLock = false;

void setup() {
  Serial.begin(115200);

  pinMode(ENTRY_SENSOR, INPUT);
  pinMode(EXIT_SENSOR, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Connected to WiFi");
}

void loop() {
  // Check WiFi status and reconnect if lost (Self-Healing)
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnecting to WiFi...");
    WiFi.begin(ssid, password);
    delay(1000); 
    return; // Skip the rest of the loop until reconnected
  }

  int entryState = digitalRead(ENTRY_SENSOR);
  int exitState = digitalRead(EXIT_SENSOR);

  // --- Entry Trigger ---
  if (entryState == LOW && !entryLock) {
    count++;
    entryLock = true;
    Serial.println("Person Entered");
    sendCountToServer(1, 0); 
  }

  if (entryState == HIGH) {
    entryLock = false;
  }

  // --- Exit Trigger ---
  if (exitState == LOW && !exitLock) {
    if (count > 0) count--;
    exitLock = true;
    Serial.println("Person Exited");
    sendCountToServer(0, 1);
  }

  if (exitState == HIGH) {
    exitLock = false;
  }

  delay(50);
}

void sendCountToServer(int entries, int exits) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Set timeout to 2 seconds so the sensors don't freeze on slow WiFi
    http.setTimeout(2000); 

    http.begin(serverName);
    
    // --- SECURITY HEADERS ---
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-api-key", apiKey); // This is your "Digital ID card"

    // Constructing JSON
    String jsonData = "{\"deviceId\":\"" + String(deviceId) + 
                     "\",\"entries\":" + String(entries) + 
                     ",\"exits\":" + String(exits) + "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.printf("HTTP %d: Data Synced\n", httpResponseCode);
    } else {
      Serial.printf("Error %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Data not sent.");
  }
}