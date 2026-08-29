/*
 * SMART RAINWATER HARVESTING & AUTOMATIC IRRIGATION SYSTEM
 * Controller: NodeMCU ESP8266 (ESP-12E Module)
 * 
 * HARDWARE PIN CONTRACT:
 * - Soil Moisture Sensor (Analog): A0
 * - DHT22 Temperature & Humidity Sensor: D4 (GPIO2)
 * - HC-SR04 Ultrasonic Trigger: D5 (GPIO14)
 * - HC-SR04 Ultrasonic Echo: D6 (GPIO12)
 * - Relay 1 (Pump 1 - Rainwater Tank): D1 (GPIO5)
 * - Relay 2 (Pump 2 - Normal Water Tank): D2 (GPIO4)
 * 
 * Power Requirements:
 * - Common GND for all modules.
 * - NodeMCU & Sensors: 5V VCC via 18650 Li-ion battery + 5V Boost Converter.
 * - Water Pumps: Separate 12V DC external power supply switched via Relay COM/NO contacts.
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ─── Wi-Fi Credentials ──────────────────────────────────────────
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ─── Pin Definitions ────────────────────────────────────────────
#define PIN_SOIL_ANALOG  A0
#define PIN_DHT_DATA     D4
#define PIN_HCSR04_TRIG  D5
#define PIN_HCSR04_ECHO  D6
#define PIN_RELAY_PUMP1  D1
#define PIN_RELAY_PUMP2  D2

#define DHTTYPE DHT22
DHT dht(PIN_DHT_DATA, DHTTYPE);
ESP8266WebServer server(80);

// ─── Default Thresholds ─────────────────────────────────────────
int soilDryThreshold = 40;        // % below which irrigation is required
int soilMoistThreshold = 55;      // % at which irrigation stops
int tankLowThreshold = 20;        // % below which pump 2 (normal water) is used
float tankHeightCm = 30.0;        // Total inner height of the tank
float sensorOffsetCm = 2.0;       // Distance from sensor to 100% full waterline

// ─── System State ───────────────────────────────────────────────
bool autoMode = true;
bool pump1Active = false;
bool pump2Active = false;
bool irrigationRequired = false;

float temperature = 28.0;
float humidity = 60.0;
int soilRaw = 500;
int soilMoisture = 50;
float distanceCm = 10.0;
int waterLevelPct = 70;
unsigned long lastSensorRead = 0;

// ─── CORS Header Helper ─────────────────────────────────────────
void addCorsHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

// ─── Measure HC-SR04 Ultrasonic Distance ────────────────────────
float readUltrasonicDistanceCm() {
  digitalWrite(PIN_HCSR04_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_HCSR04_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_HCSR04_TRIG, LOW);

  long duration = pulseIn(PIN_HCSR04_ECHO, HIGH, 30000); // 30ms timeout (~5m)
  if (duration == 0) return -1.0; // Sensor timeout / error
  return (duration * 0.0343) / 2.0;
}

// ─── Read All Physical Sensors ──────────────────────────────────
void readSensors() {
  // 1. DHT22
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  if (!isnan(t)) temperature = t;
  if (!isnan(h)) humidity = h;

  // 2. Soil Moisture (Analog A0: 0-1023, dry is high ADC value)
  soilRaw = analogRead(PIN_SOIL_ANALOG);
  // Calibration: adjust 1023 (dry air) and 350 (saturated water)
  int mappedMoisture = map(soilRaw, 1023, 350, 0, 100);
  soilMoisture = constrain(mappedMoisture, 0, 100);

  // 3. HC-SR04 Ultrasonic
  distanceCm = readUltrasonicDistanceCm();
  if (distanceCm < 0) {
    waterLevelPct = 0;
  } else {
    float maxWaterDepth = max(1.0f, tankHeightCm - sensorOffsetCm);
    float clampedDist = constrain(distanceCm, sensorOffsetCm, tankHeightCm);
    float waterDepth = tankHeightCm - clampedDist;
    waterLevelPct = constrain((int)round((waterDepth / maxWaterDepth) * 100.0), 0, 100);
  }

  // 4. Autonomous Irrigation Logic (Hysteresis)
  if (autoMode) {
    if (!irrigationRequired && soilMoisture < soilDryThreshold) {
      irrigationRequired = true;
    } else if (irrigationRequired && soilMoisture >= soilMoistThreshold) {
      irrigationRequired = false;
    }

    if (irrigationRequired) {
      if (waterLevelPct > tankLowThreshold && distanceCm >= 0) {
        pump1Active = true;
        pump2Active = false;
      } else {
        pump1Active = false;
        pump2Active = true;
      }
    } else {
      pump1Active = false;
      pump2Active = false;
    }

    // Active LOW relay control
    digitalWrite(PIN_RELAY_PUMP1, pump1Active ? LOW : HIGH);
    digitalWrite(PIN_RELAY_PUMP2, pump2Active ? LOW : HIGH);
  }
}

// ─── HTTP API Handlers ──────────────────────────────────────────

void handleOptions() {
  addCorsHeaders();
  server.send(204);
}

void handleStatus() {
  addCorsHeaders();
  DynamicJsonDocument doc(256);
  doc["connected"] = true;
  doc["device"] = "NodeMCU ESP8266";
  doc["ip"] = WiFi.localIP().toString();
  doc["uptime"] = millis() / 1000;
  doc["mode"] = autoMode ? "automatic" : "manual";
  doc["firmwareVersion"] = "1.4.2";

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handleSensors() {
  addCorsHeaders();
  DynamicJsonDocument doc(512);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilRaw"] = soilRaw;
  doc["soilMoisture"] = soilMoisture;
  doc["distance"] = distanceCm;
  doc["waterLevel"] = waterLevelPct;
  doc["irrigationRequired"] = irrigationRequired;
  doc["pump1"] = pump1Active;
  doc["pump2"] = pump2Active;
  doc["autoMode"] = autoMode;
  doc["uptime"] = millis() / 1000;

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handlePumps() {
  addCorsHeaders();
  DynamicJsonDocument doc(128);
  doc["pump1"] = pump1Active;
  doc["pump2"] = pump2Active;

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handleControl() {
  addCorsHeaders();
  String action = server.arg("action");

  if (action == "auto") {
    autoMode = true;
  } else if (action == "manual") {
    autoMode = false;
  } else if (action == "pump1_on") {
    autoMode = false;
    pump1Active = true;
    pump2Active = false;
  } else if (action == "pump1_off") {
    autoMode = false;
    pump1Active = false;
  } else if (action == "pump2_on") {
    autoMode = false;
    pump2Active = true;
    pump1Active = false;
  } else if (action == "pump2_off") {
    autoMode = false;
    pump2Active = false;
  } else if (action == "all_off") {
    autoMode = false;
    pump1Active = false;
    pump2Active = false;
  }

  digitalWrite(PIN_RELAY_PUMP1, pump1Active ? LOW : HIGH);
  digitalWrite(PIN_RELAY_PUMP2, pump2Active ? LOW : HIGH);

  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

// ─── Setup ──────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(PIN_HCSR04_TRIG, OUTPUT);
  pinMode(PIN_HCSR04_ECHO, INPUT);
  pinMode(PIN_RELAY_PUMP1, OUTPUT);
  pinMode(PIN_RELAY_PUMP2, OUTPUT);

  // Default relays to OFF (HIGH on active LOW modules)
  digitalWrite(PIN_RELAY_PUMP1, HIGH);
  digitalWrite(PIN_RELAY_PUMP2, HIGH);

  dht.begin();

  Serial.println("\nConnecting to Wi-Fi: " + String(ssid));
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("NodeMCU ESP8266 IP Address: ");
  Serial.println(WiFi.localIP());

  // Endpoints
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/api/status", HTTP_OPTIONS, handleOptions);
  server.on("/api/sensors", HTTP_GET, handleSensors);
  server.on("/api/sensors", HTTP_OPTIONS, handleOptions);
  server.on("/api/data", HTTP_GET, handleSensors);
  server.on("/api/data", HTTP_OPTIONS, handleOptions);
  server.on("/api/pumps", HTTP_GET, handlePumps);
  server.on("/api/pumps", HTTP_OPTIONS, handleOptions);
  server.on("/control", HTTP_GET, handleControl);
  server.on("/control", HTTP_OPTIONS, handleOptions);

  server.begin();
  Serial.println("HTTP REST Server Started!");
}

// ─── Main Loop ──────────────────────────────────────────────────
void loop() {
  server.handleClient();

  if (millis() - lastSensorRead >= 1500) {
    lastSensorRead = millis();
    readSensors();
  }
}
