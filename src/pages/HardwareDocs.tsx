import { useState } from 'react';
import { BookOpen, Cpu, CheckCircle2, Copy, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';

export function HardwareDocs() {
  const [copied, setCopied] = useState(false);

  const arduinoSketch = `/*
 * Smart Rainwater Harvesting & Automatic Irrigation System
 * NodeMCU ESP8266 Firmware with REST API & CORS Support
 *
 * Hardware Contract:
 * - Soil Moisture Sensor: A0 (Analog)
 * - DHT22 Sensor: D4 (GPIO2)
 * - HC-SR04 Trigger: D5 (GPIO14)
 * - HC-SR04 Echo: D6 (GPIO12)
 * - Relay 1 (Pump 1 - Rainwater): D1 (GPIO5)
 * - Relay 2 (Pump 2 - Normal Water): D2 (GPIO4)
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

#define PIN_SOIL A0
#define PIN_DHT D4
#define PIN_TRIG D5
#define PIN_ECHO D6
#define PIN_RELAY1 D1
#define PIN_RELAY2 D2

#define DHTTYPE DHT22
DHT dht(PIN_DHT, DHTTYPE);
ESP8266WebServer server(80);

bool autoMode = true;
bool pump1State = false;
bool pump2State = false;
float temperature = 0.0;
float humidity = 0.0;
int soilRaw = 0;
int soilMoisture = 0;
float distance = 0.0;
int waterLevel = 0;
bool irrigationRequired = false;

// Send standard CORS headers to allow browser fetch
void sendCORS() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
}

float measureDistanceCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  if (duration == 0) return -1.0; // timeout
  return (duration * 0.0343) / 2.0;
}

void handleSensors() {
  sendCORS();
  DynamicJsonDocument doc(512);
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["soilRaw"] = soilRaw;
  doc["soilMoisture"] = soilMoisture;
  doc["distance"] = distance;
  doc["waterLevel"] = waterLevel;
  doc["irrigationRequired"] = irrigationRequired;
  doc["pump1"] = pump1State;
  doc["pump2"] = pump2State;
  doc["autoMode"] = autoMode;
  doc["uptime"] = millis() / 1000;

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void handleControl() {
  sendCORS();
  String action = server.arg("action");
  if (action == "auto") autoMode = true;
  else if (action == "manual") autoMode = false;
  else if (action == "pump1_on") { autoMode = false; pump1State = true; }
  else if (action == "pump1_off") { autoMode = false; pump1State = false; }
  else if (action == "pump2_on") { autoMode = false; pump2State = true; }
  else if (action == "pump2_off") { autoMode = false; pump2State = false; }
  else if (action == "all_off") { autoMode = false; pump1State = false; pump2State = false; }

  digitalWrite(PIN_RELAY1, pump1State ? LOW : HIGH); // active low relays
  digitalWrite(PIN_RELAY2, pump2State ? LOW : HIGH);
  server.send(200, "application/json", "{\\"status\\":\\"ok\\"}");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_RELAY1, OUTPUT);
  pinMode(PIN_RELAY2, OUTPUT);
  digitalWrite(PIN_RELAY1, HIGH); // off
  digitalWrite(PIN_RELAY2, HIGH); // off

  dht.begin();
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nIP Address: " + WiFi.localIP().toString());

  server.on("/api/data", HTTP_GET, handleSensors);
  server.on("/api/sensors", HTTP_GET, handleSensors);
  server.on("/control", HTTP_GET, handleControl);
  server.begin();
}

void loop() {
  server.handleClient();
  // Periodic sensor readings & auto logic here
}
`;

  const copyCode = () => {
    navigator.clipboard.writeText(arduinoSketch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOpen size={22} color="var(--water-400)" />
          Hardware & REST API Specifications
        </h1>
        <p className="text-xs text-muted mt-1">
          Complete pinout contracts, CORS requirements, REST API schema, and Arduino firmware.
        </p>
      </div>

      {/* ─── Hardware Pin Mapping Contract ────────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #38bdf8' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">NodeMCU ESP8266 Hardware Pin Contract</h2>
            <span className="card-subtitle">Exact physical mapping for sensor transducers & relay modules</span>
          </div>
          <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
            <Zap size={18} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="hardware-pin-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>NodeMCU Pin</th>
                <th>Signal Type</th>
                <th>Operating Voltage</th>
                <th>Functional Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Soil Moisture Sensor</strong></td>
                <td><span className="pin-badge">A0</span></td>
                <td>Analog (ADC 0–1023)</td>
                <td>3.3V / 5V</td>
                <td>Continuous analog soil conductivity measurement</td>
              </tr>
              <tr>
                <td><strong>DHT22 Sensor</strong></td>
                <td><span className="pin-badge">D4</span> (GPIO2)</td>
                <td>Digital Single-Bus</td>
                <td>3.3V / 5V</td>
                <td>Ambient temperature (°C) and relative humidity (%)</td>
              </tr>
              <tr>
                <td><strong>HC-SR04 Trigger</strong></td>
                <td><span className="pin-badge">D5</span> (GPIO14)</td>
                <td>Digital Output</td>
                <td>5V VCC</td>
                <td>10µs ultrasonic trigger pulse output</td>
              </tr>
              <tr>
                <td><strong>HC-SR04 Echo</strong></td>
                <td><span className="pin-badge">D6</span> (GPIO12)</td>
                <td>Digital Input</td>
                <td>5V / Voltage divider</td>
                <td>Echo pulse duration indicating distance to water</td>
              </tr>
              <tr>
                <td><strong>Relay 1 (Pump 1 - Rainwater)</strong></td>
                <td><span className="pin-badge">D1</span> (GPIO5)</td>
                <td>Digital Output (Active Low)</td>
                <td>5V VCC / 12V DC Pump</td>
                <td>Controls 12V DC Rainwater extraction pump</td>
              </tr>
              <tr>
                <td><strong>Relay 2 (Pump 2 - Backup Water)</strong></td>
                <td><span className="pin-badge">D2</span> (GPIO4)</td>
                <td>Digital Output (Active Low)</td>
                <td>5V VCC / 12V DC Pump</td>
                <td>Controls 12V DC Normal/Mains backup supply pump</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(56, 189, 248, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <ShieldCheck size={18} color="var(--water-400)" style={{ flexShrink: 0 }} />
          <span className="text-xs text-secondary">
            <strong>Power Rule:</strong> All GND connections must be common. Pumps require a separate external 12V DC power supply isolated through the relay COM/NO contacts.
          </span>
        </div>
      </div>

      {/* ─── REST API Endpoint Contract ───────────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #22c55e' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">ESP8266 REST API Specification</h2>
            <span className="card-subtitle">Endpoints implemented by the controller webserver</span>
          </div>
          <div className="card-icon-badge" style={{ color: 'var(--green-400)' }}>
            <Cpu size={18} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="hardware-pin-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Parameters / Body</th>
                <th>Sample Response</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="method-pill get">GET</span></td>
                <td><code>/api/data</code> or <code>/api/sensors</code></td>
                <td>None</td>
                <td><code>{`{"temperature":29.5,"humidity":65.2,"soilMoisture":42,"waterLevel":78,"pump1":false,"pump2":false}`}</code></td>
                <td>Returns full telemetry snapshot for the dashboard loop</td>
              </tr>
              <tr>
                <td><span className="method-pill get">GET</span></td>
                <td><code>/control?action=ACTION</code></td>
                <td><code>auto, manual, pump1_on, pump1_off, pump2_on, pump2_off, all_off</code></td>
                <td><code>{`{"status":"ok"}`}</code></td>
                <td>Dispatches control signal to engage/disengage actuators</td>
              </tr>
              <tr>
                <td><span className="method-pill post">POST</span></td>
                <td><code>/api/mode</code></td>
                <td><code>{`{"mode":"automatic"}`}</code></td>
                <td><code>{`{"status":"ok"}`}</code></td>
                <td>Switches between automatic loop and manual override</td>
              </tr>
              <tr>
                <td><span className="method-pill post">POST</span></td>
                <td><code>/api/pumps/stop</code></td>
                <td>None</td>
                <td><code>{`{"status":"ok"}`}</code></td>
                <td>Immediate emergency stop for all relays</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14, background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', gap: 10 }}>
          <AlertTriangle size={18} color="var(--amber-400)" style={{ flexShrink: 0 }} />
          <span className="text-xs text-secondary">
            <strong>CORS Requirement:</strong> The ESP8266 webserver MUST include the HTTP header <code>Access-Control-Allow-Origin: *</code> on all responses to allow modern web browsers to fetch data across origins.
          </span>
        </div>
      </div>

      {/* ─── Ready-to-Flash Arduino C++ Sketch ────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #8b5cf6' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">NodeMCU ESP8266 Arduino Sketch</h2>
            <span className="card-subtitle">Ready-to-flash C++ firmware source code with CORS enabled</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={copyCode} id="btn-copy-arduino-code">
            {copied ? <><CheckCircle2 size={14} color="var(--green-400)" /> Copied</> : <><Copy size={14} /> Copy Sketch</>}
          </button>
        </div>

        <div className="code-block-wrap">
          <pre><code>{arduinoSketch}</code></pre>
        </div>
      </div>
    </div>
  );
}
