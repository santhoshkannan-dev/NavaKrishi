/*
 * =====================================================================
 * 🌱 NavaKrishi — Field Intelligence (IoT Sensor Node Firmware)
 * =====================================================================
 * Target Device: ESP32 Dev Module (ESP-WROOM-32)
 * Sensors:
 *   1. Capacitive / Resistive Soil Moisture Sensor (Analog Pin 34)
 *   2. DHT11 Temperature & Humidity Sensor (GPIO 4)
 *   3. Digital Rain Detection Sensor (GPIO 18)
 * 
 * Communication Protocol:
 *   - Wi-Fi 802.11 b/g/n (Station Mode)
 *   - HTTP REST POST to Django Backend endpoint: /api/iot/data/
 * 
 * Payload Schema:
 *   {
 *     "soil_moisture": 42,
 *     "temperature": 28.1,
 *     "humidity": 68.5,
 *     "is_raining": false
 *   }
 * =====================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ==========================================
// 1. NETWORK & BACKEND CONFIGURATION
// ==========================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Replace with the IP address of the machine running the Django server
// Ensure your computer and ESP32 are connected to the same Wi-Fi network
const char* DJANGO_HOST = "http://192.168.1.100:8000";
const char* IOT_ENDPOINT = "/api/iot/data/";
// Set this to the backend IOT_DEVICE_TOKEN before flashing the device.
const char* IOT_DEVICE_TOKEN = "";

// Telemetry transmit interval (in milliseconds)
const unsigned long TRANSMIT_INTERVAL_MS = 5000;

// ==========================================
// 2. HARDWARE PIN DEFINITIONS
// ==========================================
#define DHTPIN 4
#define DHTTYPE DHT11

#define SOIL_PIN 34    // ESP32 ADC1_CH6 (Analog Input)
#define RAIN_PIN 18    // Digital input from Rain module DO pin (Active LOW or HIGH)

// Soil Calibration Values (Tune with your specific sensor & soil sample)
// Air (dry) reading ~ 3500; Submerged in water ~ 1200
const int SOIL_DRY_RAW = 3400;
const int SOIL_WET_RAW = 1200;

DHT dht(DHTPIN, DHTTYPE);
unsigned long lastTransmitTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- Initializing NavaKrishi Field Node ---");

  // Initialize sensors
  dht.begin();
  pinMode(SOIL_PIN, INPUT);
  pinMode(RAIN_PIN, INPUT_PULLUP);

  // Connect to Wi-Fi
  connectToWiFi();
}

void loop() {
  // Maintain Wi-Fi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[!] Wi-Fi lost. Attempting reconnection...");
    connectToWiFi();
  }

  // Periodic sensor sampling & transmission
  if (millis() - lastTransmitTime >= TRANSMIT_INTERVAL_MS) {
    lastTransmitTime = millis();
    readAndTransmitTelemetry();
  }
}

void connectToWiFi() {
  Serial.printf("[WiFi] Connecting to %s ", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[!] Connection timed out. Will retry in main loop.");
  }
}

void readAndTransmitTelemetry() {
  // 1. Read DHT11
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  // Fallback in case of temporary read anomaly
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("[Sensor Warn] Failed to read from DHT11 sensor! Using fallback.");
    humidity = 65.0;
    temperature = 28.0;
  }

  // 2. Read Soil Moisture (Analog 12-bit ADC 0 - 4095)
  int rawSoil = analogRead(SOIL_PIN);
  // Map raw ADC to percentage 0 - 100%
  int soilPercent = map(rawSoil, SOIL_DRY_RAW, SOIL_WET_RAW, 0, 100);
  soilPercent = constrain(soilPercent, 0, 100);

  // 3. Read Rain Sensor (DO pin: LOW usually indicates conductive water drops)
  int rainDigital = digitalRead(RAIN_PIN);
  bool isRaining = (rainDigital == LOW);

  // 4. Construct JSON Payload
  StaticJsonDocument<256> doc;
  doc["soil_moisture"] = soilPercent;
  doc["temperature"] = serialized(String(temperature, 1));
  doc["humidity"] = serialized(String(humidity, 1));
  doc["is_raining"] = isRaining;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.println("\n[Telemetry Out] " + jsonPayload);

  // 5. Send HTTP POST to Django REST API
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String fullUrl = String(DJANGO_HOST) + String(IOT_ENDPOINT);

    http.begin(fullUrl);
    http.addHeader("Content-Type", "application/json");
    if (strlen(IOT_DEVICE_TOKEN) > 0) {
      http.addHeader("X-IOT-Device-Token", IOT_DEVICE_TOKEN);
    }

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("[HTTP] Status: %d\n", httpResponseCode);
      String responseBody = http.getString();
      Serial.println("[HTTP] Server Response: " + responseBody);
    } else {
      Serial.printf("[HTTP Err] POST failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("[HTTP Err] Cannot transmit — Wi-Fi not connected.");
  }
}
