# Smart Key System - Yamaha R25

Sistem immobilizer berbasis **ESP32 + Bluetooth** untuk keamanan motor Yamaha R25. Motor hanya bisa dinyalakan jika HP pemilik terhubung via Bluetooth.

## Cara Kerja

```
HP Connect Bluetooth  -->  Relay ON   -->  Mesin bisa start
HP Disconnect          -->  10 detik  -->  Relay OFF  -->  Mesin terkunci
```

## Fitur

- **Auto Unlock**: Motor otomatis terbuka saat HP connect Bluetooth
- **Auto Lock**: Motor otomatis terkunci 10 detik setelah HP disconnect
- **PIN Code**: Backup unlock via PIN (default: 1234)
- **Serial Command**: Kontrol via aplikasi Serial Bluetooth Terminal (LOCK, UNLOCK, STATUS, SET_PIN, CHECK_PIN)
- **Persistent Storage**: PIN tersimpan di flash memory (tidak hilang saat restart)

## Komponen

| No | Komponen | Fungsi |
|----|----------|--------|
| 1 | ESP32 DevKit V1 + CP2102 Base Board | Otak sistem + Bluetooth |
| 2 | Relay Module 5V | Saklar otomatis kabel ignition |
| 3 | Buck Converter 12V to 5V | Penurun tegangan dari kunci kontak |
| 4 | Kabel PVC 1.5mm | Kabel power utama |
| 5 | Kabel Jumper Male-to-Male | Kabel sinyal ESP32 |
| 6 | Heat Shrink Tube | Pengunci kabel jumper di pin ESP32 |

## Wiring Diagram

```
[KUNCI KONTAK 12V]
      |
      +---(Cabang)--> [Buck IN+]
      |
      +---(Potong)--> [COM Relay]
                         |
                       [Relay]
                         |
                      [NO Relay] --> [CDI/ECU]

[GND Bodi Motor] ------> [Buck IN-]

[Buck OUT+ (5V)] -------> [VIN ESP32] + [Relay DC+]
[Buck OUT- (GND)] ------> [GND ESP32] + [Relay DC-]

[ESP32 GPIO 14] --------> [Relay IN]
```

## Cara Penggunaan

| Situasi | Cara |
|---------|------|
| Naik motor | Buka app Serial Bluetooth Terminal > Connect ke `R25_SmartKey` > Relay klik > Mesin start |
| Parkir | Disconnect Bluetooth > 10 detik > Relay klik > Mesin terkunci |
| Manual | Ketik `LOCK` atau `UNLOCK` di aplikasi |
| Lupa HP | Ketik `CHECK_PIN:1234` di aplikasi dari HP lain |

## Perintah Bluetooth

| Perintah | Fungsi |
|----------|--------|
| `UNLOCK` | Buka kunci motor |
| `LOCK` | Kunci motor |
| `CHECK_PIN:xxxx` | Unlock dengan PIN |
| `SET_PIN:xxxx` | Ganti PIN |
| `STATUS` | Lihat status motor |
| `H` | Bantuan |

## Teknologi

- **Microcontroller**: ESP32 (Bluetooth Classic SPP)
- **Bahasa**: C++ (Arduino Framework)
- **Library**: BluetoothSerial, Preferences (built-in ESP32)
- **Protokol**: Bluetooth Serial Port Profile (SPP)

## Struktur File

```
proyek maps motor/
|-- Smart_Key_R25_BT_Only/
|   |-- Smart_Key_R25_BT_Only.ino   # Kode utama
|-- gambar/                           # Foto dokumentasi
|-- README.md                         # Dokumentasi ini
|-- PEMASANGAN_TERMUDAH.md           # Panduan pemasangan
|-- INSTALLATION.md                   # Panduan instalasi
|-- WIRING.md                         # Diagram wiring detail
```

## Lisensi

Proyek pribadi oleh Syarafat Syazwan.
