#include <WiFi.h>
#include <HTTPClient.h>

#define ENTRY_SENSOR 4
#define EXIT_SENSOR 5

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// 1. Update this to your local IP while testing, or your domain in production
const char* serverName = "http://192.168.X.X:3000/api/iot/update"; 

// 2. This must match the "IoT Device ID" you registered in your Portal
const char* deviceId = "IoT_1214"; 

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

  Serial.println("\nConnected to WiFi");
}

void loop() {
  int entryState = digitalRead(ENTRY_SENSOR);
  int exitState = digitalRead(EXIT_SENSOR);

  // --- Entry Trigger ---
  if (entryState == LOW && !entryLock) {
    count++;
    entryLock = true;
    Serial.println("Person Entered");
    // Send 1 entry to the server
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
    // Send 1 exit to the server
    sendCountToServer(0, 1);
  }

  if (exitState == HIGH) {
    exitLock = false;
  }

  delay(50);
}

// Updated function to accept entries/exits and send correct JSON

void sendCountToServer(int entries, int exits) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Set a timeout so a slow server doesn't hang your sensors
    http.setTimeout(2000); 

    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Using a dynamic JSON buffer or String 
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
    Serial.println("WiFi Disconnected. Data lost!");
    // Future: Add a buffer here to save data for later
  }
}