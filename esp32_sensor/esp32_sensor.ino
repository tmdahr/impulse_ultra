// Impulse Ultra - ESP32 with MPU6050 Sensor Code
// Connects to WiFi and sends accelerometer data via WebSocket

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Wire.h>
#include <MPU6050.h>

// WiFi credentials - 다른 WiFi 네트워크에서 사용하려면 아래를 수정하세요
const char* ssid = "bssm_free";        // ← 사용할 WiFi 이름 (SSID)
const char* password = "bssm_free";  // ← WiFi 암호

// Server details - 다른 환경에서 사용하려면 서버 IP를 수정하세요
const char* serverIP = "10.150.3.7"; // ← 서버 컴퓨터의 IP 주소
const int serverPort = 3000;         // ← 포트 번호 (그대로 두세요)

// Global objects
MPU6050 mpu;
WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);

  // Initialize MPU6050
  Serial.println("Initializing MPU6050...");
  Wire.begin();
  mpu.initialize();

  if (mpu.testConnection()) {
    Serial.println("MPU6050 connection successful");
  } else {
    Serial.println("MPU6050 connection failed");
    while (1); // Stay here if sensor fails
  }

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected, IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Server IP: ");
  Serial.println(serverIP);

  // Setup WebSocket
  webSocket.begin(serverIP, serverPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);

  Serial.println("WebSocket client started");
}

// Timer for sending data
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 10; // Send every 10ms

void loop() {
  webSocket.loop();

  // Send sensor data at intervals
  if (millis() - lastSendTime > SEND_INTERVAL) {
    if (webSocket.isConnected()) {
      sendSensorData();
      lastSendTime = millis();
    }
  }
}

void sendSensorData() {
  // Read accelerometer data
  int16_t ax, ay, az;
  mpu.getAcceleration(&ax, &ay, &az);

  // Convert to m/s² (rough conversion, adjust calibration as needed)
  float accel_x = ax / 16384.0 * 9.81;
  float accel_y = ay / 16384.0 * 9.81;
  float accel_z = az / 16384.0 * 9.81;

  // Create JSON message
  String message = "{\"type\":\"sensor\",\"accel_x\":" + String(accel_x, 3) +
                   ",\"accel_y\":" + String(accel_y, 3) +
                   ",\"accel_z\":" + String(accel_z, 3) + "}";

  // Send via WebSocket
  webSocket.sendTXT(message);

  // Debug output
  // Serial.println(message);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      break;
    case WStype_TEXT:
      Serial.printf("[WSc] get text: %s\n", payload);
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      break;
    case WStype_ERROR:
      Serial.printf("[WSc] Error!\n");
      break;
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
      Serial.printf("[WSc] Fragment\n");
      break;
  }
}
