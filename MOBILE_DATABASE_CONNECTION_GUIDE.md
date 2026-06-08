# Panduan Menghubungkan Mobile ke Database yang Sama dengan Web

## Masalah
Aplikasi mobile tidak bisa login karena terhubung ke database yang berbeda dengan aplikasi web.

## Solusi

### Langkah 1: Cari IP Address Komputer Anda

#### Windows:
1. Buka **Command Prompt** (CMD)
2. Ketik: `ipconfig`
3. Cari bagian **"Wireless LAN adapter Wi-Fi"** atau **"Ethernet adapter"**
4. Catat **IPv4 Address**, contoh: `192.168.1.100`

#### Mac/Linux:
1. Buka **Terminal**
2. Ketik: `ifconfig` atau `ip addr`
3. Cari interface yang aktif (biasanya `en0` untuk Wi-Fi atau `eth0` untuk Ethernet)
4. Catat **inet address**, contoh: `192.168.1.100`

### Langkah 2: Update Konfigurasi Mobile

File yang sudah diupdate: `mobile/lib/api_service.dart`

Ganti baris berikut dengan IP address komputer Anda:

```dart
static const String baseUrl = 'http://192.168.1.100:3333/api'; // GANTI 192.168.1.100 dengan IP Anda
```

**Contoh:**
- Jika IP komputer Anda: `192.168.0.105`
- Maka ubah menjadi: `http://192.168.0.105:3333/api`

### Langkah 3: Pastikan Backend Berjalan

1. Buka terminal di folder `backend`
2. Jalankan backend:
   ```bash
   npm run dev
   ```
3. Pastikan backend berjalan di port 3333

### Langkah 4: Pastikan Firewall Mengizinkan Koneksi

#### Windows:
1. Buka **Windows Defender Firewall**
2. Klik **"Allow an app through firewall"**
3. Pastikan **Node.js** dicentang untuk **Private** dan **Public** networks

#### Mac:
1. Buka **System Preferences** > **Security & Privacy** > **Firewall**
2. Klik **Firewall Options**
3. Pastikan Node.js diizinkan

### Langkah 5: Testing Koneksi

#### Test dari Browser di HP:
1. Pastikan HP dan komputer terhubung ke **Wi-Fi yang sama**
2. Buka browser di HP
3. Akses: `http://[IP_KOMPUTER]:3333/api/airports`
4. Jika muncul data JSON, koneksi berhasil!

#### Test dari Aplikasi Mobile:
1. Rebuild aplikasi mobile:
   ```bash
   cd mobile
   flutter clean
   flutter pub get
   flutter run
   ```
2. Coba login dengan akun yang sudah terdaftar di web

## Troubleshooting

### Masalah: "Connection refused" atau "Network error"

**Solusi:**
1. Pastikan HP dan komputer di jaringan Wi-Fi yang sama
2. Cek IP address komputer sudah benar
3. Pastikan backend sedang berjalan
4. Cek firewall tidak memblokir port 3333

### Masalah: "Login failed" tapi koneksi berhasil

**Solusi:**
1. Pastikan menggunakan akun yang sudah terdaftar
2. Cek database backend sudah di-seed dengan data user
3. Test login di web terlebih dahulu untuk memastikan akun valid

### Masalah: Masih menggunakan database lokal

**Solusi:**
1. Hapus data aplikasi mobile di HP
2. Uninstall dan install ulang aplikasi
3. Pastikan perubahan di `api_service.dart` sudah tersimpan

## Konfigurasi untuk Berbagai Skenario

### Scenario 1: Testing di Android Emulator
```dart
static const String baseUrl = 'http://10.0.2.2:3333/api';
```

### Scenario 2: Testing di Real Device (HP fisik)
```dart
static const String baseUrl = 'http://192.168.1.100:3333/api'; // Ganti dengan IP komputer
```

### Scenario 3: Testing di iOS Simulator
```dart
static const String baseUrl = 'http://localhost:3333/api';
```

### Scenario 4: Production (Deploy ke server)
```dart
static const String baseUrl = 'https://your-domain.com/api';
```

## Verifikasi Database yang Sama

Untuk memastikan mobile dan web menggunakan database yang sama:

1. **Login di Web** dengan akun tertentu
2. **Login di Mobile** dengan akun yang sama
3. Jika berhasil login di kedua platform, berarti sudah terhubung ke database yang sama!

## Catatan Penting

- **Jangan commit** IP address lokal ke Git
- Untuk production, gunakan environment variables atau config file
- Pastikan backend mengizinkan CORS dari semua origin untuk development

## Bantuan Lebih Lanjut

Jika masih ada masalah, cek:
1. Log backend di terminal
2. Log aplikasi mobile di console
3. Network traffic menggunakan tools seperti Postman atau curl
