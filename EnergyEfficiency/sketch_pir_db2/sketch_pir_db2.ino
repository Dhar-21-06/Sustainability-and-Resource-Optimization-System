#include <WiFi.h>
#include <HTTPClient.h>

// === WiFi Credentials ===
const char* ssid = "realme narzo 60 Pro 5G";
const char* password = "z6vvs5nk";

// === InfluxDB 2.0 Settings ===
// Replace with your actual PC IP address
const char* influxUrl = "http://192.168.62.194:8086/api/v2/write?org=Tech4earth&bucket=Motion_detection&precision=s";
const char* token = "35dkTOFWwmMM807_eHjTUltMZ6qll_Vrpqx1dVzvOvZQ2Mao-OKlBIUkq_54bxpmJ2ctZT6FU74ejCMhYqbsGw==";

// === PIR Sensor and LED Pins ===
int pirSensorPin = 12;
int ledPin = 14;

void setup() {
  pinMode(pirSensorPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
  delay(1000); // Allow Serial to start

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
    Serial.println("\nFailed to connect to WiFi!");
  }
}

void loop() {
  int motion = digitalRead(pirSensorPin);

  if (motion == HIGH) {
    digitalWrite(ledPin, HIGH);
    Serial.println("Motion detected!");
    sendToInfluxDB(1);
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("No motion.");
    sendToInfluxDB(0);
  }

  delay(5000); // Adjust as needed
}

void sendToInfluxDB(int motionStatus) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(influxUrl);
    http.addHeader("Authorization", "Token " + String(token));
    http.addHeader("Content-Type", "text/plain");

    // Measurement: motion_status | Field: status
    String payload = "motion_status status=" + String(motionStatus);
    int httpResponseCode = http.POST(payload);

    Serial.print("HTTP Response: ");
    Serial.println(httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi not connected!");
  }
}
