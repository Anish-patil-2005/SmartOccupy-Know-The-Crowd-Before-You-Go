#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ---------------- 1. CONFIGURATION (CHANGE THESE) ----------------
const char* ssid = "YOUR_WIFI_NAME";       // REPLACE with your WiFi Name (Case Sensitive)
const char* password = "YOUR_WIFI_PASSWORD"; // REPLACE with your WiFi Password

// REPLACE 192.168.X.X with your laptop's IP address found in Step 2
// Keep the :3000/api/iot/update part exactly as is.
const char* serverUrl = "http://192.168.1.5:3000/api/iot/update"; 

// This MUST match the "IoT Device ID" you entered in your Shop Dashboard
const char* deviceId = "store_01";   

// ---------------- 2. SENSOR PINS ----------------
// Ensure your wiring matches these pins on the ESP32 board
int pin_in = 15;    // Entry Sensor OUT pin
int pin_out = 14;   // Exit Sensor OUT pin

// You are using GPIO pins to power the sensors. 
// This works for small IR sensors, but ensure they don't draw too much current.
int powerIn = 16;   // Connect Entry Sensor VCC here
int powerOut = 17;  // Connect Exit Sensor VCC here

// Variables to track state
bool inState = 0;
bool outState = 0;

void setup() {
  Serial.begin(115200);

  // Configure pins
  pinMode(pin_in, INPUT);
  pinMode(pin_out, INPUT);
  pinMode(powerIn, OUTPUT);
  pinMode(powerOut, OUTPUT);

  // Power ON sensors
  digitalWrite(powerIn, HIGH);
  digitalWrite(powerOut, HIGH);

  delay(1000); // Give sensors a moment to wake up

  // Connect to WiFi
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  // Wait for connection with visual feedback
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read Sensors
  inState = digitalRead(pin_in);
  outState = digitalRead(pin_out);

  // NOTE: Some IR sensors go LOW when obstructed, some go HIGH.
  // If your count goes up when NOTHING is there, change HIGH to LOW below.
  
  // ---- ENTRY EVENT ----
  if (inState == HIGH) { 
    Serial.println("Entry Detected! Sending...");
    sendData(1, 0);   
    delay(1500);      // Debounce delay to prevent counting the same person twice
  }

  // ---- EXIT EVENT ----
  else if (outState == HIGH) {
    Serial.println("Exit Detected! Sending...");
    sendData(0, 1);   
    delay(1500);
  }
}

// ---------------- SEND DATA FUNCTION ----------------
void sendData(int entry, int exit) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Start connection
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Create JSON Payload
    // Use DynamicJsonDocument for compatibility with newer libraries
    DynamicJsonDocument doc(200);
    doc["deviceId"] = deviceId;
    doc["entries"] = entry;
    doc["exits"] = exit;

    String jsonBody;
    serializeJson(doc, jsonBody);

    // Send Request
    int httpResponseCode = http.POST(jsonBody);

    // Check Result
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Server Replied: ");
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
      Serial.println("Check: 1. Is Laptop IP correct? 2. Is Next.js running? 3. Firewall?");
    }

    http.end(); // Free resources
  } else {
    Serial.println("WiFi Disconnected");
  }
}