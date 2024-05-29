#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <Servo.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

const char *ssid = "Redmi";
const char *password = "";
const char *mqtt_server = "be4122922e5f4e8b8873c2ff4ab99465.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char *mqtt_user = "USER";
const char *mqtt_password = "PASSWORD";

BearSSL::WiFiClientSecure espClient;
PubSubClient client(espClient);

const int key1Pin = D6;
const int key2Pin = D5;
const int key3Pin = D4;
const int key4Pin = D7;

StaticJsonDocument<2048> schedulesDoc; // Increased the size for larger schedules
JsonArray schedules;
size_t currentScheduleIndex = 0;
bool schedulesAvailable = false;

const char *daysOfWeek[] = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

const char *serverUrl = "https://fishfeeder-1-a4359990.deta.app/";

Servo servo;

void setup()
{
  Serial.begin(115200);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;)
      ;
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);

  pinMode(key1Pin, INPUT_PULLUP);
  pinMode(key2Pin, INPUT_PULLUP);
  pinMode(key3Pin, INPUT_PULLUP);
  pinMode(key4Pin, INPUT_PULLUP);

  servo.attach(D3);
  servo.write(10);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  espClient.setInsecure(); // For testing only, use proper certificate validation in production
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  connectMQTT();

  // Show home screen initially
  showHomeScreen();
}

void loop()
{
  client.loop();

  if (digitalRead(key1Pin) == LOW)
  {
    Serial.println("1");
    feedNow(10);
    delay(200);
  }
  else if (digitalRead(key2Pin) == LOW)
  {
    Serial.println("2");
    if (schedulesAvailable)
    {
      showNextSchedule();
    }
    else
    {
      display.clearDisplay();
      display.setCursor(0, 0);
      display.setTextSize(1);
      display.print("Getting schedules...");
      display.display();
      disconnectMQTTAndFetchSchedules();
    }
    delay(200);
  }
  else if (digitalRead(key3Pin) == LOW)
  {
    Serial.println("3");
    if (schedulesAvailable)
    {
      // toggleScheduleActiveStatus();
      disconnectMQTTAndToggleSchedules();
    }
    else
    {
      display.clearDisplay();
      display.setCursor(0, 20);
      display.setTextSize(1);
      display.print("No schedules to update.");
      display.display();
    }
    delay(200);
  }
  else if (digitalRead(key4Pin) == LOW)
  {
    Serial.println("4");
    display.clearDisplay();
    resetToHomeScreen();
    delay(200);
  }
}

void sendFeedingLog(int qty)
{
  BearSSL::WiFiClientSecure httpsClient;
  httpsClient.setInsecure(); // For testing only, use proper certificate validation in production

  HTTPClient https;
  String serverUrl = "https://fishfeeder-1-a4359990.deta.app/update-log/" + String(qty);

  Serial.print("[HTTPS] begin...\n");
  if (https.begin(httpsClient, serverUrl))
  { // HTTPS
    Serial.print("[HTTPS] GET...\n");
    int httpCode = https.GET();

    Serial.print("HTTP Code: ");
    Serial.println(httpCode);

    if (httpCode > 0)
    {
      String payload = https.getString();
      Serial.println("HTTP Response: ");
      Serial.println(payload);
    }
    else
    {
      Serial.println("Error on HTTP request");
      Serial.print("HTTP Error Code: ");
      Serial.println(httpCode);
    }

    https.end();
  }
  else
  {
    Serial.printf("[HTTPS] Unable to connect\n");
  }
}

void feedNow(int qty)
{
  display.clearDisplay();
  display.setCursor(10, 0);
  display.setTextSize(1);
  display.printf("~Fish Feeder~");
  display.setCursor(0, 20);
  display.setTextSize(2);
  display.printf("Feeding...");
  display.setCursor(0, 40);
  display.printf("QTY: %d", qty);
  display.display();
  int loops = (qty + 9) / 10;

  for (int i = 0; i < loops; i++)
  {
    servo.write(160);
    delay(600);
    servo.write(10);
    delay(500);
  }

  showHomeScreen();
}

void disconnectMQTTAndFetchSchedules()
{
  Serial.println("Disconnecting from MQTT...");
  client.disconnect();
  fetchSchedules();
  connectMQTT();
}

void disconnectMQTTAndToggleSchedules()
{
  Serial.println("Disconnecting from MQTT...");
  client.disconnect();
  toggleScheduleActiveStatus();
  connectMQTT();
}

void fetchSchedules()
{
  BearSSL::WiFiClientSecure httpsClient;
  httpsClient.setInsecure(); // For testing only, use proper certificate validation in production

  HTTPClient https;
  const char *serverUrl = "https://fishfeeder-1-a4359990.deta.app/schedules";

  Serial.print("[HTTPS] begin...\n");
  if (https.begin(httpsClient, serverUrl))
  { // HTTPS
    Serial.print("[HTTPS] GET...\n");
    int httpCode = https.GET();

    Serial.print("HTTP Code: ");
    Serial.println(httpCode);

    if (httpCode > 0)
    {
      String payload = https.getString();
      Serial.println("HTTP Response: ");
      Serial.println(payload);

      DeserializationError error = deserializeJson(schedulesDoc, payload);
      if (error)
      {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.f_str());
        return;
      }

      schedules = schedulesDoc.as<JsonArray>();
      currentScheduleIndex = 0;
      schedulesAvailable = true;
      showNextSchedule();
    }
    else
    {
      Serial.println("Error on HTTP request");
      Serial.print("HTTP Error Code: ");
      Serial.println(httpCode);
    }

    https.end();
  }
  else
  {
    Serial.printf("[HTTPS] Unable to connect\n");
  }
}

void connectMQTT()
{
  while (!client.connected())
  {
    Serial.println("Connecting to MQTT...");
    if (client.connect("ESP8266Client", mqtt_user, mqtt_password))
    {
      Serial.println("Connected to MQTT");
      client.subscribe("feed");
    }
    else
    {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void showNextSchedule()
{
  if (currentScheduleIndex < schedules.size())
  {
    JsonObject schedule = schedules[currentScheduleIndex];
    const char *quantity = schedule["quantity"];
    JsonObject time = schedule["time"];
    int hour = time["hour"];
    int minute = time["minute"];
    bool active = schedule["active"];
    JsonArray daysArray = time["dayOfWeek"];

    display.clearDisplay();
    display.setCursor(0, 0);
    display.setTextSize(1);
    display.print("Schedule ");
    display.print(currentScheduleIndex + 1);
    display.setCursor(0, 17);
    display.print("Active: ");
    display.print(active ? "Yes" : "No");
    display.setCursor(0, 27);
    display.printf("Qty: %s", quantity);
    display.setCursor(0, 37);
    display.printf("Time: %02d:%02d", hour, minute);
    display.setCursor(0, 47);
    display.print("Days: ");
    display.setCursor(5, 57);
    for (int i = 0; i < daysArray.size(); i++)
    {
      int dayIndex = daysArray[i].as<int>() - 1; // Adjusting for 0-based indexing
      if (dayIndex >= 0 && dayIndex < 7)
      {
        display.print(daysOfWeek[dayIndex]);
        if (i < daysArray.size() - 1)
          display.print(", ");
      }
    }
    display.display();

    currentScheduleIndex++;
  }
  else
  {
    // All schedules displayed, reset
    schedulesAvailable = false;
    currentScheduleIndex = 0;
    showHomeScreen();
  }
}

void showHomeScreen()
{
  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.print("Home");
  display.setCursor(40, 20); // Position might need adjustment based on your display
  display.setTextSize(2);
  display.print("FISH");
  display.setCursor(30, 40);
  display.print("FEEDER");
  display.display();
  // connectMQTT();
}

void resetToHomeScreen()
{
  schedulesDoc.clear();
  schedules = schedulesDoc.to<JsonArray>();
  currentScheduleIndex = 0;
  schedulesAvailable = false;
  showHomeScreen();
}

void toggleScheduleActiveStatus()
{
  if (currentScheduleIndex == 0 || currentScheduleIndex > schedules.size())
  {
    return;
  }

  JsonObject schedule = schedules[currentScheduleIndex - 1];
  const char *scheduleId = schedule["id"];
  bool currentActiveStatus = schedule["active"];
  bool newActiveStatus = !currentActiveStatus;

  display.clearDisplay();
  display.setCursor(0, 0);
  display.setTextSize(1);
  display.print("Updating status...");
  display.display();

  // client.disconnect();

  BearSSL::WiFiClientSecure httpsClient;
  httpsClient.setInsecure(); // For testing only, use proper certificate validation in production

  HTTPClient https;
  String serverUrl = "https://fishfeeder-1-a4359990.deta.app/schedules/";
  serverUrl += scheduleId;
  serverUrl += "/status";

  StaticJsonDocument<200> updateDoc;
  updateDoc["active"] = newActiveStatus;
  String requestBody;
  serializeJson(updateDoc, requestBody);

  Serial.print("[HTTPS] begin...\n");
  if (https.begin(httpsClient, serverUrl))
  { // HTTPS
    https.addHeader("Content-Type", "application/json");
    int httpCode = https.PUT(requestBody);

    Serial.print("HTTP Code: ");
    Serial.println(httpCode);

    if (httpCode > 0)
    {
      String payload = https.getString();
      Serial.println("HTTP Response: ");
      Serial.println(payload);

      if (httpCode == HTTP_CODE_OK)
      {
        schedule["active"] = newActiveStatus;
        display.clearDisplay();
        display.setCursor(0, 0);
        display.setTextSize(1);
        display.print("Status updated!");
        display.display();
        delay(2000);
        showNextSchedule();
      }
      else
      {
        display.clearDisplay();
        display.setCursor(0, 0);
        display.setTextSize(1);
        display.print("Update failed!");
        display.display();
        delay(2000);
      }
    }
    else
    {
      Serial.println("Error on HTTP request");
      Serial.print("HTTP Error Code: ");
      Serial.println(httpCode);
    }

    https.end();
  }
  else
  {
    Serial.printf("[HTTPS] Unable to connect\n");
  }

  // connectMQTT();
}

void callback(char *topic, byte *payload, unsigned int length)
{
  String message;
  for (unsigned int i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  Serial.println(message);

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if (error)
  {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char *feed = doc["feed"];
  int quantity = doc["quantity"];

  if (strcmp(feed, "yes") == 0)
  {
    feedNow(quantity);
    StaticJsonDocument<200> resetDoc;
    resetDoc["feed"] = "no";
    String resetMessage;
    serializeJson(resetDoc, resetMessage);
    client.publish("feed", resetMessage.c_str());
    showHomeScreen();
  }
}
