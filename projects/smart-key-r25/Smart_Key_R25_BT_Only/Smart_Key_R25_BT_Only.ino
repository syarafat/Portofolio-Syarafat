/*
 * ================================================
 * SMART KEY SYSTEM - Yamaha R25 (BLUETOOTH ONLY)
 * Fitur:
 *   1. Bluetooth HP = UNLOCK otomatis saat connect
 *   2. Auto LOCK 10 detik setelah disconnect
 *   3. PIN Code (default: 1234)
 *   4. PIN Pairing Bluetooth (default: 180921)
 *   5. MAC Address Filter (hanya HP terdaftar)
 * ================================================
 *
 * Wiring:
 *   Relay: IN=26, VCC=5V, GND
 *
 * KEAMANAN:
 *   - PIN Pairing: HP harus masukkan PIN saat pairing
 *   - MAC Filter: Hanya HP yang terdaftar bisa unlock
 *   - Cara daftar HP: Connect BT, ketik REGISTER_HP di Serial Monitor
 *
 * PENTING (Arduino IDE):
 *   - Board: ESP32 Dev Module
 *   - Partition Scheme: Default 4MB with spiffs
 *
 * Library: BluetoothSerial (built-in ESP32)
 */

#include "sdkconfig.h"

#ifndef CONFIG_BT_ENABLED
#error "Bluetooth Classic tidak aktif! Pastikan board ESP32 Dev Module dipilih."
#endif

#ifndef CONFIG_BLUEDROID_ENABLED
#error "Bluedroid tidak aktif! Pastikan board ESP32 Dev Module dipilih."
#endif

#include <Preferences.h>

// Suppress deprecation warning for BluetoothSerial in ESP32 board v3.x
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"
#include <BluetoothSerial.h>

#define RELAY_PIN 26

const char* BT_NAME = "R25_SmartKey";
const char* BT_PIN_CODE = "180921";  // PIN pairing Bluetooth (6 digit)
const unsigned long AUTO_LOCK_DELAY = 10000;
const int MAX_HP = 3;  // Maksimal 3 HP terdaftar

BluetoothSerial SerialBT;
Preferences prefs;

bool isUnlocked = false;
bool btConnected = false;
unsigned long btDisconnectTime = 0;
String pinCode = "1234";

// MAC Address HP terdaftar
String registeredMAC[MAX_HP];
int hpCount = 0;
String currentMAC = "";  // MAC HP yang sedang connect

// ==================== HELPER FUNCTIONS ====================

String macToString(const uint8_t *mac) {
  char buf[18];
  snprintf(buf, sizeof(buf), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(buf);
}

bool isMACRegistered(String mac) {
  for (int i = 0; i < hpCount; i++) {
    if (registeredMAC[i] == mac) return true;
  }
  return false;
}

// ==================== SETUP ====================

void setup() {
  Serial.begin(115200);
  delay(500);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);

  // Bluetooth dengan PIN pairing
  SerialBT.begin(BT_NAME);
  SerialBT.setPin(BT_PIN_CODE, strlen(BT_PIN_CODE));
  SerialBT.register_callback(btCallback);
  Serial.println("Bluetooth ready: " + String(BT_NAME));
  Serial.println("PIN Pairing: " + String(BT_PIN_CODE));

  // Load data tersimpan
  loadData();

  Serial.println("\n=== SMART KEY R25 - SECURE ===");
  Serial.println("PIN Code: " + pinCode);
  Serial.println("HP terdaftar: " + String(hpCount));
  for (int i = 0; i < hpCount; i++) {
    Serial.println("  HP " + String(i + 1) + ": " + registeredMAC[i]);
  }
  Serial.println("System ready!");
  Serial.println("Ketik H untuk bantuan.");
}

// ==================== LOOP ====================

void loop() {
  readBluetooth();
  readSerial();
  checkAutoLock();
  delay(50);
}

// ==================== RELAY ====================

void unlockRelay() {
  if (!isUnlocked) {
    isUnlocked = true;
    digitalWrite(RELAY_PIN, HIGH);
    Serial.println(">> UNLOCKED");
    SerialBT.println("UNLOCKED - Motor siap dinyalakan!");
  }
}

void lockRelay() {
  if (isUnlocked) {
    isUnlocked = false;
    digitalWrite(RELAY_PIN, LOW);
    Serial.println(">> LOCKED");
    SerialBT.println("LOCKED - Mesin dikunci!");
  }
}

// ==================== BLUETOOTH CALLBACK ====================

void btCallback(esp_spp_cb_event_t event, esp_spp_cb_param_t *param) {
  if (event == ESP_SPP_SRV_OPEN_EVT) {
    // Ambil MAC address HP yang connect
    const uint8_t *mac = param->srv_open.rem_bda;
    currentMAC = macToString(mac);

    btConnected = true;
    btDisconnectTime = 0;
    Serial.println("[BT] Connected dari: " + currentMAC);

    // Cek apakah HP terdaftar
    if (hpCount == 0) {
      Serial.println("[BT] Belum ada HP terdaftar!");
      Serial.println("[BT] Ketik REGISTER_HP di Serial Monitor untuk daftarkan HP ini.");
      SerialBT.println("HP belum terdaftar. Minta pemilik daftarkan HP ini.");
    }
    else if (isMACRegistered(currentMAC)) {
      Serial.println("[BT] HP terdaftar - UNLOCK!");
      unlockRelay();
    }
    else {
      Serial.println("[BT] HP TIDAK TERDAFTAR! MAC: " + currentMAC);
      SerialBT.println("DITOLAK - HP ini tidak terdaftar!");
      delay(1000);
      SerialBT.disconnect();
    }
  }

  if (event == ESP_SPP_CLOSE_EVT) {
    btConnected = false;
    btDisconnectTime = millis();
    currentMAC = "";
    Serial.println("[BT] Disconnected - countdown auto lock 10 detik...");
  }
}

// ==================== REGISTER HP ====================

void registerHP(String mac) {
  if (isMACRegistered(mac)) {
    Serial.println(">> HP sudah terdaftar: " + mac);
    return;
  }

  if (hpCount >= MAX_HP) {
    Serial.println(">> HP penuh (maks " + String(MAX_HP) + ")!");
    return;
  }

  registeredMAC[hpCount] = mac;
  hpCount++;

  prefs.begin("smartkey", false);
  prefs.putInt("hp_count", hpCount);
  for (int i = 0; i < hpCount; i++) {
    prefs.putString(("hp_" + String(i)).c_str(), registeredMAC[i]);
  }
  prefs.end();

  Serial.println(">> HP TERDAFTAR: " + mac);
  Serial.println(">> Total HP: " + String(hpCount));
  SerialBT.println("HP kamu berhasil didaftarkan!");

  unlockRelay();
}

void removeAllHP() {
  hpCount = 0;
  for (int i = 0; i < MAX_HP; i++) {
    registeredMAC[i] = "";
  }

  prefs.begin("smartkey", false);
  prefs.putInt("hp_count", 0);
  for (int i = 0; i < MAX_HP; i++) {
    prefs.remove(("hp_" + String(i)).c_str());
  }
  prefs.end();

  Serial.println(">> Semua HP dihapus!");
}

// ==================== SERIAL MONITOR ====================

void readSerial() {
  String data = "";
  while (Serial.available()) {
    data += (char)Serial.read();
    delay(10);
  }
  data.trim();
  data.toUpperCase();

  if (data.length() == 0) return;

  if (data == "REGISTER_HP") {
    if (currentMAC.length() > 0) {
      registerHP(currentMAC);
    } else {
      Serial.println(">> Tidak ada HP yang connect! Connect HP dulu via Bluetooth.");
    }
  }
  else if (data == "LIST_HP") {
    Serial.println("=== HP TERDAFTAR ===");
    for (int i = 0; i < hpCount; i++) {
      Serial.println("  " + String(i + 1) + ". " + registeredMAC[i]);
    }
    Serial.println("Total: " + String(hpCount));
  }
  else if (data == "RESET_HP") {
    removeAllHP();
  }
  else if (data == "H" || data == "HELP") {
    Serial.println("=== PERINTAH SERIAL ===");
    Serial.println("REGISTER_HP  -> Daftarkan HP yang sedang connect");
    Serial.println("LIST_HP      -> Lihat daftar HP terdaftar");
    Serial.println("RESET_HP     -> Hapus semua HP terdaftar");
    Serial.println("H            -> Bantuan");
    Serial.println("========================");
  }
}

// ==================== BLUETOOTH COMMAND ====================

void readBluetooth() {
  String data = "";
  while (SerialBT.available()) {
    data += (char)SerialBT.read();
    delay(10);
  }
  data.trim();

  if (data.length() == 0) return;

  // Cek apakah HP terdaftar sebelum proses command
  if (!isMACRegistered(currentMAC)) {
    SerialBT.println("DITOLAK - HP tidak terdaftar!");
    return;
  }

  int colonIndex = data.indexOf(":");
  String command, value;

  if (colonIndex > 0) {
    command = data.substring(0, colonIndex);
    command.toUpperCase();
    value = data.substring(colonIndex + 1);
  } else {
    command = data;
    command.toUpperCase();
  }

  if (command == "UNLOCK") {
    unlockRelay();
  }
  else if (command == "LOCK") {
    lockRelay();
  }
  else if (command == "SET_PIN" && value.length() >= 4) {
    pinCode = value;
    prefs.begin("smartkey", false);
    prefs.putString("pin", pinCode);
    prefs.end();
    SerialBT.println("PIN berhasil diubah menjadi: " + pinCode);
  }
  else if (command == "SET_PIN" && value.length() < 4) {
    SerialBT.println("PIN minimal 4 digit!");
  }
  else if (command == "CHECK_PIN" && value == pinCode) {
    unlockRelay();
    SerialBT.println("PIN benar - UNLOCKED!");
  }
  else if (command == "CHECK_PIN") {
    SerialBT.println("PIN salah!");
  }
  else if (command == "STATUS") {
    SerialBT.println("=== STATUS ===");
    SerialBT.println("Motor: " + String(isUnlocked ? "UNLOCKED" : "LOCKED"));
    SerialBT.println("BT: " + String(btConnected ? "Connected" : "Disconnected"));
    SerialBT.println("HP: " + currentMAC);
    SerialBT.println("====");
  }
  else if (command == "H" || command == "HELP") {
    SerialBT.println("=== PERINTAH ===");
    SerialBT.println("UNLOCK        -> Buka kunci motor");
    SerialBT.println("LOCK          -> Kunci motor");
    SerialBT.println("CHECK_PIN:xxx -> Unlock dengan PIN");
    SerialBT.println("SET_PIN:xxx   -> Ganti PIN");
    SerialBT.println("STATUS        -> Lihat status");
    SerialBT.println("===============");
  }
  else {
    SerialBT.println("Perintah tidak dikenal. Ketik H untuk bantuan.");
  }
}

// ==================== AUTO LOCK ====================

void checkAutoLock() {
  if (!btConnected && btDisconnectTime > 0 && isUnlocked) {
    if (millis() - btDisconnectTime > AUTO_LOCK_DELAY) {
      lockRelay();
      Serial.println(">> AUTO LOCK (BT disconnect timeout)");
      btDisconnectTime = 0;
    }
  }
}

// ==================== LOAD DATA ====================

void loadData() {
  prefs.begin("smartkey", true);
  pinCode = prefs.getString("pin", "1234");
  hpCount = prefs.getInt("hp_count", 0);

  for (int i = 0; i < MAX_HP && i < hpCount; i++) {
    registeredMAC[i] = prefs.getString(("hp_" + String(i)).c_str(), "");
  }
  prefs.end();
}

#pragma GCC diagnostic pop
