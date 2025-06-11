#include <WiFi.h>
#include <HTTPClient.h>

// === WiFi Credentials ===
const char* ssid = "CIT-Campus";
const char* password = "CIT@#&2104";

// === InfluxDB 2.0 Settings ===
const char* influxUrl = "http://172.16.9.22/api/v2/write?org=Tech4earth&bucket=Motion_detection&precision=s";
const char* token = "35dkTOFWwmMM807_eHjTUltMZ6qll_Vrpqx1dVzvOvZQ2Mao-OKlBIUkq_54bxpmJ2ctZT6FU74ejCMhYqbsGw==";

// === LDR Sensor Pin ===
// ⚠️ Replace 2 with a valid ADC pin like 34, 35, 32, 33, etc.
#define LDRPIN 12

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

void loop() {
  int val = analogRead(LDRPIN);  // Read LDR value
  Serial.print("LDR Value: ");
  Serial.println(val);

  sendToInfluxDB(val);

  delay(3000);  // Wait for 3 seconds
}

void sendToInfluxDB(int ldrVal) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(influxUrl);
    http.addHeader("Authorization", "Token " + String(token));
    http.addHeader("Content-Type", "text/plain");

    // InfluxDB Line Protocol: measurement field=value
    String payload = "ldr_reading value=" + String(ldrVal);

    int httpResponseCode = http.POST(payload);
    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);
    
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}
