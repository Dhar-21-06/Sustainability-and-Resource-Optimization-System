#define PIR_PIN 2        // Digital input from PIR sensor
#define LED_PIN 5        // Digital output to LED

unsigned long motionStartTime = 0;
bool motionActive = false;
const unsigned long motionDuration = 12000; // 12 seconds

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int pirValue = digitalRead(PIR_PIN);
  unsigned long currentTime = millis();

  Serial.print("PIR Value: ");
  Serial.println(pirValue);

  // If motion detected, start 12-second timer
  if (pirValue == HIGH) {
    motionStartTime = currentTime;
    motionActive = true;
    Serial.println("Motion detected → LED ON for 12 seconds");
  }

  // Keep LED ON for the motion duration
  if (motionActive && (currentTime - motionStartTime < motionDuration)) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    motionActive = false;
    digitalWrite(LED_PIN, LOW);
    Serial.println("No motion → LED OFF");
  }

  delay(500);
}
